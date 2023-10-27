const mongoose = require("mongoose");

const BookInstanceSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "books",
        required: true,
    },
    imprint: { type: String, required: true },
    status: {
        type: String,
        required: true,
        enum: ["available", "maintenance", "loaned", "reserved"],
        default: "maintenance",
        lowercase: true,
    },
    due_back: { type: Date, default: Date.now },
});

BookInstanceSchema.virtual("url").get(function () {
    return `/catalog/bookinstance/${this._id}`;
});

module.exports = mongoose.model("bookInstances", BookInstanceSchema);
