import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./components/ui/theme-toggle";
import { Toaster } from "@/components/ui/toaster";

import Home from "@/pages/home";
import PracticeMode from "@/pages/practice-mode";
import TestMode from "@/pages/test-mode";
import CustomCards from "@/pages/custom-cards";
import NotFound from "@/pages/not-found";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import MobileNav from "@/components/mobile-nav";
import { FlashcardProvider } from "@/lib/hooks.tsx";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/practice" component={PracticeMode} />
      <Route path="/practice/:category" component={PracticeMode} />
      <Route path="/test" component={TestMode} />
      <Route path="/custom" component={CustomCards} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <FlashcardProvider>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
                <Router />
              </main>
            </div>
          </div>
          <MobileNav />
          <Toaster />
        </FlashcardProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
