const BookInstance = require("../models/BookInstance");
const asyncHandler = require("express-async-handler");

const propagateError = require("../utils/errors");

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
    const allBookInstances = await BookInstance.find({})
        .populate("book")
        .exec();

    allBookInstances.sort((a, b) => a.book.title.localeCompare(b.book.title));

    res.render("bookInstanceList", {
        title: "Book Instance List",
        bookInstanceList: allBookInstances,
    });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
    const bookInstance = await BookInstance.findById(req.params.id)
        .populate("book")
        .exec()
        .catch((error) => {
            // Throw 404 if book instance is not found
            if (error.name === "CastError") {
                propagateError.error(404, "Book copy not found", next);
            }
            return next(error);
        });

    if (!bookInstance) {
        // No results (requires valid objectID)
        propagateError.error(404, "Book copy not found", next);
    }

    res.render("bookInstanceDetail", { title: "Book copy", bookInstance });
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: BookInstance create GET");
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: BookInstance create POST");
});

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: BookInstance delete GET");
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: BookInstance delete POST");
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: BookInstance update GET");
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: BookInstance update POST");
});
