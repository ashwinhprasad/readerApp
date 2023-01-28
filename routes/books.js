const router = require("express").Router();
const { addBooks, retrieveUserBooksInfo, retrieveBookDetails } = require("../controllers/books")
const { isAuthenticated } = require("../middlewares/auth")

router.post("/", isAuthenticated, addBooks);
router.get("/userBookInfo", isAuthenticated, retrieveUserBooksInfo);
router.get("/:bookId", isAuthenticated, retrieveBookDetails);


module.exports = router;