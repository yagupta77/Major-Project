const Listing = require("../models/listing")
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }


  module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
  };

  module.exports.show = (async (req, res) => {
    let { id } = req.params;
    if (id.length !== 24) {
      throw new ExpressError("Page not found", 404);
    }
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
  })

  module.exports.create=(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "Listing created successfully!");
    res.redirect("/listings");
  })

module.exports.edit = (async (req, res) => {
  let { id } = req.params;
  if (id.length !== 24) {
    throw new ExpressError("Page not found", 404);
  }
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing with this id does not exist");
    return res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
})
module.exports.update = (async (req, res) => {
  let { id } = req.params;
  if (id.length !== 24) {
    throw new ExpressError("Page not found", 404);
  }
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "Listing was updated successfully");
  res.redirect(`/listings/${id}`);
})
module.exports.delete = (async (req, res) => {
  let { id } = req.params;
  if (id.length !== 24) {
    throw new ExpressError("Page not found", 404);
  }
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing was deleted successfully");
  res.redirect("/listings");
})