const Author = require("../models/Author");
const Book = require("../models/Book");
const asyncHandler = require("express-async-handler");
const propagateError = require("../utils/errors");

// Display list of all Authors.
exports.author_list = asyncHandler(async (req, res, next) => {
    const allAuthors = await Author.find({})
        .sort({ family_name: 1, first_name: 1 })
        .exec();

    res.render("authorList", { title: "Author List", authorList: allAuthors });
});

// Display detail page for a specific Author.
exports.author_detail = asyncHandler(async (req, res, next) => {
    // Get details of author and all their books (in parallel)
    const [author, books] = await Promise.all([
        Author.findById(req.params.id).exec(),
        Book.find({ author: req.params.id }, { title: 1, summary: 1 }).exec(),
    ]).catch((e) => {
        // Throw 404 if author is not found
        if (e.name === "CastError") {
            propagateError.error(404, "Author not found", next);
        }
        return next(e);
    });

    if (!author) {
        // No results (requires valid objectID)
        propagateError.error(404, "Author not found", next);
    }

    res.render("authorDetail", { title: "Author Detail", author, books });
});

// Display Author create form on GET.
exports.author_create_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Author create GET");
});

// Handle Author create on POST.
exports.author_create_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Author create POST");
});

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Author delete GET");
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Author delete POST");
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Author update GET");
});

// Handle Author update on POST.
exports.author_update_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Author update POST");
});
