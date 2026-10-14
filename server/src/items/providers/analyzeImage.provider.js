const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const { StatusCodes } = require("http-status-codes");
const logger = require("../../helpers/winston.helper.js");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function analyzeImageProvider(req, res) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Gemini API key is not configured. Please add GEMINI_API_KEY in the server .env file.",
      });
    }

    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Please upload an image file to analyze.",
      });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const mimeType = req.file.mimetype || "image/jpeg";

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an AI assistant for a Smart Campus Lost & Found System.
Analyze this photo of an item carefully.
Extract the characteristics, specifications, brand, color, physical condition, and distinguishing features.

Return ONLY a valid JSON object matching this schema:
{
  "title": "Clear, concise item title (e.g., 'Blue OnePlus Smartphone', 'Black Leather Fossil Wallet', 'Casio FX-991EX Calculator', 'Nike Air Max Backpack')",
  "category": "Must be exactly one of: 'wallet', 'phone', 'bag', 'id', 'electronics', 'others'",
  "description": "Comprehensive description: brand, model, color, materials, visible marks, stickers, scratches, condition (e.g. good condition, small scratch on top corner)",
  "keywords": "Comma-separated search tags (e.g. 'oneplus, blue, phone, android, electronics, cracked screen')"
}

Do not include markdown backticks or any conversational text. Return only the raw JSON string.`;

    const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
    let response = null;
    let lastError = null;

    for (const model of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
          },
        });
        if (response && response.text) break;
      } catch (err) {
        lastError = err;
        console.warn(`Gemini model ${model} failed, trying fallback...`, err.message?.slice(0, 100));
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("Failed to get response from Gemini AI models.");
    }

    const responseText = response.text ? response.text.trim() : "";
    let parsedData = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      const cleaned = responseText.replace(/```json\n?|\n?```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    }

    // Ensure category matches one of the allowed schema enums
    const allowedCategories = ["wallet", "phone", "bag", "id", "electronics", "others"];
    if (!parsedData.category || !allowedCategories.includes(parsedData.category.toLowerCase())) {
      parsedData.category = "others";
    } else {
      parsedData.category = parsedData.category.toLowerCase();
    }

    if (Array.isArray(parsedData.keywords)) {
      parsedData.keywords = parsedData.keywords.join(", ");
    }

    logger.info("Image analyzed with Gemini AI", {
      userId: req.user?.sub,
      title: parsedData.title,
    });

    return res.status(StatusCodes.OK).json({
      message: "Item details analyzed successfully",
      data: {
        ...parsedData,
        imageUrl: `uploads/${req.file.filename}`,
        filename: req.file.filename,
      },
    });
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    errorLogger("Error analyzing image with Gemini", req, error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error?.message || "Failed to analyze image with Gemini AI.",
    });
  }
}

module.exports = analyzeImageProvider;
