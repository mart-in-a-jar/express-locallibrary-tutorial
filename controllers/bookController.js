const Book = require("../models/Book");
const Author = require("../models/Author");
const Genre = require("../models/Genre");
const BookInstance = require("../models/BookInstance");

const propagateError = require("../utils/errors");

const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
    const [
        numBooks,
        numBookInstances,
        numAvailableBookInstances,
        numAuthors,
        numGenres,
    ] = await Promise.all([
        Book.countDocuments({}).exec(),
        BookInstance.countDocuments({}).exec(),
        BookInstance.countDocuments({ status: "available" }).exec(),
        Author.countDocuments({}).exec(),
        Genre.countDocuments({}).exec(),
    ]);
    res.render("index", {
        title: "Local Library Home",
        amount: {
            books: numBooks,
            bookInstances: {
                all: numBookInstances,
                available: numAvailableBookInstances,
            },
            authors: numAuthors,
            genres: numGenres,
        },
    });
});

// Display list of all books.
exports.book_list = asyncHandler(async (req, res, next) => {
    const allBooks = await Book.find({}, { title: 1, author: 1 })
        .sort({ title: 1 })
        .populate("author")
        .exec();
    res.render("bookList", { title: "Book List", bookList: allBooks });
});

// Display detail page for a specific book.
exports.book_detail = asyncHandler(async (req, res, next) => {
    // Get details of books, book instances for specific book
    const [book, bookInstances] = await Promise.all([
        Book.findById(req.params.id)
            .populate("author")
            .populate("genre")
            .exec(),
        BookInstance.find({ book: req.params.id }).exec(),
    ]).catch((e) => {
        // Throw 404 if book is not found
        if (e.name === "CastError") {
            propagateError.error(404, "Book not found", next);
        }
        return next(e);
    });

    if (!book) {
        // No results (requires valid objectID)
        propagateError.error(404, "Book not found", next);
    }

    res.render("bookDetail", {
        title: book.title,
        book: book,
        bookInstances: bookInstances,
    });
});

// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Book create GET");
});

// Handle book create on POST.
exports.book_create_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Book create POST");
});

// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Book delete GET");
});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Book delete POST");
});

// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Book update GET");
});

// Handle book update on POST.
exports.book_update_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Book update POST");
});
