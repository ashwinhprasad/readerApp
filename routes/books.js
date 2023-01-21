const router = require("express").Router();
const { addBooks } = require("../controllers/books")
const { isAuthenticated } = require("../middlewares/auth")

router.post("/", isAuthenticated, addBooks);



module.exports = router;