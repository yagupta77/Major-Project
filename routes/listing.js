const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync");
const { listingSchema, reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn } = require("../middleware.js");

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

// Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// New Route
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

// Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    if (id.length !== 24) {
        throw new Error("Page not found");
    }
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        req.flash("error", "Listing with this id does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));

// Create Route
router.post("/", validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

// Edit Route
router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

// Update Route
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

// Delete Route
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

module.exports = router;
