// src/app/(main)/copy-status/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageTitle from '@/components/common/PageTitle';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { copyDataToDestination } from '@/lib/actions'; // Updated to use Python backend
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Home, RotateCcw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CopyStatusPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [playlistIdsCount, setPlaylistIdsCount] = useState(0);
  const [songIdsCount, setSongIdsCount] = useState(0);

  useEffect(() => {
    const storedPlaylistIds = localStorage.getItem('selectedPlaylistIds');
    const storedSongIds = localStorage.getItem('selectedSongIds');
    const sourceToken = localStorage.getItem('sourceAccessToken');
    const destinationToken = localStorage.getItem('destinationAccessToken');

    if (!storedPlaylistIds || !storedSongIds) {
      toast({
        title: "No selections found",
        description: "Please select items to copy first.",
        variant: "destructive",
      });
      router.push('/select-data');
      return;
    }

    if (!sourceToken || !destinationToken) {
      toast({
        title: "Spotify Tokens Missing",
        description: "Source or destination Spotify token not found. Please reconnect accounts on the home page.",
        variant: "destructive",
      });
      router.push('/');
      return;
    }
    
    const parsedPlaylistIds = JSON.parse(storedPlaylistIds) as string[];
    const parsedSongIds = JSON.parse(storedSongIds) as string[];
    setPlaylistIdsCount(parsedPlaylistIds.length);
    setSongIdsCount(parsedSongIds.length);

    async function performCopy() {
      try {
        const result = await copyDataToDestination(
          { playlistIds: parsedPlaylistIds, songIds: parsedSongIds },
          sourceToken,
          destinationToken
        );
        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Successfully copied selected items via Python service!');
          toast({
            title: "Copy Successful!",
            description: result.message || 'Your music has been transferred.',
          });
        } else {
          setStatus('error');
          setMessage(result.error || 'An unknown error occurred during copying via Python service.');
           toast({
            title: "Copy Failed",
            description: result.error || 'Could not transfer your music.',
            variant: "destructive",
          });
        }
      } catch (error) {
        setStatus('error');
        const errorMessage = error instanceof Error ? error.message : "A critical error occurred.";
        setMessage(`A critical error occurred: ${errorMessage}. Please try again.`);
        console.error("Copy error:", error);
        toast({
            title: "Copy Error",
            description: `A critical error occurred during the copy process: ${errorMessage}`,
            variant: "destructive",
        });
      } finally {
        // Optionally, clear selections after copy attempt, regardless of outcome
        // localStorage.removeItem('selectedPlaylistIds');
        // localStorage.removeItem('selectedSongIds');
        // Do NOT remove tokens here, they are managed on the home page / connection components
      }
    }
    
    // Proceed if tokens are present (checked above)
    // and if there are selections or if user explicitly selected zero items (already handled by select-data page)
    performCopy();

  }, [router, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          {status === 'loading' && <CardTitle className="mb-2 text-2xl font-semibold">Copying Your Music</CardTitle>}
          {status === 'success' && <CardTitle className="mb-2 text-2xl font-semibold">Copy Complete!</CardTitle>}
          {status === 'error' && <CardTitle className="mb-2 text-2xl font-semibold">Copy Failed</CardTitle>}
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <LoadingSpinner size={64} className="text-primary" />
              <p className="text-muted-foreground">Please wait while we transfer your selected items using the Python service...</p>
              <p className="text-sm text-muted-foreground">({playlistIdsCount} playlists, {songIdsCount} songs)</p>
            </div>
          )}
          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle2 className="h-20 w-20 text-green-500" />
              <p className="text-lg">{message}</p>
              <p className="text-muted-foreground">You can now check your destination Spotify account.</p>
            </div>
          )}
          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-20 w-20 text-destructive" />
              <p className="text-lg text-destructive">{message}</p>
              <p className="text-muted-foreground">Please try again or contact support if the issue persists. Check Python service logs if applicable.</p>
            </div>
          )}
           <div className="text-xs text-muted-foreground pt-4 border-t">
            Note: Copy operations are currently processed by the Python backend. For real Spotify interactions, ensure the Python service has valid Spotify App credentials and the Next.js app provides real user OAuth tokens. Currently, placeholder tokens are used.
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Go to Home
            </Link>
          </Button>
          {(status === 'success' || status === 'error') && (
            <Button asChild>
              <Link href="/select-data">
                <RotateCcw className="mr-2 h-4 w-4" /> Start New Copy
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
