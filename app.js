const dotenv = require('dotenv');
dotenv.config({ override: true });
const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 8080;
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
//const MONGO_URL = 'mongodb+srv://23pa1a1222_db_user:w7AO2mwpWFfhQYkH@cluster0.wijcymu.mongodb.net/?appName=Cluster0';
const dbUrl=process.env.ATLASDB_URL ;
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport'); 
const { Strategy: LocalStrategy } = require('passport-local');
const User=require('./models/user.js');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600,
    crypto: {
      secret: process.env.SECRET 
    }
});
store.on('error', function (e) {
    console.log('Session store error', e);
});
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie:{
      expires: new Date(Date.now() + 7 * 24 * 60 * 1000),
      maxAge: 7 * 24 * 60 * 1000,
      httpOnly: true
    } ,
};
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
const listingsRouter = require('./routes/listing.js');
const reviewsRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');

main().then(() => { console.log('Connected to MongoDB'); }).catch(err => console.log(err));
async function main() {
    await mongoose.connect(dbUrl);
}
app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
}); 
app.use('/listings',listingsRouter);
app.use('/listings/:id/reviews',reviewsRouter);
app.use('/',userRouter);
app.use((req,res,next)=>{
  next(new ExpressError(404,"Page Not Found"));
});
app.use((err,req,res,next)=>{
  let{statusCode=500,message="Something went wrong"}=err;
  res.status(statusCode).render ("listings/error.ejs",{err});
});
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Try stopping the other process or set PORT to another value.`);
    process.exit(1);
  }
  console.error(err);
});