require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-embedding-001",
    });

    const result = await model.embedContent("This is a test document.");

    console.log("Embedding size:", result.embedding.values.length);
  } catch (err) {
    console.error(err);
  }
}

test();
