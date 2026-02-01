const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing");
const Review = require("../models/reviews");
const wrapAsync = require("../utils/wrapAsync");
const { reviewSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const { isLoggedIn, isReviewOwner } = require("../utils/middleware");

// =====================
// CREATE REVIEW
// =====================
router.post("/", isLoggedIn, wrapAsync(async (req, res) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) throw new ExpressError(400, error.message);

    const listing = await Listing.findById(req.params.id);
    const review = new Review(req.body.review);

    review.author = req.user._id;
    listing.reviews.push(review);

    await review.save();
    await listing.save();

    req.flash("success", "Review Added!");
    res.redirect(`/listings/${listing._id}`);
}));

// =====================
// DELETE REVIEW (AUTHOR OR ADMIN)
// =====================
router.delete("/:reviewId",
    isLoggedIn,
    isReviewOwner,
    wrapAsync(async (req, res) => {
        const { id, reviewId } = req.params;

        await Listing.findByIdAndUpdate(id, {
            $pull: { reviews: reviewId }
        });

        await Review.findByIdAndDelete(reviewId);

        req.flash("success", "Review Deleted!");
        res.redirect(`/listings/${id}`);
    })
);

module.exports = router;
