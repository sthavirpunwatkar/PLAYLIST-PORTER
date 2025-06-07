'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, UserCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock Firebase Auth state
type AuthUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
};

export default function FirebaseLoginButton() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth state
    const timeoutId = setTimeout(() => {
      // To test logged in state:
      // setUser({ uid: '123', displayName: 'Demo User', email: 'demo@example.com', photoURL: 'https://placehold.co/40x40.png' });
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setUser({ uid: '123', displayName: 'Demo User', email: 'demo@example.com', photoURL: 'https://placehold.co/40x40.png' });
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setIsLoading(true);
    // Simulate logout
    setTimeout(() => {
      setUser(null);
      setIsLoading(false);
    }, 1000);
  };

  if (isLoading) {
    return <Button variant="outline" size="sm" disabled>Loading...</Button>;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} data-ai-hint="user avatar" />
              <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle className="h-5 w-5" />}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email || 'No email'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button variant="outline" onClick={handleLogin}>
      <LogIn className="mr-2 h-4 w-4" />
      Login (Optional)
    </Button>
  );
}
