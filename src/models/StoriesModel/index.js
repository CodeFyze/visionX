const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  content: String,
  mediaUrl: String,
  mediaType: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: "24h" }, // Auto-delete after 24 hours
  },
});

// Add TTL index for expiration
storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Stories = mongoose.model("Stories", storySchema);
module.exports = Stories;
