const Listing = require("../models/listing"); // Ensure the Listing model is imported
const Review = require("../models/review");

module.exports.post = async (req, res) => {
    try {
        let listing = await Listing.findById(req.params.id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        
        let newReview = new Review(req.body.review);
        newReview.author = req.user._id;
        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();
        
        req.flash("success", "New Review Created");
        res.redirect(`/listings/${listing.id}`);
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong");
        res.redirect("/listings");
    }
};

module.exports.delete = async (req, res) => {
    try {
        let { id, reviewId } = req.params;
        
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        
        req.flash("success", "Review Deleted");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong");
        res.redirect("/listings");
    }
};
