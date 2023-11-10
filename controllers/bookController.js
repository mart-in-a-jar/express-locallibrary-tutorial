const Book = require("../models/Book");
const Author = require("../models/Author");
const Genre = require("../models/Genre");
const BookInstance = require("../models/BookInstance");

const propagateError = require("../utils/errors");

const { body, validationResult } = require("express-validator");
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
    // Get all authors and genres, which we can use for adding to our book.
    const [authors, genres] = await Promise.all([
        Author.find().sort({ family_name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec(),
    ]);

    res.render("bookForm", { title: "Create Book", authors, genres });
});

// Handle book create on POST.
exports.book_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if (!Array.isArray(req.body.genre)) {
            req.body.genre = req.body.genre ? [req.body.genre] : [];
        }
        next();
    },
    // Validate and sanitize fields.
    body("genre.*").escape(),
    body("isbn", "ISBN must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("title", "Title must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("author", "Author must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("summary", "Summary must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        const { title, author, summary, isbn, genre } = req.body;
        const book = new Book({
            title,
            author,
            summary,
            isbn,
            genre,
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            const [authors, genres] = await Promise.all([
                Author.find().sort({ family_name: 1 }).exec(),
                Genre.find().sort({ name: 1 }).exec(),
            ]);

            // Mark our selected genres as checked.
            for (const genre of genres) {
                if (book.genre.includes(genre._id)) {
                    genre.checked = true;
                }
            }
            res.render("bookForm", {
                title: "Create Book",
                authors,
                genres,
                errors: errors.array(),
                book,
            });
        } else {
            // Data from form is valid. Save book.
            await book.save();
            res.redirect(book.url);
        }
    }),
];

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
    // Get book, authors and genres for form.
    const [book, authors, genres] = await Promise.all([
        Book.findById(req.params.id)
            .populate("author")
            .populate("genre")
            .exec(),
        Author.find().exec(),
        Genre.find().exec(),
    ]).catch((e) => {
        // Throw 404 if book is not found
        if (e.name === "CastError") {
            propagateError.error(404, "Book not found", next);
        }
        return next(e);
    });

    if (!book) {
        // No results.
        propagateError.error(404, "Book not found", next);
    }

    // Mark our selected genres as checked.
    genres.forEach((genre) => {
        book.genre.forEach((bookGenre) => {
            if (genre._id.toString() === bookGenre._id.toString()) {
                genre.checked = true;
            }
        });
    });

    res.render("bookForm", {
        title: "Update Book",
        authors,
        genres,
        book,
    });
});

// Handle book update on POST.
exports.book_update_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if (!Array.isArray(req.body.genre)) {
            req.body.genre = req.body.genre ? [req.body.genre] : [];
        }
        next();
    },

    // Validate and sanitize fields.
    body("title", "Title must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("author", "Author must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("summary", "Summary must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
    body("genre.*").escape(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre,
            id: req.params.id, // This is required, or a new ID will be assigned!
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form
            const [authors, genres] = await Promise.all([
                Author.find().exec(),
                Genres.find().exec(),
            ]);

            // Mark our selected genres as checked.
            genres.forEach((genre) => {
                if (book.genre.indexOf(genre._id) >= 0) {
                    genre.checked = true;
                }
            });
            return res.render("bookForm", {
                title: "Update book",
                authors,
                genres,
                book,
                errors: errors.array(),
            });
        }

        // Data from form is valid. Update the record.
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            book,
            {}
        );
        // Redirect to book detail page.
        res.redirect(updatedBook.url);
    }),
];
