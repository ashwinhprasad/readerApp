const router = require("express").Router();
const { addBooksToShelf, removeBookFromShelf, retrieveLatestBooks } = require("../controllers/shelf")
const { isAuthenticated } = require("../middlewares/auth")

router.post("/:bookId",isAuthenticated,addBooksToShelf);
router.get("/", isAuthenticated, retrieveLatestBooks);
router.delete("/:bookId", isAuthenticated, removeBookFromShelf);

module.exports = router;