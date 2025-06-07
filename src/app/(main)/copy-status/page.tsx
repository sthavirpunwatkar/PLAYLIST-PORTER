'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageTitle from '@/components/common/PageTitle';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { copyDataToDestination } from '@/lib/actions';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { CheckCircle2, XCircle, Home, RotateCcw } from 'lucide-react';
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

    if (!storedPlaylistIds || !storedSongIds) {
      toast({
        title: "No selections found",
        description: "Please select items to copy first.",
        variant: "destructive",
      });
      router.push('/select-data');
      return;
    }
    
    const parsedPlaylistIds = JSON.parse(storedPlaylistIds) as string[];
    const parsedSongIds = JSON.parse(storedSongIds) as string[];
    setPlaylistIdsCount(parsedPlaylistIds.length);
    setSongIdsCount(parsedSongIds.length);

    async function performCopy() {
      try {
        const result = await copyDataToDestination({ playlistIds: parsedPlaylistIds, songIds: parsedSongIds });
        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Successfully copied selected items!');
          toast({
            title: "Copy Successful!",
            description: result.message || 'Your music has been transferred.',
          });
        } else {
          setStatus('error');
          setMessage(result.error || 'An unknown error occurred during copying.');
           toast({
            title: "Copy Failed",
            description: result.error || 'Could not transfer your music.',
            variant: "destructive",
          });
        }
      } catch (error) {
        setStatus('error');
        setMessage('A critical error occurred. Please try again.');
        console.error("Copy error:", error);
        toast({
            title: "Copy Error",
            description: "A critical error occurred during the copy process.",
            variant: "destructive",
        });
      } finally {
        // Clean up local storage
        localStorage.removeItem('selectedPlaylistIds');
        localStorage.removeItem('selectedSongIds');
      }
    }

    // Only run performCopy if counts are set (meaning localStorage was valid)
    if (parsedPlaylistIds.length > 0 || parsedSongIds.length > 0 || (parsedPlaylistIds.length === 0 && parsedSongIds.length === 0)) {
        performCopy();
    } else if (parsedPlaylistIds.length === 0 && parsedSongIds.length === 0 && localStorage.getItem('selectedPlaylistIds') && localStorage.getItem('selectedSongIds')) {
        // Case where selection was empty but explicitly made (0 items)
        performCopy();
    }


  }, [router, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          {status === 'loading' && <PageTitle className="mb-2">Copying Your Music</PageTitle>}
          {status === 'success' && <PageTitle className="mb-2">Copy Complete!</PageTitle>}
          {status === 'error' && <PageTitle className="mb-2">Copy Failed</PageTitle>}
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <LoadingSpinner size={64} className="text-primary" />
              <p className="text-muted-foreground">Please wait while we transfer your selected playlists and songs...</p>
              <p className="text-sm text-muted-foreground">({playlistIdsCount} playlists, {songIdsCount} songs)</p>
            </div>
          )}
          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle2 className="h-20 w-20 text-green-500" />
              <p className="text-lg">{message}</p>
              <p className="text-muted-foreground">You can now find them in your destination Spotify account.</p>
            </div>
          )}
          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-20 w-20 text-destructive" />
              <p className="text-lg text-destructive">{message}</p>
              <p className="text-muted-foreground">Please try again or contact support if the issue persists.</p>
            </div>
          )}
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
