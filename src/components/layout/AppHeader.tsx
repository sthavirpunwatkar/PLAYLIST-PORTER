import Link from 'next/link';
import { Music2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FirebaseLoginButton from '@/components/auth/FirebaseLoginButton';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Music2 className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl font-headline">Playlist Porter</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/genre-analysis">
              <Zap className="mr-2 h-4 w-4" />
              Genre Analysis
            </Link>
          </Button>
          <FirebaseLoginButton />
        </nav>
      </div>
    </header>
  );
}
