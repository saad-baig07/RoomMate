const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

// LOGIN FORM
router.get("/login", (req, res) => {
    res.render("users/login");
});

// LOGIN LOGIC
router.post("/login", async (req, res, next) => {
    const { username } = req.body;

    const userExists = await User.findOne({ username });
    if (!userExists) {
        req.flash("error", "User not found");
        return res.redirect("/login");
    }

    passport.authenticate("local", (err, user) => {
        if (err) return next(err);

        if (!user) {
            req.flash("error", "Wrong password");
            return res.redirect("/login");
        }

        req.logIn(user, (err) => {
            if (err) return next(err);
            const redirectUrl = req.session.returnTo || "/listings";
            delete req.session.returnTo;
            res.redirect(redirectUrl);
        });
    })(req, res, next);
});

// RESET FORM
router.get("/reset", (req, res) => {
    res.render("users/reset");
});

// RESET LOGIC
router.post("/reset", async (req, res) => {
    const { username, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        req.flash("error", "Passwords do not match");
        return res.redirect("/reset");
    }

    const user = await User.findOne({ username });
    if (!user) {
        req.flash("error", "User not found");
        return res.redirect("/reset");
    }

    await user.setPassword(newPassword);
    await user.save();

    req.flash("success", "Password reset successfully. Please login.");
    res.redirect("/login");
});

// SIGNUP FORM
router.get("/signup", (req, res) => {
    res.render("users/signup");
});

// SIGNUP LOGIC
router.post("/signup", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);

        req.logIn(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Roommate!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
});

// LOGOUT
router.get("/logout", (req, res) => {
    req.logout(() => {
        req.flash("success", "Logged out successfully");
        res.redirect("/listings");
    });
});

module.exports = router;
