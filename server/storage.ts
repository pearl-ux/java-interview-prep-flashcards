import { 
  users, type User, type InsertUser,
  flashcards, type Flashcard, type InsertFlashcard,
  userProgress, type UserProgress, type InsertUserProgress,
  userBookmarks, type UserBookmark, type InsertUserBookmark,
  categories, difficultyEnum
} from "@shared/schema";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from "./db";
import { and, eq, isNull, sql, count } from "drizzle-orm";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load preloaded flashcards
let preloadedFlashcards: Flashcard[] = [];
try {
  const flashcardsPath = path.join(__dirname, 'data', 'flashcards.json');
  const flashcardsData = fs.readFileSync(flashcardsPath, 'utf8');
  preloadedFlashcards = JSON.parse(flashcardsData);
} catch (error) {
  console.error("Error loading preloaded flashcards:", error);
  preloadedFlashcards = [];
}

// Modify the interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Flashcard methods
  getFlashcards(options?: {
    category?: string;
    difficulty?: string;
    userId?: number | null;
    isCustom?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Flashcard[]>;
  
  getFlashcard(id: number): Promise<Flashcard | undefined>;
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  updateFlashcard(id: number, flashcard: Partial<InsertFlashcard>): Promise<Flashcard | undefined>;
  deleteFlashcard(id: number): Promise<boolean>;
  
  // User Progress methods
  getUserProgress(userId: number, flashcardId?: number): Promise<UserProgress[]>;
  updateUserProgress(progressData: InsertUserProgress): Promise<UserProgress>;
  getProgressStats(userId: number): Promise<{
    mastered: number;
    inProgress: number;
    toReview: number;
    total: number;
  }>;
  
  // Bookmarks methods
  getUserBookmarks(userId: number): Promise<Flashcard[]>;
  toggleBookmark(userId: number, flashcardId: number): Promise<boolean>;
  isBookmarked(userId: number, flashcardId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Initialize database with preloaded flashcards
  async initializeWithPreloadedFlashcards() {
    try {
      // Check if there are any flashcards in the database
      const existingCards = await db.select({ count: count() }).from(flashcards);
      if (existingCards[0].count === 0) {
        // No flashcards in DB, let's add the preloaded ones
        if (preloadedFlashcards.length > 0) {
          const cardsToInsert = preloadedFlashcards.map(card => ({
            question: card.question,
            answer: card.answer,
            category: card.category,
            difficulty: card.difficulty,
            isCustom: false,
            userId: null
          }));
          
          await db.insert(flashcards).values(cardsToInsert);
          console.log(`Initialized database with ${cardsToInsert.length} preloaded flashcards`);
        }
      }
    } catch (error) {
      console.error("Error initializing database with preloaded flashcards:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Flashcard methods
  async getFlashcards(options: {
    category?: string;
    difficulty?: string;
    userId?: number | null;
    isCustom?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<Flashcard[]> {
    let query = db.select().from(flashcards);
    
    // Build where conditions
    const conditions = [];
    
    if (options.category) {
      conditions.push(eq(flashcards.category, options.category));
    }
    
    if (options.difficulty) {
      conditions.push(eq(flashcards.difficulty, options.difficulty));
    }
    
    if (options.isCustom !== undefined) {
      conditions.push(eq(flashcards.isCustom, options.isCustom));
    }
    
    if (options.userId !== undefined) {
      if (options.userId === null) {
        conditions.push(isNull(flashcards.userId));
      } else {
        conditions.push(eq(flashcards.userId, options.userId));
      }
    }
    
    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Apply pagination
    if (options.limit !== undefined) {
      query = query.limit(options.limit);
      
      if (options.offset !== undefined) {
        query = query.offset(options.offset);
      }
    }
    
    return await query;
  }
  
  async getFlashcard(id: number): Promise<Flashcard | undefined> {
    const [flashcard] = await db.select().from(flashcards).where(eq(flashcards.id, id));
    return flashcard;
  }
  
  async createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard> {
    const [newFlashcard] = await db.insert(flashcards).values(flashcard).returning();
    return newFlashcard;
  }
  
  async updateFlashcard(id: number, flashcard: Partial<InsertFlashcard>): Promise<Flashcard | undefined> {
    const [updatedFlashcard] = await db
      .update(flashcards)
      .set(flashcard)
      .where(eq(flashcards.id, id))
      .returning();
    
    return updatedFlashcard;
  }
  
  async deleteFlashcard(id: number): Promise<boolean> {
    const result = await db
      .delete(flashcards)
      .where(eq(flashcards.id, id))
      .returning({ id: flashcards.id });
    
    return result.length > 0;
  }
  
  // User Progress methods
  async getUserProgress(userId: number, flashcardId?: number): Promise<UserProgress[]> {
    let query = db.select().from(userProgress).where(eq(userProgress.userId, userId));
    
    if (flashcardId !== undefined) {
      query = query.where(eq(userProgress.flashcardId, flashcardId));
    }
    
    return await query;
  }
  
  async updateUserProgress(progressData: InsertUserProgress): Promise<UserProgress> {
    const { userId, flashcardId } = progressData;
    
    // Check if progress already exists
    const [existingProgress] = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.flashcardId, flashcardId)
        )
      );
    
    if (existingProgress) {
      // Update existing progress
      const [updatedProgress] = await db
        .update(userProgress)
        .set({
          status: progressData.status,
          lastReviewed: progressData.lastReviewed
        })
        .where(eq(userProgress.id, existingProgress.id))
        .returning();
      
      return updatedProgress;
    } else {
      // Create new progress
      const [newProgress] = await db
        .insert(userProgress)
        .values(progressData)
        .returning();
      
      return newProgress;
    }
  }
  
  async getProgressStats(userId: number): Promise<{
    mastered: number;
    inProgress: number;
    toReview: number;
    total: number;
  }> {
    // Count total flashcards (non-custom)
    const [totalResult] = await db
      .select({ count: count() })
      .from(flashcards)
      .where(eq(flashcards.isCustom, false));
    
    const total = Number(totalResult.count);
    
    // Count mastered flashcards
    const [masteredResult] = await db
      .select({ count: count() })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.status, 'mastered')
        )
      );
    
    // Count in-progress flashcards
    const [inProgressResult] = await db
      .select({ count: count() })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.status, 'inProgress')
        )
      );
    
    // Count to-review flashcards
    const [toReviewResult] = await db
      .select({ count: count() })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.status, 'toReview')
        )
      );
    
    return {
      mastered: Number(masteredResult.count),
      inProgress: Number(inProgressResult.count),
      toReview: Number(toReviewResult.count),
      total
    };
  }
  
  // Bookmarks methods
  async getUserBookmarks(userId: number): Promise<Flashcard[]> {
    return await db
      .select({
        id: flashcards.id,
        question: flashcards.question,
        answer: flashcards.answer,
        category: flashcards.category,
        difficulty: flashcards.difficulty,
        isCustom: flashcards.isCustom,
        userId: flashcards.userId
      })
      .from(userBookmarks)
      .innerJoin(
        flashcards,
        eq(userBookmarks.flashcardId, flashcards.id)
      )
      .where(eq(userBookmarks.userId, userId));
  }
  
  async isBookmarked(userId: number, flashcardId: number): Promise<boolean> {
    const [bookmark] = await db
      .select()
      .from(userBookmarks)
      .where(
        and(
          eq(userBookmarks.userId, userId),
          eq(userBookmarks.flashcardId, flashcardId)
        )
      );
    
    return !!bookmark;
  }
  
  async toggleBookmark(userId: number, flashcardId: number): Promise<boolean> {
    // Check if already bookmarked
    const isCurrentlyBookmarked = await this.isBookmarked(userId, flashcardId);
    
    if (isCurrentlyBookmarked) {
      // Remove bookmark
      await db
        .delete(userBookmarks)
        .where(
          and(
            eq(userBookmarks.userId, userId),
            eq(userBookmarks.flashcardId, flashcardId)
          )
        );
      
      return false; // not bookmarked anymore
    } else {
      // Add bookmark
      await db
        .insert(userBookmarks)
        .values({ userId, flashcardId });
      
      return true; // now bookmarked
    }
  }
}

// Create and initialize the database storage
export const storage = new DatabaseStorage();

// Initialize the database with preloaded flashcards
(async () => {
  try {
    await (storage as DatabaseStorage).initializeWithPreloadedFlashcards();
  } catch (error) {
    console.error("Error initializing database:", error);
  }
})();
