const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const tipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  text: { type: String },
  image: { type: String },
  video: { type: String },
  isFree: { type: Boolean, default: true },
  price: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }], // Array of user IDs who liked the post
  comments: [commentSchema], // Array of comments
  tips: [tipSchema], // Array of tips
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }], // Array of user IDs who saved the post
  createdAt: { type: Date, default: Date.now },
});

const Posts = mongoose.model("Posts", postSchema);

module.exports = Posts;
