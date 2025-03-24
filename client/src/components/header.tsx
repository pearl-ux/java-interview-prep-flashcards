import { useState } from "react";
import { Menu, Search, Bookmark, Settings, Sun, Moon } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Input } from "@/components/ui/input";
import Sidebar from "./sidebar";
import { useFlashcardContext } from "@/lib/hooks";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { bookmarks } = useFlashcardContext();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic
    console.log("Searching for:", searchQuery);
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button type="button" className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[80%] sm:w-[350px]">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <h1 className="ml-3 font-medium text-lg text-primary-600 dark:text-primary-400">Java Prep</h1>
        </div>
        
        <div className="hidden md:flex flex-1 max-w-lg mx-auto">
          <form onSubmit={handleSearch} className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input 
              type="text" 
              className="block w-full pl-10 pr-3 py-2"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
        
        <div className="flex items-center space-x-4">
          <button type="button" className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 relative">
            <Bookmark className="h-5 w-5" />
            {bookmarks.length > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-primary-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {bookmarks.length}
              </span>
            )}
          </button>
          <button type="button" className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
            <Settings className="h-5 w-5" />
          </button>
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input 
            type="text" 
            className="block w-full pl-10 pr-3 py-2"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
    </header>
  );
};

export default Header;
