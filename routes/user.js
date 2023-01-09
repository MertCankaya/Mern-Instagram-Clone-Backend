const express = require("express");

const userController = require("../controllers/user");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/users", isAuth, userController.getAllUsers);
router.post("/user", isAuth, userController.getUser);
router.post("/followUser", isAuth, userController.followUser);
router.post("/suggestion", isAuth, userController.getSuggestedUsers);
router.post("/followingUsers", isAuth, userController.getFollowingUsers);
router.post("/getMessages", isAuth, userController.getMessages);
router.post("/uploadMessage", isAuth, userController.uploadMessage);

module.exports = router;
