const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js"); // <-- fixed path

const mongoose_url = "mongodb://127.0.0.1:27017/Roommate";

async function main() {
    await mongoose.connect(mongoose_url);
}

main()
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log(err);
    });

const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("data was initialised");
};

initDB();
