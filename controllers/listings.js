const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const mapToken = process.env.MAP_TOKEN;
const mbxGeocoding= require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
module.exports.index = async (req, res) => {
    try {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
    } catch (err) {
        console.log(err);
        req.flash("error", "Cannot retrieve listings");
        res.redirect("/");
    }
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.show = async (req, res) => {
    const { id } = req.params;
    if (id.length !== 24) {
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
            req.flash("error", "Listing with this id does not exist");
            return res.redirect("/listings");
        }
        res.render("listings/show.ejs", { listing });
    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("/listings");
    }
};

module.exports.createListing = async (req, res, next) => {
    try {
        const response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        }).send();

        const match = response.body.features[0];

        if (!match) {
            req.flash("error", "Location not found");
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

        
module.exports.edit = async (req, res) => {
    const { id } = req.params;
    if (id.length !== 24) {
        req.flash("error", "Page not found");
        return res.redirect("/listings");
    }
    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing with this id does not exist");
            return res.redirect("/listings");
        }

        // Define and modify the originalImageUrl
        let originalImageUrl = listing.image.url;
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");

        // Render the template with listing and originalImageUrl
        res.render("listings/edit.ejs", { listing, originalImageUrl });
    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("/listings");
    }
};

module.exports.delete = async (req, res) => {
    const { id } = req.params;
    if (id.length !== 24) {
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

