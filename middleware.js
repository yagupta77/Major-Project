const Listing = require("./models/listing");
const Review = require("./models/review"); // Ensure this line is present
const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create a listing");
    return res.redirect('/login');
  }
  next();
};

module.exports.saveRedirecturl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl; // Clear the redirect URL after it's been used
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to edit this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};


