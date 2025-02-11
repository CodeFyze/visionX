const MessagesModel = require("./../models/MessagesModel");
const Users = require("./../models/UserModel");

exports.getConversations = async (req, res) => {
  try {
    const userId = req._id;

    const conversations = await MessagesModel.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $eq: ["$receiver", userId] },
                { $cond: [{ $eq: ["$read", false] }, 1, 0] },
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ]);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await MessagesModel.find({
      $or: [
        { sender: req._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req._id },
      ],
    }).sort("createdAt");
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content, receiver } = req.body;
    if (!content || !receiver)
      return res
        .status(402)
        .json({ message: "Content & reciever are important!", status: "fail" });

    let receiverUser = await Users.findById(receiver);
    console.log(receiverUser);

    if (!receiverUser)
      return res
        .status(402)
        .json({ message: "Receiver user not found!", status: "fail" });

    const message = new MessagesModel({
      sender: req._id,
      receiver,
      content,
    });

    const savedMessage = await message.save();
    res.status(201).json(savedMessage);

    // Broadcast message via WebSocket
    req.io.to(receiver.toString()).emit("newMessage", savedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
