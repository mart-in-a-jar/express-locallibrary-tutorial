const Author = require("../models/Author");
const Book = require("../models/Book");
const propagateError = require("../utils/errors");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

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
exports.author_create_get = (req, res, next) => {
    res.render("authorForm", { title: "Create Author" });
};

// Handle Author create on POST.
exports.author_create_post = [
    // Validate and sanitize fields.
    body("first_name")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("First name must be specified.")
        // Don't do this - names can be non-alphanumeric
        .isAlphanumeric()
        .withMessage("First name has non-alphanumeric characters."),
    body("family_name")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Family name must be specified.")
        // Don't do this - names can be non-alphanumeric
        .isAlphanumeric()
        .withMessage("Family name has non-alphanumeric characters."),
    body("date_of_birth", "Invalid date of birth")
        .optional({ values: "falsy" })
        .isISO8601()
        .toDate(),
    body("date_of_death", "Invalid date of death")
        .optional({ values: "falsy" })
        .isISO8601()
        .toDate(),
    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create Author object with escaped and trimmed data
        const { first_name, family_name, date_of_birth, date_of_death } =
            req.body;
        const author = new Author({
            first_name,
            family_name,
            date_of_birth,
            date_of_death,
        });
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render("authorForm", {
                title: "Create Author",
                author,
                errors: errors.array(),
            });
        } else {
            // Data from form is valid

            // Save author
            await author.save();
            res.redirect(author.url);
        }
    }),
];

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
