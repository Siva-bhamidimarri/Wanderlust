const User=require('../models/user');
module.exports.renderSignUpForm= (req, res) => {
    res.render('users/signup');
};
module.exports.signUp=async (req, res) => {
    try{
        let {username, email, password}=req.body;   
        const newUser=new User({username, email});
    const registeredUser=await User.register(newUser, password);
    req.login(registeredUser,(err)=>{
        if(err) return next(err);
        req.flash("success","Welcome to Wanderlust");
        res.redirect('/listings');
    }); 
    }catch(e){
        req.flash("error", e.message);
        res.redirect('/signup');
    }
};
module.exports.renderLoginForm= (req, res) => {
    res.render('users/login');
};
module.exports.login=async (req, res) => {
    req.flash("success"," Welcome back to Wanderlust");
    const redirectUrl = res.locals.redirectUrl || '/listings';
    delete req.session.redirectUrl;
    res.redirect(redirectUrl);
};
module.exports.logout=async (req, res) => {
   req.logout((err) => {
    if(err)  return next(err);
    req.flash("success","You have logged out");
    res.redirect('/listings');
   });
};