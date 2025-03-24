import { Link, useLocation } from "wouter";
import { BookOpen, Timer, Edit, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
}

const NavItem = ({ icon, label, href, active }: NavItemProps) => {
  return (
    <Link href={href}>
      <a className={cn(
        "flex flex-col items-center justify-center",
        active ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400"
      )}>
        {icon}
        <span className="text-xs mt-1">{label}</span>
      </a>
    </Link>
  );
};

const MobileNav = () => {
  const [location] = useLocation();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10">
      <div className="grid grid-cols-4 h-16">
        <NavItem 
          icon={<BookOpen className="h-5 w-5" />} 
          label="Practice" 
          href="/practice" 
          active={location.startsWith('/practice')} 
        />
        <NavItem 
          icon={<Timer className="h-5 w-5" />} 
          label="Test" 
          href="/test" 
          active={location === '/test'} 
        />
        <NavItem 
          icon={<Edit className="h-5 w-5" />} 
          label="Custom" 
          href="/custom" 
          active={location === '/custom'} 
        />
        <NavItem 
          icon={<User className="h-5 w-5" />} 
          label="Profile" 
          href="/" 
          active={location === '/' && !location.startsWith('/practice') && location !== '/test' && location !== '/custom'} 
        />
      </div>
    </div>
  );
};

export default MobileNav;
