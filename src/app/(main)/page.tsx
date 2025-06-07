'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PageTitle from '@/components/common/PageTitle';
import SpotifyConnectDisplay from '@/components/spotify/SpotifyConnectDisplay';
import type { SpotifyUser } from '@/types';
import { ArrowRight, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const [sourceConnected, setSourceConnected] = useState(false);
  const [destinationConnected, setDestinationConnected] = useState(false);
  // States for user objects are not strictly needed on this page for now,
  // but could be used to display user info if desired.
  // const [sourceUser, setSourceUser] = useState<SpotifyUser | null>(null);
  // const [destinationUser, setDestinationUser] = useState<SpotifyUser | null>(null);

  useEffect(() => {
    // Initialize connection states from localStorage
    setSourceConnected(localStorage.getItem('sourceConnected') === 'true');
    setDestinationConnected(localStorage.getItem('destinationConnected') === 'true');
  }, []);

  const handleSourceConnectionChange = (isConnected: boolean, user?: SpotifyUser) => {
    setSourceConnected(isConnected);
    // if (user) setSourceUser(user); else setSourceUser(null);
  };

  const handleDestinationConnectionChange = (isConnected: boolean, user?: SpotifyUser) => {
    setDestinationConnected(isConnected);
    // if (user) setDestinationUser(user); else setDestinationUser(null);
  };
  
  const canProceedToSelect = sourceConnected;
  const canAnalyzeGenres = sourceConnected && destinationConnected;

  return (
    <div className="space-y-12">
      <PageTitle>Welcome to Playlist Porter</PageTitle>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Easily transfer your Spotify playlists and liked songs from one account to another.
        Connect your accounts below to get started.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <SpotifyConnectDisplay
          accountType="source"
          onConnectionChange={handleSourceConnectionChange}
          title="Step 1: Source Account"
          description="Connect the Spotify account you want to copy music FROM."
        />
        <SpotifyConnectDisplay
          accountType="destination"
          onConnectionChange={handleDestinationConnectionChange}
          title="Step 2: Destination Account"
          description="Connect the Spotify account you want to copy music TO."
        />
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Next Steps</CardTitle>
          <CardDescription>Once your accounts are connected, you can proceed to copy your music or analyze genres.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button
              asChild
              disabled={!canProceedToSelect}
              className="w-full md:w-auto"
              size="lg"
            >
              <Link href="/select-data">
                Select Data to Copy
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            {!canProceedToSelect && <p className="text-sm text-muted-foreground mt-2">Connect your source account to select data.</p>}
          </div>
          
          <div>
            <Button
              asChild
              disabled={!canAnalyzeGenres}
              variant="outline"
              className="w-full md:w-auto"
              size="lg"
            >
              <Link href="/genre-analysis">
                Analyze Common Genres
                <Zap className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            {!canAnalyzeGenres && <p className="text-sm text-muted-foreground mt-2">Connect both accounts to analyze genres.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
