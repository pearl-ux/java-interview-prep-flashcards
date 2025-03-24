import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Flashcard, type UserProgress, Difficulty } from "@shared/schema";

// Interface for category with count
interface Category {
  name: string;
  count: number;
}

// Hook for fetching categories
export function useCategories() {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      // First fetch all categories
      const response = await fetch('/api/categories');
      const categoryNames = await response.json();
      
      // Then fetch counts for each category
      const categoryCounts: Category[] = await Promise.all(
        categoryNames.map(async (name: string) => {
          const countResponse = await fetch(`/api/flashcards?category=${encodeURIComponent(name)}`);
          const cards = await countResponse.json();
          return { name, count: cards.length };
        })
      );
      
      return categoryCounts;
    }
  });
  
  return { categories };
}

// Progress stats interface
interface ProgressStats {
  mastered: number;
  inProgress: number;
  toReview: number;
  total: number;
  percentage: number;
}

// Context for flashcard state
interface FlashcardContextType {
  flashcards: Flashcard[];
  customFlashcards: Flashcard[];
  bookmarks: Flashcard[];
  recentlyViewedCards: Flashcard[];
  progressStats: ProgressStats;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  fetchFlashcards: (options: {
    category?: string;
    difficulty?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) => Promise<Flashcard[]>;
  fetchCustomFlashcards: (options: {
    category?: string;
    difficulty?: string;
  }) => Promise<Flashcard[]>;
  fetchTestFlashcards: (options: {
    category?: string;
    difficulty?: string;
    limit?: number;
  }) => Promise<Flashcard[]>;
  createCustomFlashcard: (flashcard: Partial<Flashcard>) => Promise<Flashcard>;
  deleteFlashcard: (id: number) => Promise<void>;
  toggleBookmark: (flashcardId: number) => void;
  isBookmarked: (flashcardId: number) => boolean;
  toggleMastered: (flashcardId: number) => void;
  isMastered: (flashcardId: number) => boolean;
}

// Default user ID for demo purposes (would normally come from auth)
const DEFAULT_USER_ID = 1;

// Creating the context
const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

// Provider component
export function FlashcardProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [customFlashcards, setCustomFlashcards] = useState<Flashcard[]>([]);
  const [bookmarks, setBookmarks] = useState<Flashcard[]>([]);
  const [recentlyViewedCards, setRecentlyViewedCards] = useState<Flashcard[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Default progress stats
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    mastered: 0,
    inProgress: 0,
    toReview: 0,
    total: 100,
    percentage: 0,
  });
  
  // Bookmarked flashcards (stored in localStorage)
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  
  // Mastered flashcards (stored in localStorage)
  const [masteredIds, setMasteredIds] = useState<number[]>([]);
  
  // Initialize from localStorage
  useEffect(() => {
    const storedBookmarks = localStorage.getItem('bookmarkedCards');
    if (storedBookmarks) {
      setBookmarkedIds(JSON.parse(storedBookmarks));
    }
    
    const storedMastered = localStorage.getItem('masteredCards');
    if (storedMastered) {
      setMasteredIds(JSON.parse(storedMastered));
    }
    
    // Initialize recently viewed
    const storedRecentlyViewed = localStorage.getItem('recentlyViewedCards');
    if (storedRecentlyViewed) {
      setRecentlyViewedCards(JSON.parse(storedRecentlyViewed));
    }
    
    // Fetch initial data
    fetchFlashcards({ page: 1, limit: 6 });
    fetchProgressStats();
    
  }, []);
  
  // Fetch progress stats
  const fetchProgressStats = async () => {
    try {
      // For this demo, we're using mock stats since we don't have real auth
      // In a real app, this would come from the API
      const mastered = masteredIds.length;
      const inProgress = Math.floor(Math.random() * 20) + 5;
      const toReview = Math.floor(Math.random() * 15);
      const total = 100;
      const percentage = Math.round((mastered / total) * 100);
      
      setProgressStats({
        mastered,
        inProgress,
        toReview,
        total,
        percentage
      });
    } catch (error) {
      console.error("Error fetching progress stats:", error);
    }
  };
  
  // Fetch flashcards with options
  const fetchFlashcards = async (options: {
    category?: string;
    difficulty?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<Flashcard[]> => {
    try {
      const { category, difficulty, sortBy, page = 1, limit = 6 } = options;
      
      // Build query parameters
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (difficulty) params.append('difficulty', difficulty);
      if (limit) params.append('limit', limit.toString());
      if (page) params.append('offset', ((page - 1) * limit).toString());
      
      // Fetch data
      const response = await fetch(`/api/flashcards?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch flashcards');
      
      const data: Flashcard[] = await response.json();
      
      // Apply client-side sorting if needed
      let sortedData = [...data];
      if (sortBy) {
        switch (sortBy) {
          case 'easy-to-hard':
            sortedData.sort((a, b) => {
              const difficultyOrder: Record<Difficulty, number> = { 
                easy: 1, medium: 2, hard: 3
              };
              return difficultyOrder[a.difficulty as Difficulty] - difficultyOrder[b.difficulty as Difficulty];
            });
            break;
          case 'hard-to-easy':
            sortedData.sort((a, b) => {
              const difficultyOrder: Record<Difficulty, number> = { 
                easy: 1, medium: 2, hard: 3
              };
              return difficultyOrder[b.difficulty as Difficulty] - difficultyOrder[a.difficulty as Difficulty];
            });
            break;
          case 'progress':
            // Sort by mastered status (would be more sophisticated in a real app)
            sortedData.sort((a, b) => {
              const aIsMastered = masteredIds.includes(a.id) ? 1 : 0;
              const bIsMastered = masteredIds.includes(b.id) ? 1 : 0;
              return aIsMastered - bIsMastered;
            });
            break;
          default:
            // 'recent' - default order from API
            break;
        }
      }
      
      setFlashcards(sortedData);
      
      // Assume we have 100 cards total for this demo
      // In a real app this would come from the API via pagination metadata
      setTotalPages(Math.ceil(100 / limit));
      setCurrentPage(page);
      
      return sortedData;
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      toast({
        title: "Error",
        description: "Failed to load flashcards. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  };
  
  // Fetch custom flashcards
  const fetchCustomFlashcards = async (options: {
    category?: string;
    difficulty?: string;
  } = {}): Promise<Flashcard[]> => {
    try {
      const { category, difficulty } = options;
      
      // Build query parameters
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (difficulty) params.append('difficulty', difficulty);
      params.append('custom', 'true');
      
      // Fetch data
      const response = await fetch(`/api/flashcards?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch custom flashcards');
      
      const data: Flashcard[] = await response.json();
      setCustomFlashcards(data);
      return data;
    } catch (error) {
      console.error("Error fetching custom flashcards:", error);
      toast({
        title: "Error",
        description: "Failed to load custom flashcards. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  };
  
  // Fetch flashcards for test mode
  const fetchTestFlashcards = async (options: {
    category?: string;
    difficulty?: string;
    limit?: number;
  } = {}): Promise<Flashcard[]> => {
    try {
      const { category, difficulty, limit = 10 } = options;
      
      // Build query parameters
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (difficulty) params.append('difficulty', difficulty);
      params.append('limit', limit.toString());
      
      // Fetch data
      const response = await fetch(`/api/flashcards?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch test flashcards');
      
      const data: Flashcard[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching test flashcards:", error);
      toast({
        title: "Error",
        description: "Failed to load test flashcards. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  };
  
  // Create custom flashcard
  const createCustomFlashcard = async (flashcard: Partial<Flashcard>): Promise<Flashcard> => {
    try {
      const response = await apiRequest('POST', '/api/flashcards', {
        ...flashcard,
        userId: DEFAULT_USER_ID,
      });
      
      const newCard = await response.json();
      
      // Update custom flashcards state
      setCustomFlashcards(prev => [newCard, ...prev]);
      
      // Show success toast
      toast({
        title: "Flashcard Created",
        description: "Your custom flashcard has been created successfully.",
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/flashcards'] });
      
      return newCard;
    } catch (error) {
      console.error("Error creating flashcard:", error);
      toast({
        title: "Error",
        description: "Failed to create flashcard. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Delete flashcard
  const deleteFlashcard = async (id: number): Promise<void> => {
    try {
      await apiRequest('DELETE', `/api/flashcards/${id}`, undefined);
      
      // Update state by removing the deleted card
      setCustomFlashcards(prev => prev.filter(card => card.id !== id));
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/flashcards'] });
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      toast({
        title: "Error",
        description: "Failed to delete flashcard. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Toggle bookmark status
  const toggleBookmark = (flashcardId: number) => {
    // Check if already bookmarked
    const isAlreadyBookmarked = bookmarkedIds.includes(flashcardId);
    
    if (isAlreadyBookmarked) {
      // Remove from bookmarks
      const newBookmarkedIds = bookmarkedIds.filter(id => id !== flashcardId);
      setBookmarkedIds(newBookmarkedIds);
      localStorage.setItem('bookmarkedCards', JSON.stringify(newBookmarkedIds));
    } else {
      // Add to bookmarks
      const newBookmarkedIds = [...bookmarkedIds, flashcardId];
      setBookmarkedIds(newBookmarkedIds);
      localStorage.setItem('bookmarkedCards', JSON.stringify(newBookmarkedIds));
      
      // Add to recently viewed if not already there
      const flashcard = [...flashcards, ...customFlashcards].find(card => card.id === flashcardId);
      if (flashcard) {
        updateRecentlyViewed(flashcard);
      }
    }
    
    // In a real app, this would also update the API
    // apiRequest('POST', '/api/bookmarks/toggle', { userId: DEFAULT_USER_ID, flashcardId });
  };
  
  // Check if a card is bookmarked
  const isBookmarked = (flashcardId: number): boolean => {
    return bookmarkedIds.includes(flashcardId);
  };
  
  // Toggle mastered status
  const toggleMastered = (flashcardId: number) => {
    // Check if already mastered
    const isAlreadyMastered = masteredIds.includes(flashcardId);
    
    if (isAlreadyMastered) {
      // Remove from mastered
      const newMasteredIds = masteredIds.filter(id => id !== flashcardId);
      setMasteredIds(newMasteredIds);
      localStorage.setItem('masteredCards', JSON.stringify(newMasteredIds));
    } else {
      // Add to mastered
      const newMasteredIds = [...masteredIds, flashcardId];
      setMasteredIds(newMasteredIds);
      localStorage.setItem('masteredCards', JSON.stringify(newMasteredIds));
      
      // Add to recently viewed if not already there
      const flashcard = [...flashcards, ...customFlashcards].find(card => card.id === flashcardId);
      if (flashcard) {
        updateRecentlyViewed(flashcard);
      }
    }
    
    // Update progress stats
    fetchProgressStats();
    
    // In a real app, this would also update the API
    // apiRequest('POST', '/api/progress', { userId: DEFAULT_USER_ID, flashcardId, status: isAlreadyMastered ? 'inProgress' : 'mastered' });
  };
  
  // Check if a card is mastered
  const isMastered = (flashcardId: number): boolean => {
    return masteredIds.includes(flashcardId);
  };
  
  // Update recently viewed cards
  const updateRecentlyViewed = (flashcard: Flashcard) => {
    setRecentlyViewedCards(prev => {
      // Remove if already in the list
      const filtered = prev.filter(card => card.id !== flashcard.id);
      // Add to beginning (most recent)
      const updated = [flashcard, ...filtered].slice(0, 6);
      // Save to localStorage
      localStorage.setItem('recentlyViewedCards', JSON.stringify(updated));
      return updated;
    });
  };
  
  // Context value
  const value: FlashcardContextType = {
    flashcards,
    customFlashcards,
    bookmarks,
    recentlyViewedCards,
    progressStats,
    currentPage,
    totalPages,
    setCurrentPage,
    fetchFlashcards,
    fetchCustomFlashcards,
    fetchTestFlashcards,
    createCustomFlashcard,
    deleteFlashcard,
    toggleBookmark,
    isBookmarked,
    toggleMastered,
    isMastered,
  };
  
  return (
    <FlashcardContext.Provider value={value}>
      {children}
    </FlashcardContext.Provider>
  );
}

// Hook to use the flashcard context
export function useFlashcardContext() {
  const context = useContext(FlashcardContext);
  if (context === undefined) {
    throw new Error('useFlashcardContext must be used within a FlashcardProvider');
  }
  return context;
}