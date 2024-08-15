const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const mapToken = process.env.MAP_TOKEN;
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const { cloudinary } = require("../cloudConfig");
const mongoose = require("mongoose");

// Index: Get all listings
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

// Render New Form: Display form to create a new listing
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// Show: Display a specific listing
module.exports.show = async (req, res) => {
    const { id } = req.params;

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Page not found");
        return res.redirect("/listings");
    }

    try {
        const listing = await Listing.findById(id).populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        });

        if (!listing) {
            req.flash("error", "Listing with this ID does not exist");
            return res.redirect("/listings");
        }

        res.render("listings/show.ejs", { listing });
    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("/listings");
    }
};

// Create Listing: Handle the creation of a new listing
module.exports.createListing = async (req, res, next) => {
    try {
        // Geocode the location provided by the user
        const response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        }).send();

        const match = response.body.features[0];

        if (!match) {
            req.flash("error", "Location not found");
            return res.redirect("/listings/new");
        }

        // Check if file upload was successful
        if (!req.file) {
            req.flash("error", "Image upload failed");
            return res.redirect("/listings/new");
        }

        const { path: url, filename } = req.file;
        console.log(url, "..", filename);

        const newListing = new Listing(req.body.listing);
        newListing.image = { url, filename };
        newListing.owner = req.user._id;
        newListing.geometry = match.geometry; // Assign geometry from geocoding response

        let savedListing = await newListing.save();
        console.log(savedListing);

        req.flash("success", "Listing created successfully!");
        res.redirect("/listings");
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong while creating the listing");
        res.redirect("/listings/new");
    }
};

// Edit: Render the form to edit an existing listing
module.exports.edit = async (req, res) => {
    const { id } = req.params;

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Page not found");
        return res.redirect("/listings");
    }

    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing with this ID does not exist");
            return res.redirect("/listings");
        }

        // Modify the originalImageUrl to include specific dimensions
        let originalImageUrl = listing.image.url;
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");

        res.render("listings/edit.ejs", { listing, originalImageUrl });
    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("/listings");
    }
};

// Delete: Handle deletion of a specific listing
module.exports.delete = async (req, res) => {
    const { id } = req.params;

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Page not found");
        return res.redirect("/listings");
    }

    try {
        await Listing.findByIdAndDelete(id);
        req.flash("success", "Listing was deleted successfully");
        res.redirect("/listings");
    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("/listings");
    }
};
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid listing ID");
        return res.redirect("/listings");
    }

    try {
        // Find the listing by ID
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        // Update the listing with the new data
        Object.assign(listing, req.body.listing);

        // If a new image is uploaded, update the image
        if (req.file) {
            // Delete the old image from Cloudinary (if you want to)
            if (listing.image && listing.image.filename) {
                await cloudinary.uploader.destroy(listing.image.filename);
            }

            // Update the listing's image with the new one
            const { path: url, filename } = req.file;
            listing.image = { url, filename };
        }

        // Save the updated listing
        await listing.save();

        req.flash("success", "Listing updated successfully");
        res.redirect(`/listings/${listing._id}`);
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong while updating the listing");
        res.redirect("/listings");
    }
};

