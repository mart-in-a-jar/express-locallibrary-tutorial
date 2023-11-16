const mongoose = require("mongoose");
const { DateTime } = require("luxon");

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

// Add one day and format
BookInstanceSchema.virtual("due_back_formatted").get(function () {
    return (
        DateTime.fromJSDate(this.due_back)
            .plus({ days: 1 })
            // .setLocale("nb")
            // .toLocaleString({ day: "2-digit", month: "2-digit", year: "numeric" });
            .toLocaleString(DateTime.DATE_MED)
    );
});

BookInstanceSchema.virtual("due_back_for_html").get(function () {
    return DateTime.fromJSDate(this.due_back).toISODate(); // YYYY-MM-DD
});

module.exports = mongoose.model("bookInstances", BookInstanceSchema);
