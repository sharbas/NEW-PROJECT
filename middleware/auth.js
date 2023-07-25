
const isLogin=async(req,res,next)=>{
    try {
        if(req.session.userId){
            
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