import { Link, useLocation } from "wouter";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 w-full z-50 glass-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center space-x-3" data-testid="logo-link">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-comment-dots text-white text-lg"></i>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
                SecretChatBox
              </span>
              <span className="text-xs text-gray-400 -mt-1">Anonymous campus confessions</span>
            </div>
          </div>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
            className="p-2 rounded-lg bg-muted hover:bg-primary/20 transition-colors"
          >
            {theme === "light" ? (
              <i className="fas fa-moon"></i>
            ) : (
              <i className="fas fa-sun"></i>
            )}
          </Button>
          
          {location !== "/admin" && (
            <Link href="/admin">
              <Button 
                size="sm" 
                data-testid="button-admin-login"
                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Admin Login
              </Button>
            </Link>
          )}
          
          {location !== "/chat" && (
            <Link href="/chat">
              <Button 
                size="sm" 
                data-testid="button-start-chat"
                className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                Start Chat
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
