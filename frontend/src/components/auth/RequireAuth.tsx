import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

interface RequireAuthProps {
  children: React.ReactNode;
  onAuthClick: () => void;
}

export function RequireAuth({ children, onAuthClick }: RequireAuthProps) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl border border-border p-8 shadow-card text-center space-y-4 max-w-md w-full"
        >
          <div className="h-14 w-14 rounded-full bg-warning/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-7 w-7 text-warning" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">Sign In Required</h2>
          <p className="text-muted-foreground text-sm">
            Please sign in to access this feature. Only logged-in users can view this page.
          </p>
          <Button
            onClick={onAuthClick}
            className="gradient-primary text-primary-foreground shadow-sm hover:shadow-glow transition-shadow"
          >
            Sign In / Sign Up
          </Button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
