const router = require("express").Router();
const { signUp, login, getUserDetails, deleteAccount } = require("../controllers/users");
const { isAuthenticated } = require("../middlewares/auth");
const path = require("path")


// file storage
const multer  = require('multer');
const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, "/home/local/ZOHOCORP/ashwin-pt5592/Documents/code/readerApp/static/images/profile_pics")
    },
    filename:(req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});
const upload = multer({storage:storage});

router.post("/", upload.single("profile_pic"), signUp);
router.post("/login",login);
router.get("/",isAuthenticated,getUserDetails);
router.delete("/", isAuthenticated, deleteAccount)


module.exports = router;