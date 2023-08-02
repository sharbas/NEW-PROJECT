var express = require('express');
var admin_route = express();
const path=require('path')


const config = require('../config/config')
const adminAuth = require('../middleware/adminAuth')
const multer=require('../middleware/multer')


// view engine setup
admin_route.set('view engine', 'ejs');
admin_route.set('views','./views/admin');

const adminController=require('../controllers/adminController')


admin_route.get('/',adminAuth.adminIsLogout,adminController.adminLoginLoad)
admin_route.post('/',adminController.adminLoginVerify)

admin_route.get('/logout',adminController.logout)

admin_route.get('/home',adminAuth.adminIsLogin,adminController.adminHomeLoad)

admin_route.get('/customers',adminAuth.adminIsLogin,adminController.customerLoad)

admin_route.get('/block',adminAuth.adminIsLogin,adminController.blockUser)

admin_route.get('/unblock',adminAuth.adminIsLogin,adminController.unBlockUser)

admin_route.get('/orders',adminAuth.adminIsLogin,adminController.ordersLoad)

admin_route.get('/categories',adminAuth.adminIsLogin,adminController.categoriesLoad)

admin_route.post('/addCategory',adminController.addCategory)

admin_route.get('/deletecategory',adminAuth.adminIsLogin,adminController.deleteCategory)

admin_route.get('/addProducts',adminAuth.adminIsLogin,adminController.addProductsLoad)

admin_route.post('/addProducts',multer.upload.array('productImage',3),adminController.addProducts)

admin_route.get('/productsList',adminAuth.adminIsLogin,adminController.productsListLoad)

admin_route.get('/editProducts',adminController.editProductsLoad)

admin_route.post('/editProducts',multer.upload.array('productImage'),adminController.editProducts)

admin_route.get('/deleteImage',adminController.deleteImage)

admin_route.get('/deleteProduct',adminController.deleteProduct)

admin_route.post('/updateOrderStatus',adminController.updateOrderStatus)

admin_route.get('/addCoupon',adminController.getAddCoupon)

admin_route.post('/addCoupon',multer.upload.single('couponImage'),adminController.addCoupon)

admin_route.get('/couponList',adminController.couponList)

admin_route.get('/deletecoupon',adminController.deleteCoupon)

admin_route.get('/salesReport', adminController.salesReport)

admin_route.get('/generateSalesReport', adminController.generateSalesReport);

admin_route.get('/salesReport/download', adminController.downloadSalesReport);



module.exports = admin_route;
