const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const  listingController = require("../controllers/listings.js")
// Index Route
router.get(
  "/",
  wrapAsync(listingController.index));

// New Route
router.get("/new", isLoggedIn,listingController.renderNewForm);

// Show Route
router.get(
  "/:id",
  wrapAsync(listingController.show)
);

// Create Route
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(listingController.create)
);

// Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.edit)
);

// Update Route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(listingController.update)
);

// Delete Route
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.delete)
);
module.exports = router;
