const express = require("express");
const jwt = require("jsonwebtoken");
const Users = require("./../../models/UserModel");
const {
  followUser,
  unfollowUser,
  toggleSaveUser,
  updateProfile,
} = require("../../controllers/UserControllers");
const router = express.Router();

router.put("/update-profile", updateProfile);
router.post("/follow", followUser);
router.post("/unfollow", unfollowUser);
router.post("/user-save/:creatorId", toggleSaveUser);
module.exports = router;
