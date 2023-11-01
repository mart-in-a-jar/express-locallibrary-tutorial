const express = require("express");
const router = express.Router();

const authorController = require("../controllers/authorController");
const bookController = require("../controllers/bookController");
const genreController = require("../controllers/genreController");
const bookInstanceController = require("../controllers/bookInstanceController");

/// BOOK ROUTES ///

// GET catalog home page.
router.get("/", bookController.index);

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
// POST request for creating Book.
router
    .route("/book/create")
    .get(bookController.book_create_get)
    .post(bookController.book_create_post);

// GET request to delete Book.
// POST request to delete Book.
router
    .route("/book/:id/delete")
    .get(bookController.book_delete_get)
    .post(bookController.book_delete_post);

// GET request to update Book.
// POST request to update Book.
router
    .route("/book/:id/update")
    .get(bookController.book_update_get)
    .post(bookController.book_update_post);

// GET request for one Book.
router.get("/book/:id", bookController.book_detail);

// GET request for list of all Book items.
router.get("/books", bookController.book_list);

/// AUTHOR ROUTES ///

// GET request for creating Author. NOTE This must come before route for id (i.e. display author).
// POST request for creating Author.
router
    .route("/author/create")
    .get(authorController.author_create_get)
    .post(authorController.author_create_post);

// GET request to delete Author.
// POST request to delete Author.
router
    .route("/author/:id/delete")
    .get(authorController.author_delete_get)
    .post(authorController.author_delete_post);

// GET request to update Author.
// POST request to update Author.
router
    .route("/author/:id/update")
    .get(authorController.author_update_get)
    .post(authorController.author_update_post);

// GET request for one Author.
router.get("/author/:id", authorController.author_detail);

// GET request for list of all Authors.
router.get("/authors", authorController.author_list);

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
// POST request for creating Genre.
router
    .route("/genre/create")
    .get(genreController.genre_create_get)
    .post(genreController.genre_create_post);

// GET request to delete Genre.
// POST request to delete Genre.
router
    .route("/genre/:id/delete")
    .get(genreController.genre_delete_get)
    .post(genreController.genre_delete_post);

// GET request to update Genre.
// POST request to update Genre.
router
    .route("/genre/:id/update")
    .get(genreController.genre_update_get)
    .post(genreController.genre_update_post);

// GET request for one Genre.
router.get("/genre/:id", genreController.genre_detail);

// GET request for list of all Genre.
router.get("/genres", genreController.genre_list);

/// BOOKINSTANCE ROUTES ///

// GET request for creating a BookInstance. NOTE This must come before route that displays BookInstance (uses id).
// POST request for creating BookInstance.
router
    .route("/bookinstance/create")
    .get(bookInstanceController.bookinstance_create_get)
    .post(bookInstanceController.bookinstance_create_post);

// GET request to delete BookInstance.
// POST request to delete BookInstance.
router
    .route("/bookinstance/:id/delete")
    .get(bookInstanceController.bookinstance_delete_get)
    .post(bookInstanceController.bookinstance_delete_post);

// GET request to update BookInstance.
// POST request to update BookInstance.
router
    .route("/bookinstance/:id/update")
    .get(bookInstanceController.bookinstance_update_get)
    .post(bookInstanceController.bookinstance_update_post);

// GET request for one BookInstance.
router.get("/bookinstance/:id", bookInstanceController.bookinstance_detail);

// GET request for list of all BookInstance.
router.get("/bookinstances", bookInstanceController.bookinstance_list);


module.exports = router;