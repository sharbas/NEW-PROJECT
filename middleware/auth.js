const User = require("../models/userModel");
// const user=User.findOne({_id:req.session.userId})

const isLogin=async(req,res,next)=>{
    try {
        const userFind=await User.findOne({_id:req.session.userId})
        if(req.session.userId && userFind.isBlock==false){
            // if(user.is_blocked===true){
            //     console.log("user.is_blocked");
           
            // }
            
        // }else if(user.is_blocked===true){
        //    res.redirect('/login')
        }else{
            res.redirect('/login')
        }
        next();
    } catch (error) {
        console.log(error.message)
    }
}
const isLogout=async(req,res,next)=>{
    try {
 
        if (req.session.userId) {
            res.redirect('/home')
        }else{
        next();
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports={
    isLogin,
    isLogout
}

// const sessionValidation = async (req, res, next) => {
//     if(req.session.user_id) {
//       res.locals.sessionValue = true
//       valid = await userModel.findOne({_id:req.session.user_id})
//       if(!valid.is_blocked) {
//       res.locals.sessionValue = false
//       req.session.destroy()
//       }
//       next()
//     } else{
//       res.locals.sessionValue = false
//       next()
//     }    
//   };