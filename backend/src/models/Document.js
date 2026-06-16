const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ["pdf", "docx"],
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  extractedText: {
    type: String,
    default: "",
  },
  chunks: [
    {
      text: String,
      embedding: [Number],
      chunkNumber: Number,
      pageNumber: Number,
    },
  ],
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create text index for search
documentSchema.index({ title: "text", extractedText: "text" });

module.exports = mongoose.model("Document", documentSchema);
