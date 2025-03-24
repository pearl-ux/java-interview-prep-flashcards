import { Link, useLocation } from "wouter";
import { 
  BookOpen, Timer, Edit, LayoutDashboard,
  ChevronDown, ChevronUp
} from "lucide-react";
import { ThemeToggleWithText } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { useCategories } from "@/lib/hooks";
import { useState } from "react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  badge?: number;
}

const SidebarItem = ({ icon, label, href, active, badge }: SidebarItemProps) => {
  return (
    <li className="mb-1">
      <Link href={href}>
        <a className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md",
          active 
            ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300" 
            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        )}>
          {icon}
          <span>{label}</span>
          {badge !== undefined && (
            <span className="ml-auto bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 text-xs font-semibold px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </a>
      </Link>
    </li>
  );
};

const Sidebar = () => {
  const [location] = useLocation();
  const { categories } = useCategories();
  
  const [showCategories, setShowCategories] = useState(true);
  const [showDifficulty, setShowDifficulty] = useState(true);
  
  const toggleCategories = () => setShowCategories(!showCategories);
  const toggleDifficulty = () => setShowDifficulty(!showDifficulty);
  
  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="font-medium text-xl text-primary-600 dark:text-primary-400">Java Prep</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Interview Flashcards</p>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Modes</h2>
          <ul>
            <SidebarItem 
              icon={<LayoutDashboard className="mr-2 h-4 w-4" />} 
              label="Dashboard" 
              href="/" 
              active={location === '/'} 
            />
            <SidebarItem 
              icon={<BookOpen className="mr-2 h-4 w-4" />} 
              label="Practice Mode" 
              href="/practice" 
              active={location.startsWith('/practice')} 
            />
            <SidebarItem 
              icon={<Timer className="mr-2 h-4 w-4" />} 
              label="Test Mode" 
              href="/test" 
              active={location === '/test'} 
            />
            <SidebarItem 
              icon={<Edit className="mr-2 h-4 w-4" />} 
              label="Custom Cards" 
              href="/custom" 
              active={location === '/custom'} 
            />
          </ul>
        </div>
        
        <div className="mb-6">
          <button 
            onClick={toggleCategories}
            className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
          >
            <span>Categories</span>
            {showCategories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showCategories && (
            <ul>
              {categories.map((category, index) => (
                <SidebarItem 
                  key={index}
                  icon={<span />}
                  label={category.name}
                  href={`/practice/${encodeURIComponent(category.name)}`}
                  active={location === `/practice/${encodeURIComponent(category.name)}`}
                  badge={category.count}
                />
              ))}
            </ul>
          )}
        </div>
        
        <div>
          <button 
            onClick={toggleDifficulty}
            className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
          >
            <span>Difficulty</span>
            {showDifficulty ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showDifficulty && (
            <ul>
              <li className="mb-1">
                <Link href="/practice?difficulty=easy">
                  <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span> Easy
                  </a>
                </Link>
              </li>
              <li className="mb-1">
                <Link href="/practice?difficulty=medium">
                  <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                    <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span> Medium
                  </a>
                </Link>
              </li>
              <li className="mb-1">
                <Link href="/practice?difficulty=hard">
                  <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                    <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span> Hard
                  </a>
                </Link>
              </li>
            </ul>
          )}
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <ThemeToggleWithText />
      </div>
    </aside>
  );
};

export default Sidebar;
