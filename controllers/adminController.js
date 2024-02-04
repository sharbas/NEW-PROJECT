const admin = require("../models/adminModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Coupon=require('../models/couponModel')
const Order = require("../models/orderModel");
const fs = require('fs');
// const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const config = require("../config/config");
const mongoose=require('mongoose')
//to display login page
const sharp=require('sharp');
const { log } = require("console");
const adminLoginLoad = async (req, res) => {
  try {
    res.render("login");FKDI,KKKPIIRIRILPDKKFKKGOOLDO
    KUJDI
    
  } catch (error) {
    console.log(error.message);
    res.render("404")
  }
};

//to check if the enter details in login page are mathcing with db
const adminLoginVerify = async (req, res) => {
  try {
    
    const adminName = req.body.username;
    const Password = req.body.password;
    const adminData = await admin.findOne({ adminName: adminName })
    if (adminData) {
      const passwordMatch = adminData.adminPassword;
      if (passwordMatch === Password) {
        req.session.admin_id = adminData._id;
        res.redirect("/admin/home");
      } else {
        res.render("login", { message: "password is wrong" });
      }
    } else {
      res.render("login", { message: "admin is not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("404")
  }
};

//to logout admin page
const logout = (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
    res.render("404")
  }
};


//to display the page of customers details
const customerLoad = async (req, res) => {
  try {
    const user = await User.find({});
    res.render("customers", { user: user });
  } catch (error) {
    console.log(error.message);
    res.render("404")
  }
};

//to activate block of customers
const blockUser = async (req, res) => {
  try {
    const userId = req.query.id;
    const user = await User.updateOne(
      { _id: userId },
      { $set: { isBlock: true } }
    );
    res.redirect("/admin/customers");
  } catch (error) {
    console.log(error.message);
    res.render("404")
  }
};

//to activate unblock of customers
const unBlockUser = async (req, res) => {
  try {
    const userId = req.query.id;
    const user = await User.updateOne(
      { _id: userId },
      { $set: { isBlock: false } }
    );
    res.redirect("/admin/customers");
  } catch (error) {
    console.log(error.message);
    res.render("404")
  }
};

//to display the page of order list
const ordersLoad = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('orderItems.productId')
      .sort({ dateOrdered: -1 })
      .exec();



    res.render("orders", { orders,  });
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};



//to display the page of categories list
const categoriesLoad = async (req, res) => {
  try {
    const category = await Category.find({});
    res.render("categories", { category: category });
  } catch (error) {
    console.log(error.message);
    res.render("404")
  }
};

//to add category to db
const addCategory = async (req, res) => {
  try {
    const cat = req.body.categoryname;

    if (cat == '') {
      res.redirect("/admin/categories");
    } else {
      const categoryCheck = await Category.findOne({
        categoryName: { $regex: new RegExp('^' + cat + '$', 'i') },
      });

      if (!categoryCheck) {
        var categoryOffer=req.body.categoryOffer
        if(!req.body.categoryOffer){
          var categoryOffer=0
        }
        const categoryData = new Category({
          categoryName: cat,
          categoryOffer:categoryOffer
        }).save();
        res.redirect("/admin/categories");
      } else {
        const category = await Category.find({});
        res.render("categories",{message:"This category is already exist", category});
      }
    }
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};


//to delete the category
const deleteCategory = async (req, res) => {
  try {
    
    const id = req.query.id;
    const Delete = await Category.deleteOne({ _id: id });
    res.redirect("/admin/categories");
  } catch (error) {
    console.log(error.message);
    res.render("404")
  }
};

//to display the page of add product
const addProductsLoad = async (req, res) => {
  try {
    const categories = await Category.find({});
    console.log('stop 1');
    res.render("addProducts", { categories: categories });
   
  } catch (error) {  
    console.log(error.message);
    res.render("404")
  }
};


const addProducts = async (req, res) => {
  try {
   
    const category = req.body.category;
    const existingProduct = await Product.findOne({ productName:req.body.productname });

    if (existingProduct) {
      // If a product with the same name already exists, redirect with a message
      const categories = await Category.find({});
      return res.render("addProducts", { message: "This product is already exist." ,categories})
    }
    const categoryCheck = await Category.findOne({ categoryName: category });
    if (categoryCheck) {
      let productOffer=req.body.ProductOffer
      let price= req.body.price
      if(!productOffer||productOffer===undefined){
        productOffer=0
      }
      let offerPrice=price-productOffer
      const productsData = new Product({
        productName: req.body.productname,
        productDescription: req.body.description,
        categoryName: req.body.category,
        price: req.body.price,
        kg: req.body.kg,
        stock:req.body.kg,
        productOffer:req.body.ProductOffer,
        offerPrice:offerPrice
      });
      
      console.log('category',category);
      console.log('productsData',productsData);
      const croppedImages = [];
      for (let file of req.files)
      {
        const croppedImage = `cropped_${file.filename}`;
        await sharp(file.path)
          .resize(500, 600, { fit: "cover" })
          .toFile(`./public/images/${croppedImage}`);
        croppedImages.push(croppedImage);
      }

      productsData.productImage = croppedImages;
      await productsData.save();
    }
    res.redirect("/admin/productsList");
  } catch (error) {
    console.log(error.message);
    return res.render("404");
  }
};


//to display the page of product list       //////////////////////
const productsListLoad = async (req, res) => {
  try {
  
   
      const product = await Product.find({deleted:false});
 
      res.render("productsList", { product: product });
    
   
  } catch (error) {
    console.log(error.message);
    res.render("404")

  }
};

//to load edit product page
const editProductsLoad = async (req, res) => {
  try {

    const id = req.query.id;
    const categories = await Category.find();
    const products = await Product.findOne({ _id: id });
    res.render("editProducts", { products: products, categories: categories });
    
  } catch (error) {
    console.log(error.message);
    res.render("404")
  }
};
// delete image



//to delete Product in the product list
const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;

    const deleteData = await Product.updateOne({ _id: id },{$set:{deleted:true}});
    res.redirect("/admin/productsList");
  } catch (error) {
    console.log(error.message);
    res.render("404")
  }
}

//to edit the product by updating
const editProducts = async (req, res) => {
  try {
    const id = req.body.id;
    const currentProduct = await Product.findOne({ _id: id });
    let productOffer=req.body.ProductOffer
    let price= req.body.price
    console.log('this is req.body.productImage',req.body.productImage);
    console.log('this is currentProduct.productImage',currentProduct.productImage);
    if(!productOffer||productOffer===undefined){
      productOffer=0
    }
    let offerPrice=price-productOffer
    const updationData = {
      productName: req.body.productname,
      productImage: currentProduct.productImage,
      productDescription: req.body.description,
      price: req.body.price,
      categoryName: req.body.category,
      kg: req.body.kg,
      stock:req.body.kg,
      productOffer:productOffer,
      offerPrice:offerPrice
    };
    console.log(req.files,req.files.length,'this is enigma aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    if (req.files && req.files.length > 0) {
      console.log('haaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      updationData.productImage.push( ...req.files.map((file) => file.filename));
    }
    const product = await Product.findByIdAndUpdate(
      { _id: id },
      { $set: updationData }
    );
    console.log("this is my product",product);
    if (product) {
      res.redirect("/admin/productsList");
    }
  } catch (error) {
    console.log(error.message);
    res.render("404")
  }
};


const deleteImage = async (req, res) => {
  try {
    const id = req.query.id;
    const imageIndex = req.query.index;

    const productData = await Product.findOne({ _id: id });

    if (!productData) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (imageIndex < 0 || imageIndex >= productData.productImage.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    // Remove the image at the specified index from the product's images array
    productData.productImage.splice(imageIndex, 1);
    await productData.save();

    res.redirect('/admin/editProducts?id='+id);

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const updateOrderStatus=async(req,res)=>{
  try{
   
    const status = req.body.status

    console.log(typeof req.body.orderId)
    const date=Date.now()
    if(status=='delivered'){

      const order=await Order.updateOne({_id:req.body.orderId},{status:status,deliveredDate:date})
      res.redirect('/admin/orders')
    }else if(status=='returned'){
      const order=await Order.updateOne({_id:req.body.orderId},{status:status})
      res.redirect('/admin/orders')
    }else if(status=='shipped'){
      const order=await Order.updateOne({_id:req.body.orderId},{status:status})
      res.redirect('/admin/orders')
    }else{
      const order=await Order.updateOne({_id:req.body.orderId},{status:status})
      res.redirect('/admin/orders')
    }
  }catch(error){
    console.log(error.message);
    res.render('404')
  }

}


const getAddCoupon=async(req,res)=>{
  try{


    res.render('addCoupon')

  }catch(error){
    console.log(error.message)
    res.render('404')
  }
}

const addCoupon = async (req, res) => {
  try {
    const couponCode = req.body.couponCode;
    const couponExists = await Coupon.exists({ coupenCode: { $regex: new RegExp('^' + couponCode + '$', 'i') } });

    if (couponExists) {
      // If a coupon with the same code (case-sensitive) already exists, send a message to the front end
      res.render('addCoupon',{ message: 'Coupon code already exists.' });
    } else {
      const coupon = new Coupon({
        coupenCode: couponCode,
        couponAmount: req.body.couponDiscount,
        minimumAmount: req.body.couponMinAmount,
        description: req.body.couponDescription,
        image: req.file.filename,
        startDate: req.body.couponStart,
        expiryDate: req.body.couponExpire,
      });

      await coupon.save();
      res.redirect('/admin/couponList');
    }
  } catch (error) {
    console.log(error.message);
    res.render('404');
  }
};


const couponList=async(req,res)=>{
  try{
    const coupons= await Coupon.find({})
    const currentDate=new Date()
    for(const coupon of coupons){
      if(coupon.expiryDate <= currentDate){
        coupon.status='Expired'
        await coupon.save()
      }
     
    }

res.render('coupon',{coupons})

  }catch(error){
    console.log(error.message);
    res.render('404')
  }
}

const deleteCoupon=async(req,res)=>{
  try{

    const id=req.query.id
 
    const deletecoupon=await Coupon.deleteOne({_id:id})

    res.redirect('/admin/couponList')

  }catch(error){
    console.log(error.message);
    res.render('404')
  }
}


const adminHomeLoad = async (req, res) => {
  try {

    //totalSales

    let totalSales = await Order.aggregate([
      {
        $match: {
          status: { $ne: "returned" },
        },
      },
      {
        $count: "totalCount",
      },
    ]);
    console.log('totalsales',totalSales[0]);
    totalSales = totalSales[0].totalCount;

   
    // totalRevenue
    let totalRevenue = await Order.aggregate([
      {
        $match: {
          status: { $ne: "returned" },
        },
      },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]);

    totalRevenue = totalRevenue[0].total;
    console.log('totalRevenue',totalRevenue)
    //totalprofit
    let orginalPrice = await Order.aggregate([
      {
        $match: {
          status: { $ne: "returned" },
        },
      },
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.productId",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $unwind: "$productData",
      },
      {
        $project: {
          price: "$productData.price",
          kg: "$orderItems.kg",
          total: { $multiply: ["$productData.price", "$orderItems.kg"] },
        },
      },
      {
        $group: {
          _id: null,
          Total: { $sum: "$total" },
        },
      },
    ]);

    // orginalPrice = orginalPrice[0].Total;
    // // console.log('original price',orginalPrice);
    // let loss = orginalPrice - totalRevenue;
    // // console.log('loss',loss)
    // let originalProfit = (orginalPrice * 30) / 100;
    // // console.log('originalProfit',originalProfit);
    // let lastProfit = originalProfit - loss;
    // // console.log('lastProfit',lastProfit);
    // let cost = (orginalPrice * 70) / 100;
    
    // console.log('cost',cost);
    const paymentMethod = await Order.aggregate([
      {
        $match: {
          status: { $ne: "returned" },
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          totalGrandTotal: { $sum: "$grandTotal" },
        },
      },
    ]);
    // console.log('payment method',paymentMethod);
    var series = encodeURIComponent(
      JSON.stringify(paymentMethod.map((item) => item.totalGrandTotal))
    );
 
    var labels = encodeURIComponent(
      JSON.stringify(paymentMethod.map((item) => item._id))
    );


    // Get the current month
    // Get the current month
    var currentMonth = new Date().getMonth() + 1; // JavaScript months are zero-based, so add 1
// console.log('currentMonth',currentMonth)
    const salesPerMonthx = await Order.aggregate([
      {
        $match: {
          status: { $ne: "returned"},
          dateOrdered: {
            // $gt: new Date(new Date().getFullYear(), currentMonth - 1, 1),
            $lt: new Date(new Date().getFullYear(), currentMonth, 1),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$dateOrdered" },
          totalGrandTotal: { $sum: "$grandTotal" },
        },
      },
      {
        $group: {
          _id: null,
          months: {
            $push: {
              month: { $ifNull: ["$_id", currentMonth] },
              totalGrandTotal: { $ifNull: ["$totalGrandTotal", 0] },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          months: {
            $map: {
              input: { $range: [1, 13] },
              as: "month",
              in: {
                month: {
                  $let: {
                    vars: {
                      monthNames: [
                        null,
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ],
                    },
                    in: {
                      $arrayElemAt: ["$$monthNames", "$$month"],
                    },
                  },
                },
                totalGrandTotal: {
                  $let: {
                    vars: {
                      monthData: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$months",
                              cond: { $eq: ["$$this.month", "$$month"] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: { $ifNull: ["$$monthData.totalGrandTotal", 0] },
                  },
                },
              },
            },
          },
        },
      },
    ]);
   
 const numberOfOrders=await Order.countDocuments()

    
  //   if(salesPerMonthx){
  //    var salesPerMonth = salesPerMonthx[0].months;

  //  }

    var month = encodeURIComponent(
      JSON.stringify(salesPerMonthx[0].months.map((item) => item.month))
    );
    var monthlySales = encodeURIComponent(
      JSON.stringify(salesPerMonthx[0].months.map((item) => item.totalGrandTotal))
    );
   
  
    res.render("home", {
      currentPage: "dashboard",
      paymentData: "",
      totalSales,
      totalRevenue,
      lastProfit:4070,
      loss:0,
      cost:10550,
      series,
      labels,
      month,
      monthlySales,
      numberOfOrders
    });
  } catch (error) {
    console.log(error.message);
    res.render('404')
  }
};




const salesReport=async(req,res)=>{
  try{
    const { startDate, endDate } = req.query;

    const startOfDay = new Date(startDate);
    const endOfDay = new Date(endDate);
    const pipeline = [
      {
          $match: {
              status: { $in: ["pending", "delivered", "shipped"] },
              dateOrdered: {
                  $gte: startOfDay,
                  $lte: endOfDay,
              },
          },
      },
      {
          $unwind: '$orderItems',
      },
      {
          $lookup: {
              from: 'products',
              localField: 'orderItems.productId',
              foreignField: '_id',
              as: 'productData',
          },
      },
      {
          $unwind: '$productData',
      },
      {
          $project: {
              _id: 0,
              name: '$productData.productName',
              kg: '$orderItems.kg',
              total: '$orderItems.total',
              productId: '$orderItems.productId',
          },
      },
      {
          $group: {
              _id: '$productId',
              productName: { $first: '$name' },
              totalAmount: { $sum: '$total' },
              kg: { $sum: '$kg' },
          },
      },
  ];
  console.log('pipeline',pipeline);

  const salesData = await Order.aggregate(pipeline);
console.log('salesData',salesData);
  res.render('salesReport', {
      currentPage: 'salesReport',
      salesData,
      startDate,
      endDate,
  });
  }catch{
    console.log(error);
    res.render('404')
  }
}

const generateSalesReport = async (req, res) => {
  try {
      const { startDate, endDate } = req.query;

      const startOfDay = new Date(startDate);
      const endOfDay = new Date(endDate);
      console.log('startOfDay',startOfDay);
      console.log('endOfDay',endOfDay);

      const pipeline = [
          {
              $match: {
                  status: { $in: ["pending", "delivered", "shipped"] },
                  dateOrdered: {
                      $gte: startOfDay,
                      $lte: endOfDay,
                  },
              },
          },
          {
              $unwind: '$orderItems',
          },
          {
              $lookup: {
                  from: 'products',
                  localField: 'orderItems.productId',
                  foreignField: '_id',
                  as: 'productData',
              },
          },
          {
              $unwind: '$productData',
          },
          {
              $project: {
                  _id: 0,
                  name: '$productData.productName',
                  kg: '$orderItems.kg',
                  total: '$orderItems.total',
                  productId: '$orderItems.productId',
              },
          },
          {
              $group: {
                  _id: '$productId',
                  productName: { $first: '$name' },
                  totalAmount: { $sum: '$total' },
                  kg: { $sum: '$kg' },
              },
          },
      ];
      console.log('pipeline',pipeline);

      const salesData = await Order.aggregate(pipeline);
console.log('salesData',salesData);
      res.render('salesReport', {
          currentPage: 'salesReport',
          salesData,
          startDate,
          endDate,
      });
  } catch (error) {
      console.log(error.message);
      res.render('404');
  }
};

const downloadSalesReport = async (req, res) => {
  try {
      const { startDate, endDate } = req.query;

      const startOfDay = new Date(startDate);
      const endOfDay = new Date(endDate);

      const pipeline = [
          {
              $match: {
                  status: { $in: ["pending", "delivered", "shipped"] },
                  dateOrdered: {
                      $gte: startOfDay,
                      $lte: endOfDay,
                  },
              },
          },
          {
              $unwind: '$orderItems',
          },
          {
              $lookup: {
                  from: 'products',
                  localField: 'orderItems.productId',
                  foreignField: '_id',
                  as: 'productData',
              },
          },
          {
              $unwind: '$productData',
          },
          {
              $project: {
                  _id: 0,
                  name: '$productData.productName',
                  kg: '$orderItems.kg',
                  total: '$orderItems.total',
                  productId: '$orderItems.productId',
              },
          },
          {
              $group: {
                  _id: '$productId',
                  productName: { $first: '$name' },
                  totalAmount: { $sum: '$total' },
                  kg: { $sum: '$kg' },
              },
          },
      ];

      const salesData = await Order.aggregate(pipeline);

      let csvContent = 'Product Name, Total Amount, KG\n';
      salesData.forEach((data) => {
          csvContent += `${data.productName}, ${data.totalAmount}, ${data.kg}\n`;
      });

      const fileName = `sales_report_${startDate}_${endDate}.csv`;

      fs.writeFile(fileName, csvContent, (err) => {
          if (err) {
              console.error(err);
              res.sendStatus(500);
          } else {
              res.download(fileName, (err) => {
                  if (err) {
                      console.error(err);
                      res.sendStatus(500);
                  }
                  fs.unlinkSync(fileName);
              });
          }
      });
  } catch (error) {
      console.log(error.message);
      res.render('404');
  }
};

module.exports = {
  adminLoginLoad,
  adminLoginVerify,
  logout,
  adminHomeLoad,
  customerLoad,
  blockUser,
  unBlockUser,
  productsListLoad,
  deleteProduct,
  addProductsLoad,
  addProducts,
  editProductsLoad,
  editProducts,
  deleteImage,
  categoriesLoad,
  ordersLoad,
  addCategory,
  deleteCategory,
  updateOrderStatus,
  getAddCoupon,
  addCoupon,
  couponList,
  deleteCoupon,
  salesReport,
  generateSalesReport,
  downloadSalesReport
};
