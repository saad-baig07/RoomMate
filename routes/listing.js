const express = require("express");
const router = express.Router();

const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema");
const { isLoggedIn, isOwner } = require("../utils/middleware");

// =====================
// INDEX
// =====================
router.get("/", wrapAsync(async (req, res) => {
    const allListing = await Listing.find({}).populate("owner");
    res.render("listings/index", { allListing });
}));

// =====================
// NEW
// =====================
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new");
});

// =====================
// CREATE
// =====================
router.post("/", isLoggedIn, wrapAsync(async (req, res) => {
    const { error } = listingSchema.validate(req.body);
    if (error) throw new ExpressError(400, error.message);

    const listing = new Listing(req.body.listing);
    listing.owner = req.user._id;

    await listing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}));

// =====================
// SHOW
// =====================
router.get("/:id", wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate("owner")
        .populate({
            path: "reviews",
            populate: { path: "author" }
        });

    if (!listing) throw new ExpressError(404, "Listing not found");

    res.render("listings/show", { listing });
}));

// =====================
// EDIT (OWNER OR ADMIN)
// =====================
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    res.render("listings/edit", { listing });
}));

// =====================
// UPDATE (OWNER OR ADMIN)
// =====================
router.put("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    await Listing.findByIdAndUpdate(req.params.id, req.body.listing);
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${req.params.id}`);
}));

// =====================
// DELETE (OWNER OR ADMIN)
// =====================
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;
