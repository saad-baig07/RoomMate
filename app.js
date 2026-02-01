const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError");
const listingRoutes = require("./routes/listing");
const reviewRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user");
const User = require("./models/user");
const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

const mongo_url = "mongodb://127.0.0.1:27017/Roommate";

// =====================
// SESSION CONFIG
// =====================
const sessionOptions = {
    secret: "mysecretMsg",
    resave: false,
    saveUninitialized: false, // ✅ FIX
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));

// =====================
// PASSPORT CONFIG
// =====================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =====================
// FLASH
// =====================
app.use(flash());

// =====================
// GLOBAL LOCALS
// =====================
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

// =====================
// DATABASE
// =====================
async function main() {
    await mongoose.connect(mongo_url);
}
main()
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log(err));

// =====================
// VIEW ENGINE
// =====================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// =====================
// MIDDLEWARE
// =====================
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// =====================
// ROUTES
// =====================
app.use("/", userRoutes);
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);

// =====================
// IGNORE FAVICON
// =====================
app.get("/favicon.ico", (req, res) => res.status(204));

// =====================
// HOME
// =====================
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// =====================
// 404 HANDLER
// =====================
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// =====================
// ERROR HANDLER
// =====================
app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong!" } = err;
    res.status(status).send(message);
});

// =====================
// SERVER
// =====================
app.listen(8080, () => {
    console.log("App is listening on port 8080");
});
