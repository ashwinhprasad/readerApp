const router = require("express").Router();
const { addBooksToShelf } = require("../controllers/shelf")
const { isAuthenticated } = require("../middlewares/auth")

router.post("/:bookId",isAuthenticated,addBooksToShelf);

module.exports = router;