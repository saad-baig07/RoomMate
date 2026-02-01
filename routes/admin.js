const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Listing = require("../models/listing");
const Review = require("../models/reviews");
const { isAdmin } = require("../utils/middleware");

// =====================
// ADMIN DASHBOARD (STEP 11)
// =====================
router.get("/dashboard", isAdmin, async (req, res) => {
    const usersCount = await User.countDocuments();
    const listingsCount = await Listing.countDocuments();
    const reviewsCount = await Review.countDocuments();

    res.render("admin/dashboard", {
        usersCount,
        listingsCount,
        reviewsCount
    });
});

// =====================
// VIEW ALL USERS (STEP 6)
// =====================
router.get("/users", isAdmin, async (req, res) => {
    const users = await User.find({});
    res.render("admin/users", { users });
});

// =====================
// DELETE USER (STEP 9)
// =====================
router.delete("/users/:id", isAdmin, async (req, res) => {
    const { id } = req.params;

    // ❌ Prevent admin from deleting self
    if (req.user._id.equals(id)) {
        req.flash("error", "You cannot delete yourself");
        return res.redirect("/admin/users");
    }

    await User.findByIdAndDelete(id);
    req.flash("success", "User deleted successfully");
    res.redirect("/admin/users");
});

// =====================
// PROMOTE / DEMOTE USER (STEP 10)
// =====================
router.put("/users/:id/role", isAdmin, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!["admin", "user"].includes(role)) {
        req.flash("error", "Invalid role");
        return res.redirect("/admin/users");
    }

    await User.findByIdAndUpdate(id, { role });
    req.flash("success", "User role updated");
    res.redirect("/admin/users");
});

module.exports = router;
