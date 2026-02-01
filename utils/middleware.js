const Listing = require("../models/listing");
const Review = require("../models/reviews");

// =====================
// LOGIN CHECK
// =====================
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    }
    next();
};

// =====================
// LISTING OWNER OR ADMIN
// =====================
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    // ✅ ADMIN CAN DO ANYTHING
    if (req.user.role === "admin") {
        return next();
    }

    // ❌ NOT OWNER
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "Permission denied");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

// =====================
// REVIEW OWNER OR ADMIN
// =====================
module.exports.isReviewOwner = async (req, res, next) => {
    const { reviewId, id } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }

    // ✅ ADMIN CAN DELETE ANY REVIEW
    if (req.user.role === "admin") {
        return next();
    }

    // ❌ NOT REVIEW OWNER
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "Permission denied");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

// =====================
// ADMIN ONLY
// =====================
module.exports.isAdmin = (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
        req.flash("error", "Admin access only");
        return res.redirect("/listings");
    }
    next();
};
