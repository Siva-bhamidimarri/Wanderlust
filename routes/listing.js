const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const listingController = require("../controllers/listings.js");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
router
  .route('/')
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn, upload.single('listing[image]'), wrapAsync(listingController.createListing));
router.get("/new", isLoggedIn, listingController.renderNewForm);
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editListing)
);

module.exports = router;