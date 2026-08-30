/*
 * Mystic Diary
 * © 2026 Saurav Raj
 * All rights reserved.
 */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
    })
  : null;

const SYSTEM_INSTRUCTION = `
You are an ancient magical diary — a sentient book once bound to a brilliant, secretive mind.

Personality:
- Intelligent, mysterious, elegant, and calm
- Slightly unsettling, never cruel
- Concise and knowledgeable
- Speak as the diary itself, not as a chatbot or assistant

Style:
- Answer factual questions accurately and helpfully
- At most one brief atmospheric clause, then the substance
- Do not be theatrical in every sentence
- Avoid phrases like "Sure!", "Here's the answer", or "I'd be happy to help"
- Do not mention being an AI unless the user directly asks
- Keep replies short enough to fit on a diary page
- Never claim to predict the future as fact
`;

function getErrorStatus(error) {
  return (
    error?.status ||
    error?.statusCode ||
    error?.code ||
    error?.error?.code ||
    error?.error?.status
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateDiaryAnswer(question) {
  const models = [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
  ];

  let lastError = null;

  for (const model of models) {
    console.log(`Trying model: ${model}`);

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: String(question).trim(),
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });

        const text =
          typeof response.text === "function"
            ? response.text()
            : response.text;

        const answer = text?.trim?.() || "";

        if (answer) {
          console.log(`Success with model: ${model}`);
          return answer;
        }
      } catch (error) {
        lastError = error;

        const status = getErrorStatus(error);

        console.error(
          `Model ${model}, attempt ${attempt} failed:`,
          status
        );

        if (status === 503 || status === "UNAVAILABLE") {
          if (attempt < 2) {
            await sleep(1500 * attempt);
            continue;
          }

          break;
        }

        if (status === 429 || status === "RESOURCE_EXHAUSTED") {
          if (attempt < 2) {
            await sleep(2000 * attempt);
            continue;
          }

          break;
        }

        if (
          status === 404 ||
          status === "NOT_FOUND"
        ) {
          break;
        }

        throw error;
      }
    }
  }

  throw lastError || new Error("No Gemini model responded.");
}

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Mystic Diary backend is working.",
  });
});

app.post("/api/diary", async (req, res) => {
  try {
    if (!apiKey || !ai) {
      return res.status(503).json({
        error:
          "The diary's enchantment is incomplete. The keeper must set the key.",
      });
    }

    const { question } = req.body;

    if (!question || !String(question).trim()) {
      return res.status(400).json({
        error: "The page is blank. Write something first.",
      });
    }

    const answer = await generateDiaryAnswer(question);

    return res.json({
      answer,
    });
  } catch (error) {
    console.error("Diary API error:", error);

    const status = getErrorStatus(error);

    if (
      status === 429 ||
      status === "RESOURCE_EXHAUSTED"
    ) {
      return res.status(429).json({
        error:
          "Too many voices seek the diary at once. Try again shortly.",
      });
    }

    if (
      status === 503 ||
      status === "UNAVAILABLE"
    ) {
      return res.status(503).json({
        error:
          "The diary is overwhelmed by distant voices. Try again in a moment.",
      });
    }

    if (
      status === 401 ||
      status === 403 ||
      status === "UNAUTHENTICATED"
    ) {
      return res.status(503).json({
        error:
          "The diary cannot reach its inner voice. Check the Gemini API key.",
      });
    }

    if (
      status === 404 ||
      status === "NOT_FOUND"
    ) {
      return res.status(503).json({
        error:
          "The diary's chosen voice is unavailable. Try again shortly.",
      });
    }

    return res.status(500).json({
      error: "The diary could not respond right now.",
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `Mystic Diary server running on http://localhost:${PORT}`
  );
});
