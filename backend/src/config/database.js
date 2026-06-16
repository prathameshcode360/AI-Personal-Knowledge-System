const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected Successfully");

    // Create vector search index (run once)
    await setupVectorSearchIndex();
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const setupVectorSearchIndex = async () => {
  const db = mongoose.connection.db;
  const collection = db.collection("documents");

  // Check if index exists
  const indexes = await collection.indexes();
  const hasVectorIndex = indexes.some((idx) => idx.name === "vector_index");

  if (!hasVectorIndex) {
    console.log("Creating vector search index...");
    // Index creation will be done via MongoDB Atlas UI
    console.log("Please create vector search index in MongoDB Atlas:");
    console.log("Collection: documents, Field: embedding, Dimensions: 768");
  }
};

module.exports = connectDB;
