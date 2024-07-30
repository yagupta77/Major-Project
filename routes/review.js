const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { validateReview, isLoggedIn } = require("../middleware");
const reviewController = require("../controllers/reviews");

// POST Route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.post)
);

// DELETE Route
router.delete(
  "/:reviewId",
  isLoggedIn,
  wrapAsync(reviewController.delete)
);

module.exports = router;


