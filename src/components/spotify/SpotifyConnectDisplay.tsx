'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Link as LinkIcon, Loader2 } from 'lucide-react';
import type { SpotifyUser } from '@/types';
import { connectSpotifyAccount } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


interface SpotifyConnectDisplayProps {
  accountType: 'source' | 'destination';
  onConnectionChange: (isConnected: boolean, user?: SpotifyUser) => void;
  buttonText?: string;
  title?: string;
  description?: string;
}

export default function SpotifyConnectDisplay({
  accountType,
  onConnectionChange,
  buttonText,
  title,
  description,
}: SpotifyConnectDisplayProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start true to check localStorage
  const [isConnecting, setIsConnecting] = useState(false);
  const [spotifyUser, setSpotifyUser] = useState<SpotifyUser | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check localStorage for existing connection state
    const storedConnected = localStorage.getItem(`${accountType}Connected`) === 'true';
    const storedUser = localStorage.getItem(`${accountType}User`);
    if (storedConnected && storedUser) {
      const parsedUser = JSON.parse(storedUser) as SpotifyUser;
      setIsConnected(true);
      setSpotifyUser(parsedUser);
      onConnectionChange(true, parsedUser);
    }
    setIsLoading(false);
  }, [accountType, onConnectionChange]);


  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await connectSpotifyAccount(accountType);
      if (result.success && result.user) {
        setIsConnected(true);
        setSpotifyUser(result.user);
        onConnectionChange(true, result.user);
        localStorage.setItem(`${accountType}Connected`, 'true');
        localStorage.setItem(`${accountType}User`, JSON.stringify(result.user));
        toast({
          title: `${accountType.charAt(0).toUpperCase() + accountType.slice(1)} Account Connected`,
          description: `Successfully connected as ${result.user.displayName}.`,
          variant: 'default',
        });
      } else {
        throw new Error(result.error || 'Failed to connect Spotify account.');
      }
    } catch (error) {
      console.error(`Error connecting ${accountType} Spotify:`, error);
      setIsConnected(false);
      setSpotifyUser(null);
      onConnectionChange(false);
      localStorage.removeItem(`${accountType}Connected`);
      localStorage.removeItem(`${accountType}User`);
      toast({
        title: 'Connection Failed',
        description: (error as Error).message || `Could not connect to ${accountType} Spotify.`,
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">
             {title || `${accountType.charAt(0).toUpperCase() + accountType.slice(1)} Spotify Account`}
          </CardTitle>
           {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading status...</span>
            </div>
        </CardContent>
      </Card>
    )
  }


  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          {title || `${accountType.charAt(0).toUpperCase() + accountType.slice(1)} Spotify Account`}
          {isConnected && <CheckCircle2 className="ml-2 h-5 w-5 text-green-500 shrink-0" />}
          {!isConnected && !isConnecting && <XCircle className="ml-2 h-5 w-5 text-destructive shrink-0" />}
           {isConnecting && <Loader2 className="ml-2 h-5 w-5 animate-spin shrink-0" />}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isConnecting ? (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Connecting...</span>
          </div>
        ) : isConnected && spotifyUser ? (
          <div className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-md">
            <Avatar>
              <AvatarImage src={spotifyUser.imageUrl} alt={spotifyUser.displayName} data-ai-hint="user avatar" />
              <AvatarFallback>{spotifyUser.displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{spotifyUser.displayName}</p>
              <p className="text-sm text-muted-foreground">Connected</p>
            </div>
          </div>
        ) : (
          <Button onClick={handleConnect} disabled={isConnecting} className="w-full" variant="outline">
            <LinkIcon className="mr-2 h-4 w-4" />
            {buttonText || `Connect ${accountType.charAt(0).toUpperCase() + accountType.slice(1)} Account`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
