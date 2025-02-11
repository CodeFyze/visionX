const express = require("express");
const upload = require("../../utils/multer");
const {
  createPost,
  likePost,
  commentOnPost,
  tipPost,
  savePost,
  getPost,
} = require("../../controllers/PostControllers");
const router = express.Router();

router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 }, // Optional image upload
    { name: "video", maxCount: 1 }, // Optional video upload
  ]),
  createPost
);
router.get("/:postId", getPost);
router.post("/like", likePost);
router.post("/comment", commentOnPost);
router.post("/tip", tipPost);
router.post("/save", savePost);

module.exports = router;
