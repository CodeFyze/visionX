const express = require("express");
const {
  createPost,
  likePost,
  commentOnPost,
  tipPost,
  savePost,
  getPost,
} = require("../../controllers/PostControllers");
const { mediaUpload } = require("./../../middlewares/uploadMiddleware");
const router = express.Router();

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  } else if (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
  next();
});

router.post(
  "/",
  mediaUpload.fields([
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
