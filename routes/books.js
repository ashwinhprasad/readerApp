const router = require("express").Router();
const { addBooks, retrieveUserBooksInfo } = require("../controllers/books")
const { isAuthenticated } = require("../middlewares/auth")

router.post("/", isAuthenticated, addBooks);
router.get("/userBookInfo", isAuthenticated, retrieveUserBooksInfo)


module.exports = router;