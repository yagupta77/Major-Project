if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}


// Dependencies
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/users");
const listingsRouter = require("./routes/listing");
const reviewsRouter = require("./routes/review");
const userRouter = require("./routes/user");
const { listingSchema } = require("./schema");

// Database URL
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

// Session Store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SESSION_SECRET || "defaultSessionSecret",
  },
  touchAfter: 24 * 3600, // time period in seconds
});

store.on("error", (err) => {
  console.log("Error in Mongo session store", err);
});

const sessionOptions = {
  store: store,
  name: 'session',
  secret: process.env.SESSION_SECRET || "defaultSessionSecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
  },
};

// Connect to MongoDB
async function main() {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to DB");
  } catch (err) {
    console.error("Database connection error:", err);
  }
}
main();

// Middleware
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user; // Ensure currUser is set
  next();
});

// Validate Listing Middleware
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    console.log(msg);
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
//Routes
app.get("/", (req, res) => {
  res.redirect("/listings");
});
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// Route Debugging
app.use((req, res, next) => {
  console.log(`Request URL: ${req.originalUrl}`);
  next();
});

// 404 Error Handling
app.all("*", (req, res, next) => {
  const err = new ExpressError("Page not found", 404);
  next(err);
});

// General Error Handling
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  console.log(`Error Status Code: ${statusCode}, Message: ${message}`);
  res.status(statusCode).render("error", { err });
});

// Start Server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});











