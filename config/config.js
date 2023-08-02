const myEnv=require('dotenv').config()

const sessionsecret='mysitesessionsecret'





const ADMIN_EMAIL='mohammedsharbas33@gmail.com'
const APP_PASSWORD='iggyvgryseybvfnl'

// const serverStart=()=>{
//     const mongoose=require('mongoose')
//     // mongoose.connect('mongodb://127.0.0.1:27017/NutriNatureFruit')
//     mongoose.connect('mongodb+srv://sharbas:AFzEGlptjcJkGYSW@cluster0.prlhos8.mongodb.net/')
// }


module.exports={
    sessionsecret,
    ADMIN_EMAIL,
    APP_PASSWORD,
    // serverStart,
}

