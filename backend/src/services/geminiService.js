const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate answer using Gemini
const generateAnswer = async (question, context, chatHistory = []) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Build prompt
    const systemPrompt = `You are an AI assistant that answers questions based ONLY on the provided context. 
If the answer is not in the context, say "I cannot find this information in the uploaded documents."
Always cite your sources by mentioning the filename and page number.
Be concise, accurate, and helpful.

Context:
${context}

Chat History:
${formatChatHistory(chatHistory)}

User Question: ${question}

Answer:`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const answer = response.text();

    return {
      success: true,
      answer: answer,
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      success: false,
      answer:
        "Sorry, I encountered an error processing your request. Please try again.",
      error: error.message,
    };
  }
};

// Format chat history for context
const formatChatHistory = (messages) => {
  if (!messages || messages.length === 0) return "No previous messages.";

  let history = "";
  messages.slice(-5).forEach((msg) => {
    history += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
  });

  return history;
};

// Extract source information from context chunks
const extractSources = (chunks) => {
  const sources = [];
  const seen = new Set();

  for (const chunk of chunks) {
    const sourceKey = `${chunk.filename}-${chunk.pageNumber || 1}`;
    if (!seen.has(sourceKey)) {
      seen.add(sourceKey);
      sources.push({
        filename: chunk.filename,
        pageNumber: chunk.pageNumber || 1,
        text: chunk.text.substring(0, 150) + "...",
      });
    }
  }

  return sources;
};

module.exports = {
  generateAnswer,
  extractSources,
};
