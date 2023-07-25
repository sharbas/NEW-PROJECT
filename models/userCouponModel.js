const mongoose= require('mongoose')

const usercoupon= new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    coupons:[{
        couponId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Coupon',
        },
        couponUsed:{
            type:Boolean,
            default:false
        },
        description:{
            type:String,
            required:false
        }
    }]
})

module.exports=mongoose.model('Usercoupon',usercoupon)