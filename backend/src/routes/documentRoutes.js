const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  uploadDocument,
  getUserDocuments,
  getDocumentById,
  deleteDocument,
  getDocumentStatus,
} = require("../controllers/documentController");

router.use(protect); // All document routes require authentication

router.post("/upload", uploadDocument);
router.get("/", getUserDocuments);
router.get("/:id", getDocumentById);
router.get("/:id/status", getDocumentStatus);
router.delete("/:id", deleteDocument);

module.exports = router;
