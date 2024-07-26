const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js")
//Post Route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.post)
);
//DELETE ROUTE
router.delete(
  "/:reviewId",
  isLoggedIn,
  wrapAsync(reviewController.delete)
);

module.exports = router;
