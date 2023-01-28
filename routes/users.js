const router = require("express").Router();
const { signUp, login, getUserDetails, deleteAccount } = require("../controllers/users");
const { isAuthenticated } = require("../middlewares/auth")

router.post("/", signUp);
router.post("/login",login);
router.get("/",isAuthenticated,getUserDetails);
router.delete("/", isAuthenticated, deleteAccount)


module.exports = router;