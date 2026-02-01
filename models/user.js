const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ✅ NODE 24 FIX: use .default
const passportLocalMongoose =
    require("passport-local-mongoose").default;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
});

// ✅ plugin receives a FUNCTION now
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
