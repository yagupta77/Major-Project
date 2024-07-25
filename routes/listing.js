const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

// Index Route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

// New Route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

// Show Route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    if (id.length !== 24) {
      throw new ExpressError("Page not found", 404);
    }
    const listing = await Listing.findById(id).populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    });
    if (!listing) {
      req.flash("error", "Listing with this id does not exist");
      return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
  })
);

// Create Route
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "Listing created successfully!");
    res.redirect("/listings");
  })
);

// Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    if (id.length !== 24) {
      throw new ExpressError("Page not found", 404);
    }
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing with this id does not exist");
      return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  })
);

// Update Route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    if (id.length !== 24) {
      throw new ExpressError("Page not found", 404);
    }
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing was updated successfully");
    res.redirect(`/listings/${id}`);
  })
);

// Delete Route
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    if (id.length !== 24) {
      throw new ExpressError("Page not found", 404);
    }
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing was deleted successfully");
    res.redirect("/listings");
  })
);

module.exports = router;
