import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from "./routes/tasks";
import { getCategories, createCategory } from "./routes/categories";
import {
  getContextEntries,
  createContextEntry,
  deleteContextEntry,
} from "./routes/context";
import { getAISuggestions } from "./routes/ai-suggestions";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Smart Todo API is running!" });
  });

  app.get("/api/demo", handleDemo);

  // Tasks API
  app.get("/api/tasks", getTasks);
  app.get("/api/tasks/:id", getTask);
  app.post("/api/tasks", createTask);
  app.put("/api/tasks/:id", updateTask);
  app.delete("/api/tasks/:id", deleteTask);

  // Categories API
  app.get("/api/categories", getCategories);
  app.post("/api/categories", createCategory);

  // Context API
  app.get("/api/context", getContextEntries);
  app.post("/api/context", createContextEntry);
  app.delete("/api/context/:id", deleteContextEntry);

  // AI Suggestions API
  app.post("/api/ai-suggestions", getAISuggestions);

  return app;
}
