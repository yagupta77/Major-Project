const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });

// Route to render the form for creating a new listing
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Route to show a specific listing
router.get("/:id", wrapAsync(listingController.show));

// Routes for listing operations
router.route("/")
  .get(wrapAsync(listingController.index)) // Get all listings
  .post(
    isLoggedIn,
    validateListing,
    upload.single("listing[image]"), // Handle file upload
    wrapAsync(listingController.createListing) // Create a new listing
  );

// Route to render the edit form for a specific listing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.edit));

// Route to update a specific listing
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(listingController.update)
);

// Route to delete a specific listing
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.delete)
);

module.exports = router;


