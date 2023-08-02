const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    require: true,
  },

  productImage: {
    type: Array,
    required: true,
  },
  productDescription: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  kg:{
    type:String,
    required:true

  },
  productOffer:{
   type:Number,
   default:0
   
  },
  offerPrice:{
    type:Number,
    
  },

  stock: {
    type: Number,
    default: 1,
    required:true
  },
  deleted: {
    type: Boolean,
    default: false
  }

})

module.exports = mongoose.model("Product", productSchema);
