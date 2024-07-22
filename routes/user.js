const express = require("express");
const router = express.Router();
const User = require("../models/users.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const NewUser = new User({ email, username });
      const registeredUser = await User.register(NewUser, password);
      console.log(registeredUser);
      req.flash("success", "User register Successfully");
      res.redirect("/listings");
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  })
);
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash( "success","Welcometo Login Back Your Acoount")
    res.redirect("/listings")
  }
);

module.exports = router;
