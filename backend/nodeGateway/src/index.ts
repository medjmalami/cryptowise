import express, { type Request, type Response } from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const LLM_API_URL = process.env.LLM_API_URL || "http://localhost:11434/v1";
const LLM_MODEL = process.env.LLM_MODEL || "qwen2.5:3b";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "ollama";

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI client pointing to Ollama
const client = new OpenAI({
  baseURL: LLM_API_URL,
  apiKey: OPENAI_API_KEY, // required by SDK but ignored by Ollama
});

// Chat route
app.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Call Ollama via OpenAI-compatible API
    const response = await client.chat.completions.create({
      model: LLM_MODEL,
      messages: [{ role: "user", content: message }],
    });

    // Return full OpenAI response format
    return res.json(response);
  } catch (error) {
    console.error("Error calling LLM API:", error);
    return res.status(500).json({ error: "Failed to get response from LLM" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
