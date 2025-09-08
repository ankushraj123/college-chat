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
          <div className="flex items-center space-x-2" data-testid="logo-link">
            <i className="fas fa-user-secret text-2xl text-primary"></i>
            <span className="text-xl font-bold gradient-text">SecretChatBox</span>
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
