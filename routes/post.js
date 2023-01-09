const express = require("express");

const feedController = require("../controllers/post");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.post("/posts", isAuth, feedController.getPosts);
router.post("/post", isAuth, feedController.createPost);
router.get("/post/:postId", isAuth, feedController.getPost);
router.delete("/post/:postId", isAuth, feedController.deletePost);
router.post("/postviewer/:postId", isAuth, feedController.getPostviewerPost);
router.post("/like/:postId", isAuth, feedController.likePost);
router.post("/comment/:postId", isAuth, feedController.addComment);
router.post("/explore", isAuth, feedController.getExplorePosts);

module.exports = router;
