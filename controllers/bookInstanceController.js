const BookInstance = require("../models/BookInstance");
const asyncHandler = require("express-async-handler");
const Book = require("../models/Book");

const propagateError = require("../utils/errors");

const { body, validationResult } = require("express-validator");
const Author = require("../models/Author");

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
    const books = await Book.find({}, { title: 1 })
        .collation({ locale: "en", strength: 2 })
        .sort({ title: 1 })
        .exec();

    res.render("bookInstanceForm", { title: "Create Book Copy", books });
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    // Validate and sanitize fields.
    body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
    body("imprint", "Imprint must be specified")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("status").escape(),
    body("due_back", "Invalid date")
        .optional({ values: "falsy" })
        .isISO8601()
        .toDate(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        const { book, imprint, status, due_back } = req.body;
        const bookInstance = new BookInstance({
            book,
            imprint,
            status,
            due_back,
        });

        if (!errors.isEmpty()) {
            // There are errors.
            // Render form again with sanitized values and error messages.

            const books = await Book.find({}, { title: 1 })
                .collation({ locale: "en", strength: 2 })
                .sort({ title: 1 })
                .exec();

            res.render("bookInstanceForm", {
                title: "Create Book Copy",
                books,
                bookInstance,
                errors: errors.array(),
            });
        } else {
            // Data from form is valid
            await bookInstance.save();
            res.redirect(bookInstance.url);
        }
    }),
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
    const bookInstance = await BookInstance.findById(req.params.id).exec();

    if (!bookInstance) {
        return res.redirect("/catalog/bookinstances");
    }

    return res.render("bookInstanceDelete", {
        title: "Delete Book Copy",
        bookInstance,
    });
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
    const bookInstance = await BookInstance.findByIdAndDelete(req.params.id)
        .exec()
        .catch(() => {
            return res.sendStatus(404);
        });

    if (!bookInstance) {
        return res.sendStatus(404);
    }

    res.redirect("/catalog/bookinstances");
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
    const [bookInstance, books] = await Promise.all([
        BookInstance.findById(req.params.id).exec(),
        Book.find({}, { title: 1 }).exec(),
    ]);

    if (!bookInstance) {
        propagateError.error(404, "Book copy not found", next);
    }

    res.render("bookInstanceForm", {
        title: "Update Book Copy",
        bookInstance,
        books,
    });
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
    body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
    body("imprint", "Imprint must be specified")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("status").escape(),
    body("due_back", "Invalid date")
        .optional({ values: "falsy" })
        .isISO8601()
        .toDate(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            const books = await Book.find({}, { title: 1 })
                .collation({ locale: "en", strength: 2 })
                .sort({ title: 1 })
                .exec();
            return res.render("bookInstanceForm", {
                title: "Update Book Copy",
                bookInstance,
                books,
                errors: errors.array(),
            });
        }

        await BookInstance.updateOne({ _id: req.params.id }, bookInstance);

        res.redirect(bookInstance.url);
    }),
];
