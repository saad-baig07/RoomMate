const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type: String,
            default:
                "https://www.freepik.com/free-vector/image-upload-concept-landing-page_5632184.htm",
            set: (v) =>
                v === ""
                    ? "https://www.freepik.com/free-vector/image-upload-concept-landing-page_5632184.htm"
                    : v,
        }
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    location: String,
    country: String,

    // 🔐 publisher (user)
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

module.exports = mongoose.model("Listing", listingSchema);

