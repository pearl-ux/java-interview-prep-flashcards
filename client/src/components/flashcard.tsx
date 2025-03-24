import { useState } from "react";
import { CheckSquare, Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Flashcard as FlashcardType } from "@shared/schema";
import { useFlashcardContext } from "@/lib/hooks";

interface FlashcardProps {
  card: FlashcardType;
  className?: string;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-emerald-500 text-emerald-500';
    case 'medium':
      return 'bg-amber-500 text-amber-500';
    case 'hard':
      return 'bg-red-500 text-red-500';
    default:
      return 'bg-gray-500 text-gray-500';
  }
};

const Flashcard = ({ card, className }: FlashcardProps) => {
  const [flipped, setFlipped] = useState(false);
  const { toggleBookmark, isBookmarked, toggleMastered, isMastered } = useFlashcardContext();
  
  const isCardBookmarked = isBookmarked(card.id);
  const isCardMastered = isMastered(card.id);
  
  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(card.id);
  };
  
  const handleToggleMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMastered(card.id);
  };
  
  const handleFlip = () => {
    setFlipped(!flipped);
  };
  
  const difficultyColor = getDifficultyColor(card.difficulty);
  
  return (
    <div className={cn("h-64", className)}>
      <div 
        className={cn(
          "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full",
          "transition-all duration-500 transform-gpu",
          "flex flex-col relative",
          flipped ? "rotateY-180" : ""
        )}
      >
        {/* Card Front */}
        <div className={cn("flex flex-col h-full", flipped ? "hidden" : "")}>
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <span className="inline-flex items-center text-xs font-medium">
              <span className={cn("w-2.5 h-2.5 rounded-full mr-1.5", difficultyColor.split(' ')[0])}></span>
              <span className={difficultyColor.split(' ')[1]}>{card.difficulty.charAt(0).toUpperCase() + card.difficulty.slice(1)}</span>
            </span>
            <div className="flex items-center space-x-1">
              <button 
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" 
                onClick={handleToggleBookmark}
              >
                {isCardBookmarked ? (
                  <BookmarkCheck className="h-4 w-4 text-primary-500" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </button>
              <button 
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={handleToggleMastered}
              >
                <CheckSquare className={cn("h-4 w-4", isCardMastered ? "text-emerald-500" : "")} />
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 text-center">
                {card.question}
              </h3>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.category}</span>
              <button 
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-primary-50 hover:bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:hover:bg-primary-900/60 dark:text-primary-300"
                onClick={handleFlip}
              >
                Show Answer
              </button>
            </div>
          </div>
        </div>
        
        {/* Card Back */}
        <div className={cn("flex flex-col h-full", !flipped ? "hidden" : "")}>
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <span className="inline-flex items-center text-xs font-medium">
              <span className={cn("w-2.5 h-2.5 rounded-full mr-1.5", difficultyColor.split(' ')[0])}></span>
              <span className={difficultyColor.split(' ')[1]}>{card.difficulty.charAt(0).toUpperCase() + card.difficulty.slice(1)}</span>
            </span>
            <div className="flex items-center space-x-1">
              <button 
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" 
                onClick={handleToggleBookmark}
              >
                {isCardBookmarked ? (
                  <BookmarkCheck className="h-4 w-4 text-primary-500" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </button>
              <button 
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={handleToggleMastered}
              >
                <CheckSquare className={cn("h-4 w-4", isCardMastered ? "text-emerald-500" : "")} />
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: card.answer }} />
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              className="w-full py-1.5 text-sm font-medium rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
              onClick={handleFlip}
            >
              Back to Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
