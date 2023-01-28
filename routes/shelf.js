const router = require("express").Router();
const { addBooksToShelf, removeBookFromShelf, retrieveLatestBooks, requestBookFromShelf } = require("../controllers/shelf")
const { isAuthenticated } = require("../middlewares/auth")

router.post("/:bookId",isAuthenticated,addBooksToShelf);
router.get("/", isAuthenticated, retrieveLatestBooks);
router.get("/request/:bookId", isAuthenticated, requestBookFromShelf)
router.delete("/:bookId", isAuthenticated, removeBookFromShelf);

module.exports = router;