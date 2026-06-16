const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Document = require("../models/Document");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Extract text from PDF
const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return { text: data.text, pages: data.numpages };
};

// Extract text from DOCX
const extractTextFromDOCX = async (filePath) => {
  const result = await mammoth.extractRawText({ path: filePath });
  return { text: result.value, pages: 1 };
};

// Split text into chunks
const splitTextIntoChunks = (text, chunkSize = 1000, overlap = 200) => {
  const chunks = [];
  let start = 0;
  let chunkNumber = 1;

  while (start < text.length) {
    let end = start + chunkSize;

    // Try to end at a sentence or space
    if (end < text.length) {
      while (end > start && ![".", "!", "?", "\n", " "].includes(text[end])) {
        end--;
      }
    }

    const chunk = text.substring(start, end).trim();
    if (chunk) {
      chunks.push({
        text: chunk,
        chunkNumber: chunkNumber,
        pageNumber: Math.ceil((start + 1) / 2500), // Approximate page number
      });
      chunkNumber++;
    }

    start = end - overlap;
    if (start < 0) start = 0;
  }

  return chunks;
};

// Generate embedding for a chunk
const generateEmbedding = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
};

// Process document and store chunks with embeddings
const processDocument = async (documentId, filePath, fileType) => {
  try {
    // Update status to processing
    await Document.findByIdAndUpdate(documentId, { status: "processing" });

    // Extract text based on file type
    let extractedData;
    if (fileType === "pdf") {
      extractedData = await extractTextFromPDF(filePath);
    } else {
      extractedData = await extractTextFromDOCX(filePath);
    }

    // Split into chunks
    const chunks = splitTextIntoChunks(extractedData.text);

    // Generate embeddings for each chunk
    const chunksWithEmbeddings = [];
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.text);
      if (embedding) {
        chunksWithEmbeddings.push({
          ...chunk,
          embedding: embedding,
        });
      }

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Update document with processed data
    await Document.findByIdAndUpdate(documentId, {
      extractedText: extractedData.text,
      chunks: chunksWithEmbeddings,
      status: "completed",
    });

    console.log(
      `Document ${documentId} processed successfully with ${chunksWithEmbeddings.length} chunks`,
    );
    return { success: true, chunkCount: chunksWithEmbeddings.length };
  } catch (error) {
    console.error("Error processing document:", error);
    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
    });
    return { success: false, error: error.message };
  }
};

module.exports = {
  extractTextFromPDF,
  extractTextFromDOCX,
  splitTextIntoChunks,
  generateEmbedding,
  processDocument,
};
