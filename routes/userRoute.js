var express = require('express');
var user_route = express();

const config = require('../config/config')
const auth = require('../middleware/auth')


const path = require('path')

// view engine setup
user_route.set('view engine', 'ejs');
user_route.set('views','./views/users');

const userController = require('../controllers/userController')
const paymentController=require('../controllers/paymentController')

user_route.get('/signup', auth.isLogout, userController.signupLoad);
user_route.post('/signup', userController.insertUser);

user_route.get('/verify', userController.verifyMail);

user_route.get('/', auth.isLogout, userController.loadHome);
user_route.get('/login', auth.isLogout, userController.loginLoad);
user_route.post('/login', userController.loginVerify);

user_route.get('/home',  userController.loadHome);

user_route.get('/resetPasswordEmail',userController.resetPasswordEmailLoad)
user_route.post('/resetPasswordEmail',userController.mailCheckSentOtp)

user_route.get('/otpPage',userController.otpPageLoad)

user_route.post('/verify-otp',userController.loadIntoResetPassword)

user_route.get('/resetPassword',userController.resetPasswordLoad)

user_route.post('/resetPassword',userController.updatePassword)

user_route.get('/logout', auth.isLogin,userController.logout)

user_route.get('/profile',auth.isLogin,userController.userProfile)

user_route.post('/profile-address-add',userController.profileAddressAdd)

user_route.post('/profile-edit',userController.profileEdit)


user_route.post('/edit-address',userController.editAddress)

user_route.post('/delete-address', userController.deleteAddress);

user_route.get('/shop',userController.getShop)

user_route.get('/getCategory', auth.isLogin,userController.getCategory)

user_route.post('/addtocart',auth.isLogin,userController.addToCart)

user_route.get('/cart',auth.isLogin,userController.getCart)

user_route.get('/deleteitem',auth.isLogin,userController.deleteItem)

user_route.get('/single-product',userController.singleProductLoad)

user_route.get('/checkout',auth.isLogin,userController.loadCheckout)

user_route.post('/checkout',auth.isLogin,userController.Checkout)

user_route.get('/myOrder',auth.isLogin,userController.loadMyOrder)
user_route.get('/orderDetails/:orderId', userController.showOrderDetailsModal);

user_route.post('/updatecart',userController.updateKg)

user_route.post('/search',userController.searchProduct)

user_route.get('/coupon',auth.isLogin,userController.couponLoad)

user_route.get('/cancelOrder',userController.cancelOrder)

user_route.get('/viewOrderDetails',auth.isLogin,paymentController.orderDetailsLoad)

user_route.post('/createOrder',paymentController.createOrder)

user_route.post('/checkCouponAvailable',userController.cheakCoupon)

user_route.post('/wallet-payment', userController.walletPayment)


module.exports = user_route;
