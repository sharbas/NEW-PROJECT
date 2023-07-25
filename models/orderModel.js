const mongoose = require('mongoose')

const orderSchema= new mongoose.Schema({
userId:{
    type:String,
    required:true
},
name:{
type:String
},
email:{
    type:String,
    
},
phone:{
    type:Number,

},
address:{
type:String,
},

orderItems:[{
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Product',
    },
    kg:{
        type:Number,
        required:true
    },
    total:{ 
        type:Number,
        required:false
    }

}],
grandTotal:{
    type:Number,
    required:true
},
status:{
    type:String,
    default:'pending'
},
paymentMethod:{
    type:String,
    required:false
},
dateOrdered:{
    type:Date,
    default:Date.now(),
},
deliveredDate:{
    type:Date,
    required:false
}

})

module.exports=mongoose.model('Order',orderSchema)