const mongoose = require('mongoose')

const categorySchema= new mongoose.Schema({
categoryName:{
    type:String,
    required:true
},
categoryOffer:{
    type:Number,
    default:0
}


})

module.exports=mongoose.model('Category',categorySchema)