const Genre = require("../models/Genre");
const Book = require("../models/Book");
const asyncHandler = require("express-async-handler");
const propagateError = require("../utils/errors");
const { body, validationResult } = require("express-validator");

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
    const allGenres = await Genre.find({}).sort({ name: 1 }).exec();

    res.render("genreList", { title: "Genre List", genreList: allGenres });
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
    // Get details of genre and all associated books (in parallel)
    const [genre, booksInGenre] = await Promise.all([
        Genre.findById(req.params.id).exec(),
        Book.find({ genre: req.params.id }, { title: 1, summary: 1 }).exec(),
    ]).catch((e) => {
        // Throw 404 if genre is not found
        if (e.name === "CastError") {
            propagateError.error(404, "Genre not found", next);
        }
        return next(e);
    });

    if (!genre) {
        // No results (requires valid objectID)
        propagateError.error(404, "Genre not found", next);
    }

    res.render("genreDetail", { title: "Genre Detail", genre, booksInGenre });
});

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
    res.render("genreForm", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
    // Validate and sanitize the name field.
    body("name", "Genre name must contain at least 3 characters")
        .trim()
        .isLength({ min: 3 })
        .escape(),
    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data.
        const genre = new Genre({ name: req.body.name });

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render("genreForm", {
                title: "Create Genre",
                genre: genre,
                errors: errors.array(),
            });
        } else {
            // Data from form is valid.
            // Check if Genre with same name already exists.
            const genreExists = await Genre.findOne({
                name: req.body.name,
            })
                .collation({ locale: "en", strength: 2 })
                .exec();
            if (genreExists) {
                // Genre exists, redirect to its detail page.
                res.redirect(genreExists.url);
            } else {
                await genre.save();
                // New genre saved. Redirect to genre detail page.
                res.redirect(genre.url);
            }
        }
    }),
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
    const [genre, books] = await Promise.all([
        Genre.findById(req.params.id).exec(),
        Book.find({ genre: req.params.id }, { title: 1 })
            .populate("author")
            .exec(),
    ]);

    if (!genre) {
        return res.redirect("/catalog/genres");
    }

    res.render("genreDelete", { title: "Delete Genre", genre, books });
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
    const [genre, books] = await Promise.all([
        Genre.findById(req.params.id).exec(),
        Book.find({ genre: req.params.id }, { title: 1 })
            .populate("author")
            .exec(),
    ]);

    if (books.length > 0) {
        return res.render("genreDelete", {
            title: "Delete Genre",
            genre,
            books,
        });
    }

    await Genre.deleteOne({ _id: req.params.id });
    res.redirect("/catalog/genres");
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
    const genre = await Genre.findById(req.params.id);

    if (!genre) {
        propagateError.error(404, "Genre not found", next);
    }

    res.render("genreForm", { title: "Update Genre", genre });
});

// Handle Genre update on POST.

exports.genre_update_post = [
    body("name", "Genre name must contain at least 3 characters")
        .trim()
        .isLength({ min: 3 })
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const genre = new Genre({
            name: req.body.name,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            return res.render("genreForm", {
                title: "Update Genre",
                genre,
                errors: errors.array(),
            });
        }

        const updatedGenre = await Genre.findByIdAndUpdate(
            req.params.id,
            genre
        );
        res.redirect(updatedGenre.url);
    }),
];
