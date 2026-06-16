const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const {
  retrieveRelevantChunks,
  buildContextFromChunks,
} = require("../services/ragService");
const { generateAnswer, extractSources } = require("../services/geminiService");

// @desc    Send message and get AI response
// @route   POST /api/chat/message
const sendMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    let conversation;

    // Create new conversation if no ID provided
    if (!conversationId) {
      conversation = await Conversation.create({
        userId: req.user._id,
        title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
      });
    } else {
      conversation = await Conversation.findOne({
        _id: conversationId,
        userId: req.user._id,
      });

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
    }

    // Save user message
    const userMessage = await Message.create({
      conversationId: conversation._id,
      role: "user",
      content: message,
    });

    // Get chat history for context
    const chatHistory = await Message.find({
      conversationId: conversation._id,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    // Retrieve relevant document chunks
    const relevantChunks = await retrieveRelevantChunks(req.user._id, message);

    // Build context from chunks
    const context = buildContextFromChunks(relevantChunks);

    // Generate AI response
    const aiResponse = await generateAnswer(
      message,
      context,
      chatHistory.reverse(),
    );

    // Extract sources
    const sources = extractSources(relevantChunks);

    // Save AI message
    const assistantMessage = await Message.create({
      conversationId: conversation._id,
      role: "assistant",
      content: aiResponse.answer,
      sources: sources.map((s) => ({
        documentId: null, // Would need document ID from chunk
        filename: s.filename,
        pageNumber: s.pageNumber,
        chunkNumber: null,
      })),
    });

    res.json({
      success: true,
      message: assistantMessage,
      conversationId: conversation._id,
      sources: sources,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user conversations
// @route   GET /api/chat/conversations
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      userId: req.user._id,
    }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get conversation messages
// @route   GET /api/chat/conversations/:id/messages
const getConversationMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    res.json({
      success: true,
      conversation,
      messages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete conversation
// @route   DELETE /api/chat/conversations/:id
const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Delete all messages in conversation
    await Message.deleteMany({ conversationId: conversation._id });

    // Delete conversation
    await conversation.deleteOne();

    res.json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Rename conversation
// @route   PUT /api/chat/conversations/:id
const renameConversation = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const conversation = await Conversation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title, updatedAt: Date.now() },
      { new: true },
    );

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getConversationMessages,
  deleteConversation,
  renameConversation,
};
