import { RequestHandler } from "express";
import { dataStore } from "../services/data-store";
import { CreateTaskRequest, TaskFilters } from "@shared/types";

export const getTasks: RequestHandler = (req, res) => {
  try {
    const filters: TaskFilters = {
      status: req.query.status as any,
      category: req.query.category as string,
      priority: req.query.priority as any,
    };

    // Remove undefined values
    Object.keys(filters).forEach(
      (key) =>
        (filters as any)[key] === undefined && delete (filters as any)[key],
    );

    const tasks =
      Object.keys(filters).length > 0
        ? dataStore.filterTasks(filters)
        : dataStore.getAllTasks();

    res.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const getTask: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const task = dataStore.getTaskById(id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: "Failed to fetch task" });
  }
};

export const createTask: RequestHandler = (req, res) => {
  try {
    const { title, description, category, deadline }: CreateTaskRequest =
      req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    const task = dataStore.createTask({
      title,
      description,
      category: category || "General",
      priority_score: 3, // Default medium priority
      deadline,
      status: "pending",
    });

    res.status(201).json({ task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
};

export const updateTask: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = dataStore.updateTask(id, updates);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ task });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
};

export const deleteTask: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = dataStore.deleteTask(id);

    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
};
