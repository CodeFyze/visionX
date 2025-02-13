const Stories = require("./../models/StoriesModel");
const Users = require("./../models/UserModel");

exports.createStory = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !req.file?.path)
      return res.status(401).json({
        message: "Text or media content is requried!",
        status: "fail",
      });
    const story = new Stories({
      user: req._id,
      content,
      mediaUrl: req.file?.path,
      mediaType: req.file?.resource_type,
    });

    await story.save();
    res.status(201).json(story);
  } catch (error) {
    console.log("ROUTE ERROR => ", error);

    res.status(500).json({ error: error.message });
  }
};

exports.getFollowedStories = async (req, res) => {
  try {
    const currentUser = await Users.findById(req._id)
      .select("following")
      .populate("following");

    // Get stories from followed users created in last 24 hours
    const stories = await Stories.find({
      user: { $in: currentUser.following },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })
      .populate("user", "name email isCreator username")
      .sort("-createdAt");

    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
