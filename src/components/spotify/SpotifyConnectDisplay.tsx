// src/components/spotify/SpotifyConnectDisplay.tsx
'use client';

import { useState, useEffect } from 'react';
// import Image from 'next/image'; // Not used directly currently
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Link as LinkIcon, Loader2 } from 'lucide-react';
import type { SpotifyUser } from '@/types';
import { connectSpotifyAccount } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


interface SpotifyConnectDisplayProps {
  accountType: 'source' | 'destination';
  onConnectionChange: (isConnected: boolean, user?: SpotifyUser, token?: string) => void;
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
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [spotifyUser, setSpotifyUser] = useState<SpotifyUser | null>(null);
  const { toast } = useToast();

  const tokenKey = `${accountType}AccessToken`; // Key for localStorage

  useEffect(() => {
    const storedConnected = localStorage.getItem(`${accountType}Connected`) === 'true';
    const storedUser = localStorage.getItem(`${accountType}User`);
    const storedToken = localStorage.getItem(tokenKey);

    if (storedConnected && storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser) as SpotifyUser;
        setIsConnected(true);
        setSpotifyUser(parsedUser);
        onConnectionChange(true, parsedUser, storedToken);
      } catch (e) {
        // Clear corrupted data
        localStorage.removeItem(`${accountType}Connected`);
        localStorage.removeItem(`${accountType}User`);
        localStorage.removeItem(tokenKey);
        onConnectionChange(false);
      }
    } else {
      onConnectionChange(false); // Ensure parent knows if not fully connected
    }
    setIsLoading(false);
  }, [accountType, onConnectionChange, tokenKey]);


  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // connectSpotifyAccount is a server action, it won't directly do OAuth redirect here.
      // It simulates success and returns user info.
      const result = await connectSpotifyAccount(accountType);
      if (result.success && result.user) {
        const placeholderToken = `${accountType}_token_placeholder_${Date.now()}`;
        
        setIsConnected(true);
        setSpotifyUser(result.user);
        
        localStorage.setItem(`${accountType}Connected`, 'true');
        localStorage.setItem(`${accountType}User`, JSON.stringify(result.user));
        localStorage.setItem(tokenKey, placeholderToken); // Store placeholder token
        
        onConnectionChange(true, result.user, placeholderToken);
        
        toast({
          title: `${accountType.charAt(0).toUpperCase() + accountType.slice(1)} Account Connected`,
          description: `Successfully connected as ${result.user.displayName}. (Using placeholder token)`,
          variant: 'default',
        });
      } else {
        throw new Error(result.error || `Failed to connect ${accountType} Spotify account.`);
      }
    } catch (error) {
      console.error(`Error connecting ${accountType} Spotify:`, error);
      setIsConnected(false);
      setSpotifyUser(null);
      localStorage.removeItem(`${accountType}Connected`);
      localStorage.removeItem(`${accountType}User`);
      localStorage.removeItem(tokenKey);
      onConnectionChange(false);
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
              <AvatarImage src={spotifyUser.imageUrl || undefined} alt={spotifyUser.displayName} data-ai-hint="user avatar" />
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
