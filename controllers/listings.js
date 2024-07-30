const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");

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
        const { path: url, filename } = req.file;
        console.log(url, "..", filename);

        const newListing = new Listing(req.body.listing);
        newListing.image = { url, filename };
        newListing.owner = req.user._id;
        await newListing.save();

        req.flash("success", "Listing created successfully!");
        res.redirect("/listings");
    } catch (err) {
        console.log(err);
        next(err);
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
        res.render("listings/edit.ejs", { listing });
    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("/listings");
    }
};

module.exports.update = async (req, res) => {
    const { id } = req.params;
    if (id.length !== 24) {
        req.flash("error", "Page not found");
        return res.redirect("/listings");
    }
    try {
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        req.flash("success", "Listing was updated successfully");
        res.redirect(`/listings/${id}`);
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

