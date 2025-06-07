// src/app/(main)/select-data/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageTitle from '@/components/common/PageTitle';
import PlaylistItemCard from '@/components/spotify/PlaylistItemCard';
import SongItemCard from '@/components/spotify/SongItemCard';
import { Button } from '@/components/ui/button';
import { fetchSourceAccountData } from '@/lib/actions'; // Updated to use Python backend
import type { SpotifyPlaylist, SpotifyTrack } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CopyPlus, ListMusic, Heart, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SelectDataPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [likedSongs, setLikedSongs] = useState<SpotifyTrack[]>([]);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<Set<string>>(new Set());
  const [selectedSongIds, setSelectedSongIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSourceConnected, setIsSourceConnected] = useState(false);
  const [isDestinationConnected, setIsDestinationConnected] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const sourceConnected = localStorage.getItem('sourceConnected') === 'true';
    const destinationConnected = localStorage.getItem('destinationConnected') === 'true';
    const sourceToken = localStorage.getItem('sourceAccessToken');

    setIsSourceConnected(sourceConnected);
    setIsDestinationConnected(destinationConnected);

    if (!sourceConnected) {
      toast({
        title: "Source Account Not Connected",
        description: "Please connect your source Spotify account first.",
        variant: "destructive",
      });
      router.push('/');
      return;
    }
    if (!sourceToken) {
      toast({
        title: "Source Token Missing",
        description: "Source account token not found. Please reconnect.",
        variant: "destructive",
      });
      // Potentially clear connection state and redirect
      // localStorage.removeItem('sourceConnected');
      // localStorage.removeItem('sourceUser');
      // localStorage.removeItem('sourceAccessToken');
      router.push('/');
      return;
    }

    async function loadData() {
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = await fetchSourceAccountData(sourceToken);
        if (data.error) {
          setFetchError(data.error);
          toast({
            title: "Error Fetching Data",
            description: data.error || "Could not load your playlists and liked songs from Python service.",
            variant: "destructive",
          });
          // Keep existing mock data or empty if preferred on error
          // setPlaylists(MOCK_SPOTIFY_PLAYLISTS); // Fallback example
          // setLikedSongs(MOCK_SPOTIFY_LIKED_SONGS);
        } else {
          setPlaylists(data.playlists);
          setLikedSongs(data.likedSongs);
        }
      } catch (error) {
        console.error("Critical error fetching source data:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        setFetchError(errorMessage);
        toast({
          title: "Critical Error Fetching Data",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router, toast]);

  const togglePlaylistSelection = (id: string) => {
    setSelectedPlaylistIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSongSelection = (id: string) => {
    setSelectedSongIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllPlaylists = (checked: boolean) => {
    if (checked) {
      setSelectedPlaylistIds(new Set(playlists.map(p => p.id)));
    } else {
      setSelectedPlaylistIds(new Set());
    }
  };

  const handleSelectAllLikedSongs = (checked: boolean) => {
    if (checked) {
      setSelectedSongIds(new Set(likedSongs.map(s => s.id)));
    } else {
      setSelectedSongIds(new Set());
    }
  };

  const handleProceedToCopy = () => {
    if (!isDestinationConnected) {
      toast({
        title: "Destination Account Not Connected",
        description: "Please connect your destination Spotify account on the home page before copying.",
        variant: "destructive",
      });
      return;
    }
    if (selectedPlaylistIds.size === 0 && selectedSongIds.size === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one playlist or liked song to copy.",
        variant: "default", // Changed from "destructive"
      });
      return;
    }
    // Tokens will be retrieved from localStorage in copy-status page or passed through state if preferred
    localStorage.setItem('selectedPlaylistIds', JSON.stringify(Array.from(selectedPlaylistIds)));
    localStorage.setItem('selectedSongIds', JSON.stringify(Array.from(selectedSongIds)));
    router.push('/copy-status');
  };

   if (!isSourceConnected && !isLoading) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="mt-4 text-muted-foreground text-lg">Redirecting... Source account not connected.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-muted-foreground">Loading your music via Python service...</p>
      </div>
    );
  }
  
  if (fetchError) {
    return (
      <div className="space-y-8">
        <PageTitle>Select Data to Copy</PageTitle>
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Failed to Load Music Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground mb-2">
              There was an error fetching your music data from the Python service:
            </p>
            <p className="text-destructive-foreground font-mono bg-destructive/20 p-2 rounded text-sm">{fetchError}</p>
            <p className="text-destructive-foreground mt-4">
              Please ensure the Python service is running correctly and accessible. You might need to check its logs.
              You can try <Button variant="link" onClick={() => window.location.reload()} className="p-0 h-auto text-destructive-foreground underline">reloading the page</Button> or returning to <Link href="/" className="underline">Home</Link>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageTitle>Select Data to Copy</PageTitle>
      <p className="text-muted-foreground">
        Choose the playlists and liked songs you want to transfer from your source account.
        Ensure your destination account is connected on the <Link href="/" className="underline hover:text-primary">home page</Link>.
        Data is being fetched via the Python backend.
      </p>

      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold flex items-center font-headline">
            <ListMusic className="mr-3 h-6 w-6 text-primary" />
            Playlists ({playlists.length})
          </h2>
          {playlists.length > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all-playlists"
                onCheckedChange={(checked) => handleSelectAllPlaylists(Boolean(checked))}
                checked={selectedPlaylistIds.size === playlists.length && playlists.length > 0}
              />
              <Label htmlFor="select-all-playlists" className="text-sm">Select All</Label>
            </div>
          )}
        </div>
        {playlists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map(playlist => (
              <PlaylistItemCard
                key={playlist.id}
                playlist={playlist}
                isSelected={selectedPlaylistIds.has(playlist.id)}
                onToggleSelection={togglePlaylistSelection}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-4">No playlists found in your source account (via Python service).</p>
        )}
      </section>

      <Separator className="my-10" />

      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold flex items-center font-headline">
            <Heart className="mr-3 h-6 w-6 text-primary" />
            Liked Songs ({likedSongs.length})
          </h2>
           {likedSongs.length > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all-liked-songs"
                onCheckedChange={(checked) => handleSelectAllLikedSongs(Boolean(checked))}
                checked={selectedSongIds.size === likedSongs.length && likedSongs.length > 0}
              />
              <Label htmlFor="select-all-liked-songs" className="text-sm">Select All</Label>
            </div>
          )}
        </div>
        {likedSongs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {likedSongs.map(song => (
              <SongItemCard
                key={song.id}
                song={song}
                isSelected={selectedSongIds.has(song.id)}
                onToggleSelection={toggleSongSelection}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-4">No liked songs found in your source account (via Python service).</p>
        )}
      </section>
      
      <Separator className="my-10" />

      <div className="flex flex-col items-end mt-8">
        <Button
          size="lg"
          onClick={handleProceedToCopy}
          disabled={!isDestinationConnected || (selectedPlaylistIds.size === 0 && selectedSongIds.size === 0)}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <CopyPlus className="mr-2 h-5 w-5" />
          Copy Selected ({selectedPlaylistIds.size + selectedSongIds.size}) Items
        </Button>
       {!isDestinationConnected && <p className="text-right text-sm text-destructive mt-2">Please connect your destination account on the home page to enable copying.</p>}
       {(isDestinationConnected && selectedPlaylistIds.size === 0 && selectedSongIds.size === 0) && <p className="text-right text-sm text-muted-foreground mt-2">Select at least one item to copy.</p>}
      </div>
    </div>
  );
}
