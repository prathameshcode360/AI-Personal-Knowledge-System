const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  getConversations,
  getConversationMessages,
  deleteConversation,
  renameConversation,
} = require("../controllers/chatController");

router.use(protect);

router.post("/message", sendMessage);
router.get("/conversations", getConversations);
router.get("/conversations/:id/messages", getConversationMessages);
router.put("/conversations/:id", renameConversation);
router.delete("/conversations/:id", deleteConversation);

module.exports = router;
