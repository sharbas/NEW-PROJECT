const mongoose = require('mongoose')

const adminSchema= new mongoose.Schema({
adminName:{
    type:String,
    required:true
},
adminPassword:{
    type:String,
    required:true
},



},{collection:"admin"})


module.exports=mongoose.model('admin',adminSchema)