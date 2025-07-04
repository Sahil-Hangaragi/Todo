import { RequestHandler } from "express";
import { AIEngine } from "../services/ai-engine";
import { dataStore } from "../services/data-store";

export const getAISuggestions: RequestHandler = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    // Get recent context for better suggestions
    const recentContext = dataStore.getRecentContextEntries(5);

    const suggestions = await AIEngine.generateTaskSuggestions(
      title,
      description,
      recentContext,
    );

    res.json({ suggestions });
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    res.status(500).json({ error: "Failed to generate AI suggestions" });
  }
};
