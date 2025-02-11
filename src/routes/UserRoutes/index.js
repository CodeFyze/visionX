const express = require("express");
const jwt = require("jsonwebtoken");
const Users = require("./../../models/UserModel");
const {
  followUser,
  unfollowUser,
  toggleSaveUser,
} = require("../../controllers/UserControllers");
const router = express.Router();

router.put("/update-profile", async (req, res) => {
  const { currentEmail, currentPassword, updates } = req.body;

  try {
    const user = req.user;

    if (!updates || typeof updates !== "object") {
      return res.status(400).json({ message: "Invalid updates provided" });
    }

    if (updates.email) {
      if (!currentEmail) {
        return res.status(400).json({
          message: "Current email is required to update email",
          status: "fail",
        });
      }
      if (user.email !== currentEmail) {
        return res
          .status(400)
          .json({ message: "Current email is incorrect", status: "fail" });
      }
      let findUser = await Users.findOne({ email: updates.email });
      if (findUser) {
        return res.status(400).json({
          message: "Email already exist",
          status: "fail",
        });
      }
      user.email = updates.email;
    }

    if (updates.password) {
      if (!currentPassword) {
        return res.status(400).json({
          message: "Current password is required to update password",
          status: "fail",
        });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect", status: "fail" });
      }
      user.password = updates.password;
    }

    if (updates.username) {
      user.username = updates.username;
    }

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", status: "fail" });
  }
});

router.post("/follow", followUser);
router.post("/unfollow", unfollowUser);
// routes/UserRoutes.js
router.post("/user-save/:creatorId", toggleSaveUser);
module.exports = router;
