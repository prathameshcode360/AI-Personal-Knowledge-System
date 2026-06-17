const Document = require("../models/Document");
const { generateEmbedding } = require("./documentProcessingService");

// Perform vector search in MongoDB
const vectorSearch = async (userId, queryEmbedding, limit = 5) => {
  try {
    // MongoDB Atlas Vector Search aggregation pipeline
    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "chunks.embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: limit,
        },
      },
      {
        $match: {
          userId: userId,
          status: "completed",
        },
      },
      {
        $unwind: "$chunks",
      },
      {
        $addFields: {
          similarity: {
            $meta: "searchScore",
          },
        },
      },
      {
        $sort: { similarity: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          "chunks.text": 1,
          "chunks.chunkNumber": 1,
          "chunks.pageNumber": 1,
          filename: 1,
          title: 1,
          similarity: 1,
        },
      },
    ];

    const results = await Document.aggregate(pipeline);

    return results.map((result) => ({
      text: result.chunks.text,
      filename: result.filename,
      title: result.title,
      pageNumber: result.chunks.pageNumber || 1,
      chunkNumber: result.chunks.chunkNumber,
      similarity: result.similarity,
    }));
  } catch (error) {
    console.error("Vector search error:", error);
    // Fallback to text search if vector search fails
    return await textSearchFallback(userId, queryEmbedding, limit);
  }
};

// Fallback text search
const textSearchFallback = async (userId, queryEmbedding, limit) => {
  // This is a simplified fallback
  const documents = await Document.find({
    userId: userId,
    status: "completed",
  }).limit(limit);

  const results = [];
  for (const doc of documents) {
    if (doc.chunks && doc.chunks.length > 0) {
      results.push({
        text: doc.chunks[0].text.substring(0, 500),
        filename: doc.filename,
        title: doc.title,
        pageNumber: 1,
        chunkNumber: 1,
        similarity: 0.5,
      });
    }
  }

  return results;
};

// Retrieve relevant chunks for a question
const retrieveRelevantChunks = async (userId, question, limit = 5) => {
  try {
    // Generate embedding for the question
    const questionEmbedding = await generateEmbedding(question);

    if (!questionEmbedding) {
      throw new Error("Failed to generate embedding for question");
    }

    // Perform vector search
    const relevantChunks = await vectorSearch(userId, questionEmbedding, limit);

    return relevantChunks;
  } catch (error) {
    console.error("Error retrieving chunks:", error);
    return [];
  }
};

// Build context from retrieved chunks
const buildContextFromChunks = (chunks) => {
  if (!chunks || chunks.length === 0) {
    return "No relevant documents found.";
  }

  let context = "Here are the relevant document excerpts:\n\n";

  chunks.forEach((chunk, index) => {
    context += `[Source ${index + 1}] From "${chunk.filename}"${chunk.pageNumber ? ` (Page ${chunk.pageNumber})` : ""}:\n`;
    context += `${chunk.text}\n\n`;
  });

  return context;
};

module.exports = {
  vectorSearch,
  retrieveRelevantChunks,
  buildContextFromChunks,
};
