const express = require("express");
const router = express.Router();
const {
  createStory,
  getFollowedStories,
} = require("./../../controllers/StoriesController");
const { storyUpload } = require("./../../middlewares/uploadMiddleware");
router.post("/", storyUpload.single("media"), createStory);
router.get("/", getFollowedStories);

module.exports = router;
