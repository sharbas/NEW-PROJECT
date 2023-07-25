const mongoose = require('mongoose')

const coupon = new mongoose.Schema({
coupenCode:{
    type:String,
    required:true
},
couponAmount:{
    type:Number,
    required:true
},
description:{
    type:String,
    required:false
},
image:{
    type:String,
    required:false,

},
startDate:{
    type:Date,
    required:true
},
expiryDate:{
    type:Date,
  required:true
},
minimumAmount:{
    type:Number,
    required:true
},
status:{
    type:String,
   default:'Active'
},
})

module.exports=mongoose.model('Coupon',coupon)