const  express = require('express');
const mongoose=require('mongoose')
const app = express()
const path=require('path')
const nocache=require('nocache')
const session=require('express-session')
const morgan=require('morgan')
// const logger=require('logger')
const config=require('./config/config')
console.log('data')
const cookieParser = require('cookie-parser');

const  userRouter = require('./routes/userRoute');
const adminRouter = require('./routes/adminRoute');

// mongoose.connect('mongodb://127.0.0.1:27017/NutriNatureFruit')
mongoose.connect('mongodb+srv://mohammedsharbas32:rlR2mPy8WrOY4fuN@nutrifreshfruit.vwns9s8.mongodb.net/?retryWrites=true&w=majority')



// app.use(express.static(path.join(__dirname,'public')))
// app.use('/public',express.static('public/images'))

app.use(nocache())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret:config.sessionsecret,
    resave:false, //or true, depending on your use case
    saveUninitialized:false //or true, depending on your use case
  }))

app.use('/', userRouter);
app.use('/admin', adminRouter);




  app.listen(3000,()=>{
    console.log("server is running");
  })