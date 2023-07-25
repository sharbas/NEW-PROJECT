const adminIsLogin = (req, res,next) => {
  try {
    if (req.session.admin_id) {
    } else {
      res.redirect("/admin");
    }
    next();
  } catch (error) {
    console.log(error);
  }
};

const adminIsLogout = (req, res,next) => {
  try {
    if (req.session.admin_id) {
      res.redirect("/admin/home");
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports={
    adminIsLogin,
    adminIsLogout,
}