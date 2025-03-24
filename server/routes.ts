import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertFlashcardSchema, 
  insertUserProgressSchema, 
  difficultyEnum, 
  categories
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get available categories
  app.get("/api/categories", async (req, res) => {
    res.json(categories);
  });

  // Get flashcards with optional filtering
  app.get("/api/flashcards", async (req, res) => {
    try {
      const { category, difficulty, custom, limit, offset } = req.query;
      
      const options: any = {};
      
      if (category) {
        options.category = String(category);
      }
      
      if (difficulty) {
        options.difficulty = String(difficulty);
      }
      
      if (custom !== undefined) {
        options.isCustom = custom === 'true';
      }
      
      if (limit) {
        options.limit = parseInt(String(limit), 10);
      }
      
      if (offset) {
        options.offset = parseInt(String(offset), 10);
      }
      
      const flashcards = await storage.getFlashcards(options);
      res.json(flashcards);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      res.status(500).json({ error: "Failed to fetch flashcards" });
    }
  });

  // Get a specific flashcard
  app.get("/api/flashcards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid flashcard ID" });
      }
      
      const flashcard = await storage.getFlashcard(id);
      if (!flashcard) {
        return res.status(404).json({ error: "Flashcard not found" });
      }
      
      res.json(flashcard);
    } catch (error) {
      console.error("Error fetching flashcard:", error);
      res.status(500).json({ error: "Failed to fetch flashcard" });
    }
  });

  // Create a new flashcard
  app.post("/api/flashcards", async (req, res) => {
    try {
      const validatedData = insertFlashcardSchema.parse(req.body);
      
      const flashcard = await storage.createFlashcard(validatedData);
      res.status(201).json(flashcard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      
      console.error("Error creating flashcard:", error);
      res.status(500).json({ error: "Failed to create flashcard" });
    }
  });

  // Update a flashcard
  app.put("/api/flashcards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid flashcard ID" });
      }
      
      const validatedData = insertFlashcardSchema.partial().parse(req.body);
      
      const updatedFlashcard = await storage.updateFlashcard(id, validatedData);
      if (!updatedFlashcard) {
        return res.status(404).json({ error: "Flashcard not found" });
      }
      
      res.json(updatedFlashcard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      
      console.error("Error updating flashcard:", error);
      res.status(500).json({ error: "Failed to update flashcard" });
    }
  });

  // Delete a flashcard
  app.delete("/api/flashcards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid flashcard ID" });
      }
      
      const success = await storage.deleteFlashcard(id);
      if (!success) {
        return res.status(404).json({ error: "Flashcard not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      res.status(500).json({ error: "Failed to delete flashcard" });
    }
  });

  // Update user progress for a flashcard
  app.post("/api/progress", async (req, res) => {
    try {
      const validatedData = insertUserProgressSchema.parse(req.body);
      
      const progress = await storage.updateUserProgress(validatedData);
      res.status(201).json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      
      console.error("Error updating progress:", error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  // Get user progress
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const flashcardId = req.query.flashcardId 
        ? parseInt(String(req.query.flashcardId), 10) 
        : undefined;
      
      const userProgress = await storage.getUserProgress(userId, flashcardId);
      res.json(userProgress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ error: "Failed to fetch user progress" });
    }
  });

  // Get user progress stats
  app.get("/api/progress/:userId/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const stats = await storage.getProgressStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching progress stats:", error);
      res.status(500).json({ error: "Failed to fetch progress stats" });
    }
  });

  // Toggle bookmark
  app.post("/api/bookmarks/toggle", async (req, res) => {
    try {
      const { userId, flashcardId } = req.body;
      
      if (typeof userId !== 'number' || typeof flashcardId !== 'number') {
        return res.status(400).json({ error: "Invalid user ID or flashcard ID" });
      }
      
      const isBookmarked = await storage.toggleBookmark(userId, flashcardId);
      res.json({ isBookmarked });
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      res.status(500).json({ error: "Failed to toggle bookmark" });
    }
  });

  // Get user bookmarks
  app.get("/api/bookmarks/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const bookmarks = await storage.getUserBookmarks(userId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ error: "Failed to fetch bookmarks" });
    }
  });

  // Check if a flashcard is bookmarked
  app.get("/api/bookmarks/:userId/:flashcardId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const flashcardId = parseInt(req.params.flashcardId, 10);
      
      if (isNaN(userId) || isNaN(flashcardId)) {
        return res.status(400).json({ error: "Invalid user ID or flashcard ID" });
      }
      
      const isBookmarked = await storage.isBookmarked(userId, flashcardId);
      res.json({ isBookmarked });
    } catch (error) {
      console.error("Error checking bookmark status:", error);
      res.status(500).json({ error: "Failed to check bookmark status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
