import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  BookOpen, 
  Timer, 
  Edit, 
  Clock, 
  Library,
  PlusCircle
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useFlashcardContext } from "@/lib/hooks";
import CreateFlashcardDialog from "@/components/create-flashcard-dialog";

const Home = () => {
  const { progressStats, recentlyViewedCards } = useFlashcardContext();
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400">Welcome to Java Interview Prep Flashcards.</p>
      </div>
      
      {/* Progress Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>Track your learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-primary-500 h-2.5 rounded-full" 
                style={{ width: `${progressStats.percentage}%` }}
              ></div>
            </div>
            <span className="ml-4 text-sm font-medium text-gray-700 dark:text-gray-300">
              {progressStats.percentage}%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Mastered</p>
              <p className="font-semibold text-primary-600 dark:text-primary-400">{progressStats.mastered}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">In Progress</p>
              <p className="font-semibold text-gray-700 dark:text-gray-300">{progressStats.inProgress}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">To Review</p>
              <p className="font-semibold text-amber-500">{progressStats.toReview}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Learning Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-primary-500" />
              Practice Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Study flashcards at your own pace, organized by topic.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/practice">Start Practicing</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Timer className="mr-2 h-5 w-5 text-amber-500" />
              Test Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Take timed mock interviews with random questions.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/test">Start Test</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Edit className="mr-2 h-5 w-5 text-emerald-500" />
              Custom Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create and manage your own custom flashcards.
            </p>
          </CardContent>
          <CardFooter>
            <CreateFlashcardDialog 
              trigger={
                <Button variant="outline" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Card
                </Button>
              } 
            />
          </CardFooter>
        </Card>
      </div>
      
      {/* Recently Viewed */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            <Clock className="inline mr-2 h-5 w-5" />
            Recently Viewed
          </h3>
          <Button variant="link" asChild>
            <Link href="/practice">View All</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentlyViewedCards.length > 0 ? (
            recentlyViewedCards.map((card) => (
              <Card key={card.id} className="h-32">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {card.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      card.difficulty === 'easy' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : card.difficulty === 'medium'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {card.difficulty.charAt(0).toUpperCase() + card.difficulty.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 line-clamp-2">
                    {card.question}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
              <Library className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recently viewed cards. Start practicing to see your history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
