import { RequestHandler } from "express";
import { dataStore } from "../services/data-store";
import { AIEngine } from "../services/ai-engine";
import { AddContextRequest } from "@shared/types";

export const getContextEntries: RequestHandler = (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const contextEntries = dataStore.getRecentContextEntries(limit);
    res.json({ contextEntries });
  } catch (error) {
    console.error("Error fetching context entries:", error);
    res.status(500).json({ error: "Failed to fetch context entries" });
  }
};

export const createContextEntry: RequestHandler = async (req, res) => {
  try {
    const { content, source_type }: AddContextRequest = req.body;

    if (!content || !source_type) {
      return res
        .status(400)
        .json({ error: "Content and source_type are required" });
    }

    // Analyze context with AI
    const processed_insights = await AIEngine.analyzeContext(content);

    const contextEntry = dataStore.createContextEntry({
      content,
      source_type,
      processed_insights,
    });

    res.status(201).json({ contextEntry });
  } catch (error) {
    console.error("Error creating context entry:", error);
    res.status(500).json({ error: "Failed to create context entry" });
  }
};

export const deleteContextEntry: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = dataStore.deleteContextEntry(id);

    if (!deleted) {
      return res.status(404).json({ error: "Context entry not found" });
    }

    res.json({ message: "Context entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting context entry:", error);
    res.status(500).json({ error: "Failed to delete context entry" });
  }
};
