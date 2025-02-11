const express = require("express");
const router = express.Router();
const messageController = require("./../../controllers/MessagesController");
router.get("/conversations", messageController.getConversations);
router.get("/:userId", messageController.getMessages);
router.post("/send", messageController.sendMessage);

module.exports = router;
