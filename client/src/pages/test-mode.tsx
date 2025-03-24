import { useState, useEffect } from "react";
import { Timer, ArrowRight, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
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
} from "@/components/ui/dialog";
import { useCategories, useFlashcardContext } from "@/lib/hooks";
import { Flashcard as FlashcardType } from "@shared/schema";

const TestMode = () => {
  const { categories } = useCategories();
  const { fetchTestFlashcards } = useFlashcardContext();
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [testLength, setTestLength] = useState<number>(10);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [testCards, setTestCards] = useState<FlashcardType[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [results, setResults] = useState<{ mastered: number; toReview: number }>({
    mastered: 0,
    toReview: 0,
  });
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };
  
  const handleDifficultyChange = (value: string) => {
    setSelectedDifficulty(value);
  };
  
  const handleTestLengthChange = (value: string) => {
    setTestLength(parseInt(value, 10));
  };
  
  const startTest = async () => {
    const testData = await fetchTestFlashcards({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
      limit: testLength,
    });
    
    setTestCards(testData);
    setIsStarted(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setResults({ mastered: 0, toReview: 0 });
    
    // Start timer
    const id = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    setIntervalId(id);
  };
  
  const handleFlip = () => {
    setIsFlipped(true);
  };
  
  const handleMarkCard = (status: 'mastered' | 'toReview') => {
    if (status === 'mastered') {
      setResults(prev => ({ ...prev, mastered: prev.mastered + 1 }));
    } else {
      setResults(prev => ({ ...prev, toReview: prev.toReview + 1 }));
    }
    
    // Move to next card
    if (currentCardIndex < testCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      finishTest();
    }
  };
  
  const finishTest = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    setIsFinished(true);
  };
  
  const resetTest = () => {
    setIsStarted(false);
    setIsFinished(false);
    setTimer(0);
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);
  
  if (!isStarted) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Test Mode</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Challenge yourself with a timed mock interview session.
          </p>
        </div>
        
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Timer className="mr-2 h-5 w-5 text-amber-500" />
              Configure Test Session
            </CardTitle>
            <CardDescription>
              Customize your test parameters to focus on specific areas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
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
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Difficulty
              </label>
              <Select value={selectedDifficulty} onValueChange={handleDifficultyChange}>
                <SelectTrigger>
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
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Number of Questions
              </label>
              <Select value={testLength.toString()} onValueChange={handleTestLengthChange}>
                <SelectTrigger>
                  <SelectValue placeholder="10 Questions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                  <SelectItem value="20">20 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={startTest}>
              Start Test
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (isFinished) {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Test Results</DialogTitle>
            <DialogDescription>
              You've completed the test in {formatTime(timer)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                <Check className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  {results.mastered}
                </h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-500">Mastered</p>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <AlertCircle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
                <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                  {results.toReview}
                </h3>
                <p className="text-sm text-amber-600 dark:text-amber-500">Need Review</p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mastery Rate
                </span>
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  {Math.round((results.mastered / testLength) * 100)}%
                </span>
              </div>
              <Progress 
                value={(results.mastered / testLength) * 100} 
                className="h-2" 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={resetTest}>
              New Test
            </Button>
            <Button 
              onClick={resetTest}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              Back to Test Setup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  const currentCard = testCards[currentCardIndex];
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Test Mode</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Question {currentCardIndex + 1} of {testLength}
          </p>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-mono font-semibold text-primary-600 dark:text-primary-400">
            {formatTime(timer)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Elapsed Time</p>
        </div>
      </div>
      
      <Progress 
        value={((currentCardIndex + 1) / testLength) * 100} 
        className="h-1 mb-6" 
      />
      
      <Card className="mb-4">
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center text-xs font-medium">
              <span className={`w-2.5 h-2.5 rounded-full mr-1.5 ${
                currentCard.difficulty === 'easy' 
                  ? 'bg-emerald-500' 
                  : currentCard.difficulty === 'medium'
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}></span>
              <span className={
                currentCard.difficulty === 'easy' 
                  ? 'text-emerald-500' 
                  : currentCard.difficulty === 'medium'
                  ? 'text-amber-500'
                  : 'text-red-500'
              }>
                {currentCard.difficulty.charAt(0).toUpperCase() + currentCard.difficulty.slice(1)}
              </span>
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {currentCard.category}
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 pb-8">
          {!isFlipped ? (
            <div className="min-h-[180px] flex items-center justify-center">
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 text-center">
                {currentCard.question}
              </h3>
            </div>
          ) : (
            <div className="min-h-[180px] prose prose-sm dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: currentCard.answer }} />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t flex justify-center pt-4">
          {!isFlipped ? (
            <Button onClick={handleFlip}>
              Show Answer <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
                onClick={() => handleMarkCard('toReview')}
              >
                Need to Review <AlertCircle className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                onClick={() => handleMarkCard('mastered')}
              >
                Mastered <Check className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestMode;
