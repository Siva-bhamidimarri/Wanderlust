const Listing = require('../models/listing.js');
const ExpressError = require('../utils/ExpressError');
const { cloudinary } = require('../cloudConfig');
const fs = require('fs');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapboxToken });
// escape user input for use in RegExp
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports.index = async (req, res) => {
  const { search } = req.query;
  let allListings;
  if (search && search.trim().length > 0) {
    const safe = escapeRegex(search.trim());
    const regex = new RegExp(safe, 'i');
    allListings = await Listing.find({ location: regex });
  } else {
    allListings = await Listing.find({});
  }
  res.render('listings/index.ejs', { allListings, search, fullWidth: Boolean(search && search.trim().length > 0) });
};
module.exports.renderNewForm=(req,res) =>{
    res.render("listings/new.ejs");
};
module.exports.showListing=async(req,res)=> {
  let {id}=req.params;
  const listing=await Listing.findById(id)
  .populate({
    path:'reviews',
    populate:{
      path:'author'
    },
  }).populate('owner');
  if(!listing){
    req.flash("error","Listing not found");
    return res.redirect("/listings");
  }
    res.render('listings/show.ejs',{listing})
};
module.exports.createListing = async (req, res) => {
  let response=await geocodingClient.forwardGeocode({
  query: req.body.listing.location,//https://github.com/mapbox/mapbox-sdk-js/blob/main/docs/services.md#forwardgeocode-1
  limit: 1
}).send();
  let image = {};
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'wanderlust_DEV',
        resource_type: 'image',
      });
      image = {
        url: result.secure_url,
        filename: result.public_id,
      };
    } catch (err) {
      console.error('Cloudinary upload failed:');
      throw new ExpressError(502, 'Image upload failed. Please check Cloudinary credentials and account settings.');
    } finally {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  }
  const newListing = new Listing({
    ...req.body.listing,
    image,
  });
  newListing.owner = req.user._id;
  newListing.geometry = response.body.features[0].geometry; 
  let savedListing=await newListing.save();
  req.flash('success', 'New Listing Created!');
  return res.redirect('/listings');
};
module.exports.editListing=async(req,res)=>{
  let {id}=req.params;
  const listing=await Listing.findById(id);
  if(!listing){
    req.flash("error","Listing not found");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image?.url || '';
  originalImageUrl = originalImageUrl.replace('/upload', '/upload/h_300,w_250,c_fill');
  res.render('listings/edit.ejs',{listing,originalImageUrl});
};
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  if (!req.body.listing)
    throw new ExpressError(400, 'Invalid listing data');
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'wanderlust_DEV',
        resource_type: 'image',
      });
      listing.image = {
        url: result.secure_url,
        filename: result.public_id,
      };
      await listing.save();
    } catch (err) {
      console.error('Cloudinary upload failed:');
      throw new ExpressError(502, 'Image upload failed. Please check Cloudinary credentials and account settings.');
    } finally {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  }
  req.flash('success', 'Listing updated!');
  res.redirect('/listings');
};
module.exports.deleteListing=async(req,res) => {
   let {id}=req.params;
   let deletedListing=await Listing.findByIdAndDelete(id);
   req.flash("success","Listing deleted!");
   res.redirect("/listings");
};