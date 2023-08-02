const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const config = require("../config/config");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const { default: mongoose } = require("mongoose");
const { pipeline } = require("nodemailer/lib/xoauth2");
const Category = require("../models/categoryModel");
const { all } = require("promise");
const { log, logger } = require("handlebars/runtime");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);

    return passwordHash;
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

// to send verify mail
const sendverifyMail = async (name, email, userId) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      prot: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.ADMIN_EMAIL,
        pass: config.APP_PASSWORD,
      },
    });
    const mailOptions = {
      from: "mohammedsharbas33@gmail.com",
      to: email,
      subject: "for verification mail",
      html:
        "<p>hi" +
        name +
        ',please click here to <a href="www.nutrifreshfruit.website/verify?id=' +
        userId +
        '">verify</a>your mail.</p>',
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent:-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

//to load signup page
const signupLoad = async (req, res) => {
  try {
    res.render("signup");
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

//to insert the data of user from signup
const insertUser = async (req, res) => {
  try {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (req.body.Password === req.body.rePassword) {
      // Check if the password meets strong password criteria
      if (!strongPasswordRegex.test(req.body.Password)) {
        return res.render("signup", {
          message:
            "Your password must contain at least 8 characters, including uppercase and lowercase letters, numbers, and special characters.",
        });
      }

      // Check if the email already exists in the database
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.render("signup", {
          message:
            "Email address already exists. Please use a different email or login.",
        });
      }

      const spassword = await securePassword(req.body.Password);

      let characters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let referralCode = "";

      for (let i = 0; i < 20; i++) {
        let randomIndex = Math.floor(Math.random() * characters.length);
        referralCode += characters.charAt(randomIndex);
      }

      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: spassword,
        isVerified: 0,
        is_admin: 0,
        otp: "",
        referralCode: referralCode,
      });

      const userData = await user.save();

      if (req.body.referralCode) {
        const enteredReferralCode = req.body.referralCode;
        const referredUser = await User.findOne({
          referralCode: enteredReferralCode,
        });

        if (referredUser) {
          referredUser.wallet += 100;
          referredUser.referralCodeUsed = 1;
          await referredUser.save();
        }
      }

      if (userData) {
        sendverifyMail(req.body.name, req.body.email, userData._id);
        res.render("login");
      } else {
        res.render("signup", { message: "Your registration is failed" });
      }
    } else {
      res.render("signup", { message: "Your password is not matching" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

//to verify mail
const verifyMail = async (req, res) => {
  try {
    const updateInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { isVerified: 1 } }
    );

    res.render("emailVerified");
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

//to load login page
const loginLoad = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

//to login Verify
const loginVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.isVerified == 1) {
          if (userData.isBlock === false) {
            req.session.userId = userData._id;
            res.redirect("/home");
          } else {
            res.render("login", { message: "you are blocked" });
          }
        } else {
          res.render("login", { message: "please verify your mail" });
        }
      } else {
        res.render("login", { message: "password is wrong" });
      }
    } else {
      res.render("login", { message: "incorrect login credentials!" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

//to load home page
const loadHome = async (req, res) => {
  try {
    const productData = await Product.find({});
    const userCartData = await Cart.findOne({ userId: req.session.userId });
    res.render("home", { productData: productData, userCartData });
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

//to reset password , email entering page
const resetPasswordEmailLoad = async (req, res) => {
  try {
    res.render("resetPasswordEmail");
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

//to send otp to mail
const sentOtpToMail = async (name, email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      prot: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.ADMIN_EMAIL,
        pass: config.APP_PASSWORD,
      },
    });
    const mailOptions = {
      from: "mohammedsharbas33@gmail.com",
      to: email,
      subject: "otp for verifying your email",
      html: `<p> hi ${name},Use this otp ${otp} to reset your password</p>`,
      text: `hi ${name},Use this otp ${otp} to reset your password`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("otp has been sent:-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

//to check mail and sending otp
const mailCheckSentOtp = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      const userOtpSave = await User.updateOne(
        { email: email },
        { $set: { otp: otp } }
      );
      sentOtpToMail(userData.name, userData.email, otp);
      req.session.email = email;
      res.redirect("/otpPage");
    } else {
      res.render("resetPasswordEmail", {
        message: "your mail is not valid, enter a valid mail",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

//to load otp page
const otpPageLoad = async (req, res) => {
  try {
    res.render("otpPage");
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

//checking the given otp and db otp
const loadIntoResetPassword = async (req, res) => {
  try {
    const email = req.session.email;
    const otpcheck = req.body.OTP;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.otp == otpcheck) {
        res.redirect("/resetPassword");
      }
    } else {
      res.render("otpPage", { message: "wrong otp" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

//to load reset password page
const resetPasswordLoad = async (req, res) => {
  try {
    res.render("resetPassword");
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

//to update password
const updatePassword = async (req, res) => {
  try {
    const email = req.session.email;
    const newPassword = req.body.Password;
    const rePassword = req.body.rePassword;
    if (newPassword === rePassword) {
      const userData = await User.findOne({ email: email });
      if (userData) {
        const spassword = await securePassword(newPassword);
        const updatePass = await User.updateOne(
          { email: email },
          { $set: { password: spassword } }
        );
        if (updatePass) {
          res.redirect("/login");
        }
      }
    } else {
      res.render("resetPassword", { message: "password is not matching" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

// for logout
const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

// to load user profile
const userProfile = async (req, res) => {
  try {
    const id = req.session.userId;

    const userData = await User.findOne({ _id: id });
    const userCartData = await Cart.findOne({ userId: req.session.userId });

    if (userData) {
      res.render("profile", { userData: userData, userCartData });
    }
  } catch (error) {
    console.log(error.message);
    // res.render('404')
  }
};

//to add address for user profile
const profileAddressAdd = async (req, res) => {
  try {
    const id = req.session.userId;
    const user = await User.findOne({ _id: id });

    user.address.push({
      addressType: req.body.type,

      city: req.body.city,
      district: req.body.district,
      state: req.body.state,
      zip: req.body.zip,
      country: req.body.country,
    });

    await user.save();
    res.redirect("/profile");
  } catch (error) {
    console.log(error);
    res.render("404");
  }
};

//to profile edit
const profileEdit = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, email, mobile } = req.body;

    await User.updateOne(
      { _id: userId },
      { $set: { name, email, phone: mobile } }
    );

    res.redirect("/profile");
  } catch (error) {
    console.log(error);
    res.render("404");
  }
};

//to edit address

const editAddress = async (req, res) => {
  try {
    const { addressId } = req.query;
    // console.log("req.query",req.query);
    // console.log(" req.body", req.body.etype);
    // console.log(" req.body2", req.body.city);
    // const { adtype, adcity, addistrict, adstate, adzip, adcountry } = req.body;
    // console.log(req.body.adtype)
    const user = await User.findOne({ "address._id": addressId });
    const addressIndex = user.address.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    user.address[addressIndex].addressType = req.body.etype;
    // user.address[addressIndex].address = adaddress;
    user.address[addressIndex].city = req.body.city;
    user.address[addressIndex].district = req.body.district;
    user.address[addressIndex].state = req.body.state;
    user.address[addressIndex].zip = req.body.zip;
    user.address[addressIndex].country = req.body.country;

    await user.save(); // Save the updated user document

    res.redirect("/profile");
  } catch (error) {
    console.log(error);
    res.render("404");
  }
};

const deleteAddress = async (req, res) => {
  try {
    const addressIndex = req.body.addressIndex;
    console.log("addressIndex", addressIndex);
    const userId = req.session.userId;
    console.log("userId", userId);
    const user = await User.findOne({ _id: userId });
    console.log("user", user);
    user.address.splice(addressIndex, 1);
    await user.save();
    res.redirect("/profile");
  } catch (error) {
    console.log(error);
    res.render("404");
  }
};

// const addToCart = async (req, res) => {
//   try {
//     const prodId = req.query.id;
//     const userId = req.session.userId;
//     const kg = 1;
//     // console.log('ith id:',prodId)

//     let userCart = await Cart.findOne({ userId: userId });
//     if (!userCart) {
//       let newCart = new Cart({ userId: userId, product: [] });
//       await newCart.save();
//       userCart = newCart;
//     }
//     console.log(userCart);
//     const existingproductindex = userCart?.product.findIndex(
//       (product) => product.productId == prodId && product.kg == kg
//     );
//     var product = await Product.findOne({ _id: prodId });
//     if (existingproductindex === -1) {
//       userCart.product.push({
//         productId: prodId,
//         kg: 1,
//         total: product.price,
//       });
//       userCart.grandTotal += product.price;
//     } else {
//       console.log("it is here");
//       userCart.product[existingproductindex].kg += 1;
//       userCart.product[existingproductindex].total += product.price;
//       userCart.grandTotal += product.price;
//     }
//     const c = await userCart.save();
//     res.redirect("/home");
//   } catch (error) {
//     console.log(error.message);
//     res.render("404");
//   }
// };

// const getCart = async (req, res) => {

//   console.log("enghott vanittund");
//   const cart = await Cart.findOne({ userId: req.session.userId });

//   try {
//     const pipeline = [
//       {
//         $match: { userId: new mongoose.Types.ObjectId(req.session.userId) },
//       },
//       { $unwind: "$product" },
//       {
//         $lookup: {
//           from: "Products",
//           localField: "product.productId",
//           foreignField: "_id",
//           as: "productData",
//         },
//       },
//       { $unwind:"$productData", },
//       {
//         $project: {
//           _id: 0,
//           productId: "$productData._id",
//           price: "$productData.price",
//           description: "$prodcutData.productDescription",
//           category: "$productData.categoryName",
//           image: { $arrayElemAt: ["$productData.productImage", 0] },
//           stock: "$productData.stock",
//           kg: "$product.kg",
//           total: { $multiply: ["$product.kg", "$productData.price"] },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           products: { $push: "$$ROOT" },
//           grandTotal: { $sum: "$total" },
//         },
//       },
//     ];

//     const cart2 = await Cart.aggregate(pipeline);
//     console.log("evidayum avan");
//     console.log("full cart:", cart2);
//     if (cart2.length > 0) {
//       console.log("hello evidae indd");
//       const { _id, products, grandTotal } = cart2[0];
//       let shippingCharge = 0;
//       if (grandTotal < 1000) {
//         shippingCharge = 100;
//       }
//       console.log("cart without array:", cart2[0]);
//       console.log("ladies and gentelman we got him");
//       res.render("cart", {
//         products: "",
//         total: "",
//         shipping: shippingCharge,
//       });
//     } else {

//       res.render("cart", {
//         message: "your cart is empty",
//         products: "",
//         total: "",
//         shipping: "",
//       });
//     }
//   } catch (error) {
//     console.log(error.message);
//     res.render("404");
//   }
// };

const getShop = async (req, res) => {
  try {
    const ITEMS_PER_PAGE = 6;
    const page = parseInt(req.query.page) || 1;
    const skipItems = (page - 1) * ITEMS_PER_PAGE;
    const totalCount = await Product.countDocuments();
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    const allProducts = await Product.find({})
      .skip(skipItems)
      .limit(ITEMS_PER_PAGE);
    const allcategory = await Category.find({});
    const userCartData = await Cart.findOne({ userId: req.session.userId });

    // Check if userCartData is null and initialize it to an empty object
    const cartData = userCartData || {};

    res.render("shop", {
      allProducts,
      allcategory,
      currentPage: page,
      totalPages,
      userCartData: cartData, // Pass cartData to the view
    });
  } catch (error) {
    console.log(error);
    res.render("404");
  }
};

const getCategory = async (req, res) => {
  try {
    const ITEMS_PER_PAGE = 6;
    const categoryname = req.query.name;
    // console.log('categoryname',categoryname);
    const page = parseInt(req.query.page) || 1;
    const skipItems = (page - 1) * ITEMS_PER_PAGE;
    const totalCount = await Product.countDocuments();
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    const allProducts = await Product.find({ categoryName: categoryname })
      .skip(skipItems)
      .limit(ITEMS_PER_PAGE);

    const category = await Category.find({
      categoryName: allProducts[0].categoryName,
    });

    // const product=await Product.findOne({})
    const userCartData = await Cart.findOne({ userId: req.session.userId });
    const allcategory = await Category.find({});
    const selectedCategory = await Category.find({
      categoryName: categoryname,
    });

    res.render("category", {
      allProducts,
      allcategory: allcategory,
      selectedCategory: selectedCategory,
      currentPage: page,
      totalPages: totalPages,
      userCartData,
      category,
    });
  } catch (error) {
    console.log(error);
    res.render("404");
  }
};

const singleProductLoad = async (req, res) => {
  try {
    const productId = req.query.id;

    const singleProduct = await Product.findOne({ _id: productId });

    const allProducts = await Product.find({});
    const userCartData = await Cart.findOne({ userId: req.session.userId });

    res.render("single-product", {
      singleProduct: singleProduct,
      allProducts: allProducts,
      userCartData,
    });
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.session.userId;
    const productId = req.body.productId;
    const count = parseInt(req.body.count);

    const myCart = await Cart.findOne({ userId: req.session.userId });
    const product = await Product.findOne({ _id: productId });

    if (myCart) {
      const existingProductIndex = myCart.product.findIndex(
        (product) => product.productId == productId
      );

      if (existingProductIndex == -1) {
        myCart.product.push({
          productId: productId,
          kg: 1,
          total: product.offerPrice,
          price: product.price,
        });

        myCart.grandTotal += product.offerPrice;
        await myCart.save();
      } else {
        myCart.product[existingProductIndex].kg += count;
        myCart.product[existingProductIndex].total += product.offerPrice;
        myCart.grandTotal += product.offerPrice;
        await myCart.save();
      }
    } else {
      const newCart = new Cart({
        product: [
          {
            productId: productId,
            kg: 1,
            total: product.offerPrice,
            price: product.price,
          },
        ],
        userId: userId,
        grandTotal: product.offerPrice,
      });
      await newCart.save();
    }
    res.json({ message: "Product added to cart" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "An error occurred while adding the product to the cart",
    });
  }
};

const deleteItem = async (req, res) => {
  try {
    const index = req.query.index;
    const cart = await Cart.findOne({ userId: req.session.userId });
    cart.grandTotal -= cart.product[index].total;

    await cart.save();

    const deleteProduct = cart.product.splice(index, 1);

    if (cart.product.length == 0) {
      const deleteCart = Cart.deleteOne({ userId: req.session.userId });

      // console.log('deleteCart.product.total',deleteCart.product[index].total);
    }
    await cart.save();

    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.session.userId;
    let userCartData = await Cart.findOne({ userId: userId })
      .populate("product.productId")
      .lean()
      .exec();
   
    if (!userCartData) {
      userCartData = null; // Set userCartData to null if it's null or empty
    }
    
    const productId = userCartData?.product?.map((data) => {
      return {
        id: data.productId?._id.toString(),
      };
    });

    let totalPrice = 0;
    var ProductPrice = [];

    if (userCartData?.product && userCartData.product.length > 0) {
      for (let i = 0; i < userCartData.product.length; i++) {
        ProductPrice[i] =
          userCartData.product[i].productId.offerPrice *
          userCartData.product[i].kg;
        totalPrice += ProductPrice[i];
      }
    }

    res.render("cart", { userCartData, totalPrice, ProductPrice, productId });
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

//controller for updatekg
const updateKg = async (req, res) => {
  try {
    const userId = req.session.userId;
    const productIndexInCart = req.body.productId;
    const count = req.body.count;

    // Find the user's cart
    const cart = await Cart.findOne({ userId: userId });
    const productId = cart.product[productIndexInCart].productId;
    const product = await Product.findOne({ _id: productId });

    if (cart.product[productIndexInCart].kg < count) {
      cart.product[productIndexInCart].total += product.offerPrice;

      cart.grandTotal += product.offerPrice;
    } else if (cart.product[productIndexInCart].kg > count) {
      cart.product[productIndexInCart].total -= product.offerPrice;
      cart.grandTotal -= product.offerPrice;
    }
    cart.product[productIndexInCart].kg = count;
    const c = await cart.save();
    const total = cart.product[productIndexInCart].total;
    const grandTotal = cart.grandTotal;
    console.log("total", total);
    console.log("grandTotal", grandTotal);

    res.send({ total, grandTotal });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// const loadCheckout = async (req, res) => {
//   try {
//     const userId = req.session.userId;
//     const user = await User.findOne({ _id: userId });

//     const cart = await Cart.findOne({ userId: req.session.userId })
//       .populate("product.productId")
//       .exec();


//     let subTotal = 0;
//     for (let i = 0; i < cart.product.length; i++) {
//       subTotal += cart.product[i].total;
//     }

//     let grandTotal = 0;
//     for (let i = 0; i < cart.product.length; i++) {
//       grandTotal += cart.product[i].total;
//     }
//     let wallet = user.wallet;
//     const encodeWallet = encodeURIComponent(JSON.stringify(wallet));
//     // const userCartData = await Cart.findOne({ userId: req.session.userId });

//     // Convert the user object to a JSON string and then encode it
//     const encodeduser = encodeURIComponent(JSON.stringify(user));

// //////////////////////////////////////////////////////////////////////////////////
// //its the condition for out of stock
// /////////////////////////////////////////////////////////////////////////////////
// let userCartData = await Cart.findOne({ userId: userId })
//       .populate("product.productId")
//       .lean()
//       .exec();
   
//     if (!userCartData) {
//       userCartData = null; // Set userCartData to null if it's null or empty
//     }
    
//     const productId = userCartData?.product?.map((data) => {
//       return {
//         id: data.productId?._id.toString(),
//       };
//     });

//     let totalPrice = 0;
//     var ProductPrice = [];

//     if (userCartData?.product && userCartData.product.length > 0) {
//       for (let i = 0; i < userCartData.product.length; i++) {
//         ProductPrice[i] =
//           userCartData.product[i].productId.offerPrice *
//           userCartData.product[i].kg;
//         totalPrice += ProductPrice[i];
//       }
//     }
    
//     for(let i=0;i<cart.product.length;i++){
//       console.log(cart.product[i].kg,'this is kg',cart.product[i].productId.stock,"this is stock" );
//       if(cart.product[i].kg>cart.product[i].productId.stock){
//     res.render('cart',{ // Ensure that 'user' variable is passed correctly
//     userCartData, totalPrice, ProductPrice, productId
//     ,message:`${cart.product[i].productId.productName}+"is out of stock, remove the product from the cart to checkout"`})
//       }
//     }

// //////////////////////////////////////////////////////////////////////
// //its the ending of out of stock
// /////////////////////////////////////////////////////////////////////


//     res.render("checkout", {
//       user: user, // Ensure that 'user' variable is passed correctly
//       encodeduser,
//       cart,
//       grandTotal,
//       subTotal,
//       encodeWallet,
//       userCartData,
//     });
//   } catch (error) {
//     console.log(error.message);
//     res.render("404");
//   }
// };



const loadCheckout = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findOne({ _id: userId });

    const cart = await Cart.findOne({ userId: req.session.userId })
      .populate("product.productId")
      .exec();

    let subTotal = 0;
    for (let i = 0; i < cart.product.length; i++) {
      subTotal += cart.product[i].total;
    }

    let grandTotal = 0;
    for (let i = 0; i < cart.product.length; i++) {
      grandTotal += cart.product[i].total;
    }

    let wallet = user.wallet;
    const encodeWallet = encodeURIComponent(JSON.stringify(wallet));
    const encodeduser = encodeURIComponent(JSON.stringify(user));

    // Check for out-of-stock products
    const outOfStockProducts = cart.product.filter(
      (item) => item.kg > item.productId.stock
    );

    if (outOfStockProducts.length > 0) {
      // If there are out-of-stock products, display the message on checkout page
let userCartData = await Cart.findOne({ userId: userId })
      .populate("product.productId")
      .lean()
      .exec();
   
    if (!userCartData) {
      userCartData = null; // Set userCartData to null if it's null or empty
    }
    
    const productId = userCartData?.product?.map((data) => {
      return {
        id: data.productId?._id.toString(),
      };
    });

    let totalPrice = 0;
    var ProductPrice = [];

    if (userCartData?.product && userCartData.product.length > 0) {
      for (let i = 0; i < userCartData.product.length; i++) {
        ProductPrice[i] =
          userCartData.product[i].productId.offerPrice *
          userCartData.product[i].kg;
        totalPrice += ProductPrice[i];
      }
    }

      return res.redirect('/cart?userCartData=' + encodeURIComponent(JSON.stringify(userCartData)) +
      '&totalPrice=' + encodeURIComponent(totalPrice) +
      '&ProductPrice=' + encodeURIComponent(ProductPrice) +
      '&productId=' + encodeURIComponent(productId) +
      '&message=' + encodeURIComponent(`${outOfStockProducts[0].productId.productName} is out of stock, remove the product from the cart to checkout`));

    }

    // If no out-of-stock products, proceed with rendering the checkout page normally
    res.render("checkout", {
      user: user,
      encodeduser,
      cart,
      grandTotal,
      subTotal,
      encodeWallet,
      userCartData: cart, // Pass cart as userCartData since there are no out-of-stock products
    });
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};


const Checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.session.userId })
      .populate("product.productId")
      .exec();
      //  console.log('jdhfkjhsajhklahkj;ldsfjhj;kah',cart);

      
     
    var grandTotal = 0;
    for (let i = 0; i < cart.product.length; i++) {
      grandTotal += cart.product[i].productId.offerPrice * cart.product[i].kg;
    }

    const newOrder = new Order({
      userId: req.session.userId,
      name: req.body.name,
      email: req.body.email,
      city:req.body.city,
      district:req.body.district,
      state:req.body.state,
      zip:req.body.zip,
      country:req.body.country,
      phone: req.body.phone,
      paymentMethod: req.body.payment,
      orderItems: cart.product,
      grandTotal: grandTotal,
    });
    // console.log(req.body.address);
    await newOrder.save();
    const orderId = newOrder._id;
    const deleteCart = await Cart.deleteOne({ userId: req.session.userId });

    res.redirect(`/viewOrderDetails?id=${orderId}`);
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

const loadMyOrder = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.session.userId })
      .populate("orderItems.productId")
      .sort({ dateOrdered: -1 }) // Sort by dateOrdered in descending order
      .exec();
    const user = await User.findOne({ _id: req.session.userId });
    res.render("order", { orders, user });
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

const showOrderDetailsModal = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId)
      .populate("orderItems.productId")
      .exec();

    if (!order) {
      return res.status(404).render("404");
    }

    res.render("order_details_modal", { order });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500");
  }
};

const searchProduct = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.userId });
    const search = req.body.search;

    const searchregex = new RegExp(search, "i");

    var products = await Product.find({ productName: { $regex: searchregex } });

    if (products.length > 0) {
      const userCartData = await Cart.findOne({ userId: req.session.userId });
      // Check if userCartData is null and initialize it to an empty object
      const cartData = userCartData || {};

      res.render("shop", {
        allProducts: products,
        allcategory: "",
        currentPage: "",
        totalPages: "",
        userCartData: cartData, // Pass cartData to the view
      });
    } else {
      res.render("shop", { message: "No results found" });
    }
  } catch (error) {
    console.log(error);
    res.render("404");
  }
};

const couponLoad = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.userId });
    let referralCode = user.referralCode;
    const coupons = await Coupon.find({});
    const userCartData = await Cart.findOne({ userId: req.session.userId })
      .populate("product.productId")
      .lean()
      .exec();
    res.render("coupon", { coupons, referralCode, userCartData });
  } catch (error) {
    console.log(error);
    res.render("404");
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.query.id;

    // Retrieve the order
    const canceledOrder = await Order.findOne({ _id: orderId });

    // Check if the payment method for the order is "cash"
    if (canceledOrder.paymentMethod === "cash") {
      // If the payment method is "cash," do not add the canceled order amount to the user's wallet
      // Instead, you can just mark the order as canceled and redirect to "/myOrder"
      await Order.updateOne({ _id: orderId }, { $set: { status: "canceled" } });
      res.redirect("/myOrder");
    } else {
      // If the payment method is not "cash," add the canceled order amount to the user's wallet
      const orderAmount = canceledOrder.grandTotal;

      // Add canceled order amount to user's wallet
      const user = await User.findOneAndUpdate(
        { _id: req.session.userId },
        { $inc: { wallet: orderAmount } },
        { new: true }
      );

      // Mark the order as canceled
      await Order.updateOne({ _id: orderId }, { $set: { status: "canceled" } });

      // Order cancellation successful
      res.redirect("/myOrder");
    }
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

const cheakCoupon = async (req, res) => {
  try {
    const userId = req.session.userId;
    const cart = await Cart.findOne({ userId: userId });
    const userCode = req.body.code;

    const coupon = await Coupon.findOne({
      coupenCode: { $regex: new RegExp("^" + userCode + "$", "i") },
    });

    const currentDate = new Date();

    const totalPrice = req.body.amount;
    if (!coupon) {
      return res.json({ coupon: false });
    } else {
      const cartId = cart._id;

      let couponApplyDiscount = 0;
      let couponAmounts = coupon.couponAmount;

      // Check if the coupon is valid and meets the conditions
      if (userCode === coupon.coupenCode && currentDate < coupon.expiryDate) {
        if (totalPrice >= coupon.minimumAmount) {
          couponApplyDiscount = totalPrice - coupon.couponAmount;
          // console.log('totalPrice', totalPrice);
          // console.log('coupon amount',coupon.couponAmount);

          const updateTotal = await Cart.updateOne(
            { _id: cartId },
            { grandTotal: couponApplyDiscount }
          );
        } else {
          res.json({ min: false });
        }
      }

      if (couponApplyDiscount !== 0) {
        res.json({
          available: true,
          couponApplyDiscount: couponApplyDiscount,
          couponAmounts,
        });
      } else {
        res.json({ available: false });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

// Handle wallet payment
const walletPayment = async (req, res) => {
  try {
    const amount = req.body.amount;
    // Fetch user from the database
    const user = await User.findById({ _id: req.session.userId });
    // Check if user has sufficient balance in the wallet

    // Deduct the amount from the wallet balance
    user.wallet -= amount;
    // Save the updated user object
    await user.save();
    // Perform further actions or send a response as needed
    return res
      .status(200)
      .json({ success: true, message: "Payment successful" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "An error occurred" });
  }
};

module.exports = {
  signupLoad,
  insertUser,
  verifyMail,
  loginLoad,
  loginVerify,
  loadHome,
  resetPasswordEmailLoad,
  mailCheckSentOtp,
  otpPageLoad,
  loadIntoResetPassword,
  resetPasswordLoad,
  updatePassword,
  logout,
  userProfile,
  profileAddressAdd,
  profileEdit,
  editAddress,
  deleteAddress,
  addToCart,
  getCart,
  deleteItem,
  getShop,
  getCategory,
  singleProductLoad,
  loadCheckout,
  loadMyOrder,
  showOrderDetailsModal,
  Checkout,
  updateKg,
  searchProduct,
  couponLoad,
  cancelOrder,
  cheakCoupon,
  walletPayment,
};
