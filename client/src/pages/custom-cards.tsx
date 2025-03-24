import { useState, useEffect } from "react";
import { 
  Edit,
  Trash2,
  Plus,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCategories, useFlashcardContext } from "@/lib/hooks";
import CreateFlashcardDialog from "@/components/create-flashcard-dialog";
import { Flashcard as FlashcardType } from "@shared/schema";

const CustomCards = () => {
  const { toast } = useToast();
  const { categories } = useCategories();
  const { 
    customFlashcards,
    fetchCustomFlashcards,
    deleteFlashcard
  } = useFlashcardContext();
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<FlashcardType | null>(null);
  
  useEffect(() => {
    fetchCustomFlashcards({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
    });
  }, [selectedCategory, selectedDifficulty]);
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };
  
  const handleDifficultyChange = (value: string) => {
    setSelectedDifficulty(value);
  };
  
  const confirmDelete = (card: FlashcardType) => {
    setCardToDelete(card);
    setDeleteConfirmOpen(true);
  };
  
  const handleDelete = async () => {
    if (cardToDelete) {
      try {
        await deleteFlashcard(cardToDelete.id);
        toast({
          title: "Flashcard deleted",
          description: "Your custom flashcard has been removed.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete flashcard. Please try again.",
          variant: "destructive",
        });
      }
      setDeleteConfirmOpen(false);
      setCardToDelete(null);
    }
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };
  
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Custom Flashcards</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage your own custom flashcards.
          </p>
        </div>
        
        <CreateFlashcardDialog 
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Card
            </Button>
          } 
        />
      </div>
      
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</span>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.name} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty:</span>
          <Select value={selectedDifficulty} onValueChange={handleDifficultyChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Custom Cards List */}
      {customFlashcards.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Filter className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No custom flashcards</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              You haven't created any custom flashcards yet. Create your first one to start customizing your learning experience.
            </p>
            
            <CreateFlashcardDialog 
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Card
                </Button>
              } 
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {customFlashcards.map((card) => (
            <Card key={card.id} className="relative overflow-hidden group">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(card.difficulty)}`}>
                    {card.difficulty.charAt(0).toUpperCase() + card.difficulty.slice(1)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {card.category}
                  </span>
                </div>
                <CardTitle className="line-clamp-2 text-base">
                  {card.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: card.answer }} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-gray-500"
                  onClick={() => confirmDelete(card)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <CreateFlashcardDialog 
                  trigger={
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  } 
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Custom Flashcard</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this flashcard? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {cardToDelete && (
            <div className="py-4 px-2 mb-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Question:
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                {cardToDelete.question}
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Category:
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {cardToDelete.category} ({cardToDelete.difficulty})
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomCards;
