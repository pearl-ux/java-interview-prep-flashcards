import { Flashcard } from "@shared/schema";

// This is a data service to handle client-side storage
// and synchronization with the backend

// Save cards to local storage (for offline/persistence)
export const saveFlashcardsToLocalStorage = (cards: Flashcard[]) => {
  try {
    localStorage.setItem('flashcards', JSON.stringify(cards));
  } catch (error) {
    console.error('Error saving flashcards to localStorage:', error);
  }
};

// Load cards from local storage
export const loadFlashcardsFromLocalStorage = (): Flashcard[] => {
  try {
    const storedCards = localStorage.getItem('flashcards');
    return storedCards ? JSON.parse(storedCards) : [];
  } catch (error) {
    console.error('Error loading flashcards from localStorage:', error);
    return [];
  }
};

// Save custom cards to local storage
export const saveCustomFlashcardsToLocalStorage = (cards: Flashcard[]) => {
  try {
    localStorage.setItem('customFlashcards', JSON.stringify(cards));
  } catch (error) {
    console.error('Error saving custom flashcards to localStorage:', error);
  }
};

// Load custom cards from local storage
export const loadCustomFlashcardsFromLocalStorage = (): Flashcard[] => {
  try {
    const storedCards = localStorage.getItem('customFlashcards');
    return storedCards ? JSON.parse(storedCards) : [];
  } catch (error) {
    console.error('Error loading custom flashcards from localStorage:', error);
    return [];
  }
};

// Save progress to local storage
export const saveProgressToLocalStorage = (userId: number, flashcardId: number, status: string) => {
  try {
    const progressKey = `progress_${userId}`;
    const storedProgress = localStorage.getItem(progressKey);
    const progress = storedProgress ? JSON.parse(storedProgress) : {};
    
    progress[flashcardId] = {
      status,
      lastReviewed: new Date().toISOString(),
    };
    
    localStorage.setItem(progressKey, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving progress to localStorage:', error);
  }
};

// Load progress from local storage
export const loadProgressFromLocalStorage = (userId: number) => {
  try {
    const progressKey = `progress_${userId}`;
    const storedProgress = localStorage.getItem(progressKey);
    return storedProgress ? JSON.parse(storedProgress) : {};
  } catch (error) {
    console.error('Error loading progress from localStorage:', error);
    return {};
  }
};

// Save bookmarks to local storage
export const saveBookmarksToLocalStorage = (userId: number, flashcardIds: number[]) => {
  try {
    const bookmarksKey = `bookmarks_${userId}`;
    localStorage.setItem(bookmarksKey, JSON.stringify(flashcardIds));
  } catch (error) {
    console.error('Error saving bookmarks to localStorage:', error);
  }
};

// Load bookmarks from local storage
export const loadBookmarksFromLocalStorage = (userId: number): number[] => {
  try {
    const bookmarksKey = `bookmarks_${userId}`;
    const storedBookmarks = localStorage.getItem(bookmarksKey);
    return storedBookmarks ? JSON.parse(storedBookmarks) : [];
  } catch (error) {
    console.error('Error loading bookmarks from localStorage:', error);
    return [];
  }
};
