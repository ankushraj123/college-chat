import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navButtons = (
    <>
      {location !== "/admin" && (
        <Link href="/admin" className="w-full md:w-auto">
          <Button
            size="sm"
            data-testid="button-admin-login"
            className="w-full justify-center md:w-auto px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsMenuOpen(false)}
          >
            Admin Login
          </Button>
        </Link>
      )}
      {location !== "/vip" && (
        <Link href="/vip" className="w-full md:w-auto">
          <Button
            size="sm"
            data-testid="button-vip-access"
            className="w-full justify-center md:w-auto px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            onClick={() => setIsMenuOpen(false)}
          >
            <i className="fas fa-crown mr-2"></i>
            VIP
          </Button>
        </Link>
      )}
       {location !== "/chief-login" && (
        <Link href="/chief-login" className="w-full md:w-auto">
          <Button
            size="sm"
            data-testid="button-chief-login"
            className="w-full justify-center md:w-auto px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm bg-red-500 text-white hover:bg-red-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Chief Login
          </Button>
        </Link>
      )}
     </>
   );

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
              <span className="text-xs text-gray-400 -mt-1">
                Anonymous campus confessions
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-4">
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
          {navButtons}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg bg-muted hover:bg-primary/20 transition-colors"
          >
            <i className="fas fa-bars"></i>
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 pb-4 flex flex-col items-center space-y-2">
            {navButtons}
          </div>
        </div>
      )}
    </nav>
  );
}