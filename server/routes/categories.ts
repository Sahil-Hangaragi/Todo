import { RequestHandler } from "express";
import { dataStore } from "../services/data-store";

export const getCategories: RequestHandler = (req, res) => {
  try {
    const categories = dataStore.getAllCategories();
    res.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export const createCategory: RequestHandler = (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const category = dataStore.createCategory(name, color);
    res.status(201).json({ category });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
};
