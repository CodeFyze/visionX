const Users = require("./../models/UserModel");
const jwt = require("jsonwebtoken");

exports.updateProfile = async (req, res) => {
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

      if (user?.email !== currentEmail) {
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
};

exports.followUser = async (req, res) => {
  try {
    const { followeeId } = req.body;
    let followerId = req._id;
    if (!followerId || !followeeId) {
      return res
        .status(400)
        .json({ message: "followerId and followeeId are required" });
    }

    if (followerId === followeeId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const follower = await Users.findById(followerId);
    const followee = await Users.findById(followeeId);

    if (!follower || !followee) {
      return res.status(404).json({ message: "User not found" });
    }

    if (follower.following.includes(followeeId)) {
      return res
        .status(400)
        .json({ message: "You are already following this user" });
    }

    follower.following.push(followeeId);
    await follower.save();

    followee.followers.push(followerId);
    await followee.save();

    res
      .status(200)
      .json({ message: "Followed successfully", follower, followee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const { followeeId } = req.body;
    let followerId = req._id;
    if (!followerId || !followeeId) {
      return res
        .status(400)
        .json({ message: "followerId and followeeId are required" });
    }

    const follower = await Users.findById(followerId);
    const followee = await Users.findById(followeeId);

    if (!follower || !followee) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!follower.following.includes(followeeId)) {
      return res
        .status(400)
        .json({ message: "You are not following this user" });
    }

    follower.following = follower.following.filter(
      (id) => id.toString() !== followeeId
    );
    await follower.save();

    followee.followers = followee.followers.filter(
      (id) => id.toString() !== followerId
    );
    await followee.save();

    res
      .status(200)
      .json({ message: "Unfollowed successfully", follower, followee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleSaveUser = async (req, res) => {
  try {
    const user = await Users.findById(req._id);
    const creator = await Users.findOne({
      _id: req.params.creatorId,
      isCreator: true,
    });

    if (!creator) {
      return res.status(404).json({ error: "User not found!" });
    }

    const isAlreadySaved = user.savedCreators.includes(creator._id);

    if (isAlreadySaved) {
      // Unsave
      user.savedCreators.pull(creator._id);
      await user.save();
      return res.status(202).json({
        message: "Creator unsaved successfully",
        isSaved: false,
        savedUsers: user.savedCreators,
      });
    } else {
      // Save
      user.savedCreators.push(creator._id);
      await user.save();
      return res.status(201).json({
        message: "Creator saved successfully",
        isSaved: true,
        savedUsers: user.savedCreators,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
