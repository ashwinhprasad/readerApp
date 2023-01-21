const router = require("express").Router();
const { signUp, login, getUserDetails } = require("../controllers/users");
const { isAuthenticated } = require("../middlewares/auth")

router.post("/", signUp);
router.post("/login",login);
router.get("/",isAuthenticated,getUserDetails);


module.exports = router;