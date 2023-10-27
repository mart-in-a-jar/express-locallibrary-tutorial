const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "authors",
        required: true,
    },
    summary: { type: String, required: true },
    isbn: { type: String, required: true },
    genre: [{ type: mongoose.Schema.Types.ObjectId, ref: "genres" }],
});

BookSchema.virtual("url").get(function () {
    return `/catalog/book/${this._id}`;
});

module.exports = mongoose.model("books", BookSchema);
