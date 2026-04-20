import { Menu, LogIn, LogOut, Building2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface TopBarProps {
  onMenuClick: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export function TopBar({
  onMenuClick,
  onLoginClick,
  onSignupClick,
}: TopBarProps) {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="h-14 border-b border-border backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-30 bg-primary">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-primary-foreground" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-display font-bold text-primary-foreground tracking-tight">
            CiviQ
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full gradient-primary border-2 border-primary-foreground/30 flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-primary-foreground hidden sm:block">
              {user?.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoginClick}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogIn className="h-4 w-4 mr-1.5" />
              Login
            </Button>
            <Button
              size="sm"
              onClick={onSignupClick}
              className="bg-primary-foreground text-primary font-semibold hover:bg-primary-foreground/90 shadow-sm"
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
