const Posts = require("../models/PostModel");
const Users = require("../models/UserModel");
exports.createPost = async (req, res) => {
  try {
    const { text, isFree, price } = req.body;
    const userId = req._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!text && !req.files?.image && !req.files?.video) {
      return res
        .status(400)
        .json({ message: "At least one of text, image, or video is required" });
    }

    if (!isFree && (price === undefined || price <= 0)) {
      return res
        .status(400)
        .json({ message: "Price must be greater than 0 for paid posts" });
    }

    const post = new Posts({
      userId,
      text: text || null,
      image: req.files?.image ? req.files.image[0].path : null,
      video: req.files?.video ? req.files.video[0].path : null,
      isFree: isFree || true,
      price: isFree ? 0 : price,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPost = async (req, res) => {
  try {
    const { postId } = req.params;

    // Find the post and populate user details for likes, comments, tips, and savedBy
    const post = await Posts.findById(postId)
      .populate("userId", "name email")
      .populate("likes", "name email")
      .populate("comments.userId", "name email")
      .populate("tips.userId", "name email")
      .populate("savedBy", "name email");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.body;
    let userId = req._id;
    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: "You already liked this post" });
    }

    post.likes.push(userId);
    await post.save();

    res.status(200).json({ message: "Post liked successfully", post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.commentOnPost = async (req, res) => {
  try {
    const { postId, text } = req.body;
    let userId = req._id;
    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({ userId, text });
    await post.save();

    res.status(201).json({ message: "Comment added successfully", post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.tipPost = async (req, res) => {
  try {
    const { postId, amount } = req.body;
    let userId = req._id;
    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (amount <= 0) {
      return res
        .status(400)
        .json({ message: "Tip amount must be greater than 0" });
    }

    post.tips.push({ userId, amount });
    await post.save();

    res.status(201).json({ message: "Tip added successfully", post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.savePost = async (req, res) => {
  try {
    const { postId } = req.body;
    let userId = req._id;
    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.savedBy.includes(userId)) {
      return res.status(400).json({ message: "You already saved this post" });
    }

    post.savedBy.push(userId);
    await post.save();

    res.status(200).json({ message: "Post saved successfully", post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
