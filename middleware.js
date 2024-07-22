module.exports.isLoogedIn =(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("error", "you must be login to created list ")
        return res.redirect('/login')
      }
      next();
}