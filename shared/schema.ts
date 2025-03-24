import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Flashcards schemas
export const difficultyEnum = z.enum(["easy", "medium", "hard"]);
export type Difficulty = z.infer<typeof difficultyEnum>;

export const categories = [
  "Core Java",
  "Multithreading",
  "JVM Internals",
  "Spring & Hibernate",
  "Data Structures",
  "System Design",
  "Design Patterns",
  "Collections",
];

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  isCustom: boolean("is_custom").notNull().default(false),
  userId: integer("user_id"), // Optional, null for preloaded cards
});

export const insertFlashcardSchema = createInsertSchema(flashcards).pick({
  question: true,
  answer: true,
  category: true,
  difficulty: true,
  isCustom: true,
  userId: true,
});

export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type Flashcard = typeof flashcards.$inferSelect;

// User Progress schema
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  flashcardId: integer("flashcard_id").notNull(),
  status: text("status").notNull(), // mastered, inProgress, toReview
  lastReviewed: text("last_reviewed"), // ISO date string
});

export const insertUserProgressSchema = createInsertSchema(userProgress).pick({
  userId: true,
  flashcardId: true,
  status: true,
  lastReviewed: true,
});

export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

// User Bookmarks schema
export const userBookmarks = pgTable("user_bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  flashcardId: integer("flashcard_id").notNull(),
});

export const insertUserBookmarkSchema = createInsertSchema(userBookmarks).pick({
  userId: true,
  flashcardId: true,
});

export type InsertUserBookmark = z.infer<typeof insertUserBookmarkSchema>;
export type UserBookmark = typeof userBookmarks.$inferSelect;
