const Document = require("../models/Document");
const { upload } = require("../utils/fileHelpers");
const { processDocument } = require("../services/documentProcessingService");
const fs = require("fs").promises;
const path = require("path");

// @desc    Upload document
// @route   POST /api/documents/upload
const uploadDocument = async (req, res) => {
  try {
    // Use multer middleware
    upload.single("file")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { title } = req.body;
      const fileType = req.file.mimetype.includes("pdf") ? "pdf" : "docx";

      // Create document record
      const document = await Document.create({
        userId: req.user._id,
        title: title || req.file.originalname.replace(/\.[^/.]+$/, ""),
        filename: req.file.originalname,
        fileType: fileType,
        filePath: req.file.path,
        fileSize: req.file.size,
      });

      // Start async processing
      processDocument(document._id, req.file.path, fileType);

      res.status(201).json({
        success: true,
        message: "Document uploaded and processing started",
        document: {
          id: document._id,
          title: document.title,
          filename: document.filename,
          fileType: document.fileType,
          status: document.status,
          uploadedAt: document.uploadedAt,
        },
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user documents
// @route   GET /api/documents
const getUserDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user._id })
      .sort({ uploadedAt: -1 })
      .select("-chunks -extractedText");

    res.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get document by ID
// @route   GET /api/documents/:id
const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select("-chunks");

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(document.filePath);
    } catch (err) {
      console.error("Error deleting file:", err);
    }

    // Delete document record
    await document.deleteOne();

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get document status
// @route   GET /api/documents/:id/status
const getDocumentStatus = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select("status chunks");

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json({
      success: true,
      status: document.status,
      chunksCount: document.chunks ? document.chunks.length : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  uploadDocument,
  getUserDocuments,
  getDocumentById,
  deleteDocument,
  getDocumentStatus,
};
