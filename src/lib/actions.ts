// src/lib/actions.ts
'use server';
import { analyzeCommonGenres as genAIAnalyzeCommonGenres } from '@/ai/flows/genre-analysis';
import type { AnalyzeCommonGenresInput, AnalyzeCommonGenresOutput } from '@/ai/flows/genre-analysis';
import type { SpotifyPlaylist, SpotifyTrack, SpotifyUser } from '@/types';
// MOCK_SPOTIFY_PLAYLISTS and MOCK_SPOTIFY_LIKED_SONGS are now primarily for fallback
// if Python service call fails or is not used for fetching.
import { MOCK_SPOTIFY_PLAYLISTS, MOCK_SPOTIFY_LIKED_SONGS } from './constants';

const PYTHON_PROXY_URL_BASE = '/api/python-proxy'; // Internal Next.js API route

// Helper to call the Python proxy
async function callPythonService<T>(endpoint: string, body: Record<string, any>): Promise<T | { error: string, details?: any, status?: number }> {
  try {
    const response = await fetch(`${PYTHON_PROXY_URL_BASE}`, { // Always POST to the proxy route
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // The actual target Python endpoint is specified in the body for the proxy to use
      body: JSON.stringify({ ...body, __python_endpoint: endpoint }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return { 
        error: responseData.message || responseData.error || `Python service error at ${endpoint}`,
        details: responseData.details,
        status: response.status 
      };
    }
    return responseData as T;
  } catch (error) {
    console.error(`Error calling Python service endpoint ${endpoint}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error connecting to Python service';
    return { error: `Network or parsing error when calling Python service for ${endpoint}.`, details: errorMessage };
  }
}


export async function connectSpotifyAccount(
  accountType: 'source' | 'destination'
): Promise<{ success: boolean; user?: SpotifyUser; error?: string }> {
  console.log(`Simulating Spotify connection for ${accountType} account...`);
  // In a real app, this would involve OAuth redirection and token exchange.
  // For now, we simulate success and store a placeholder token.
  // This placeholder token will signal the Python backend to use mock data or expect real tokens.
  const userName = accountType === 'source' ? 'SourceUser123' : 'DestUser456';
  const userId = accountType === 'source' ? 'source_user_id' : 'dest_user_id';
  const userImage = 'https://placehold.co/40x40.png';
  
  // Storing a placeholder access token in localStorage (client-side) after "connection"
  // This is a simplified approach. Real tokens would be obtained via OAuth and managed securely.
  // This part of the code runs on the server, so it can't directly set localStorage.
  // The client-side component (SpotifyConnectDisplay) will handle localStorage.
  // This function now primarily signals success.
  
  // The concept of passing a "token" starts here, even if it's a placeholder.
  // e.g., localStorage.setItem(`${accountType}AccessToken`, `${accountType}_token_placeholder`);

  return {
    success: true,
    user: { id: userId, displayName: userName, imageUrl: userImage },
  };
}

export async function fetchSourceAccountData(sourceToken?: string | null): Promise<{
  playlists: SpotifyPlaylist[];
  likedSongs: SpotifyTrack[];
  error?: string;
}> {
  console.log('Fetching source account data via Python service...');
  
  if (!sourceToken) {
    console.warn("No source token provided to fetchSourceAccountData. Using mock data.");
    return { playlists: MOCK_SPOTIFY_PLAYLISTS, likedSongs: MOCK_SPOTIFY_LIKED_SONGS, error: "No token, mock data returned by Next.js." };
  }

  const result = await callPythonService<{playlists: SpotifyPlaylist[], likedSongs: SpotifyTrack[]}>('/fetch-source-data', { source_token: sourceToken });

  if ('error' in result) {
    console.error("Error fetching source data from Python:", result.error, result.details);
    // Fallback to mock data if Python service fails
    return { playlists: MOCK_SPOTIFY_PLAYLISTS, likedSongs: MOCK_SPOTIFY_LIKED_SONGS, error: result.error };
  }
  return result;
}

export async function copyDataToDestination(selections: {
  playlistIds: string[];
  songIds: string[];
}, sourceToken?: string | null, destinationToken?: string | null): Promise<{ success: boolean; error?: string; message?: string }> {
  console.log('Copying data to destination account via Python service...', selections);

  if (!sourceToken || !destinationToken) {
    return { success: false, error: "Missing source or destination token. Cannot proceed with copy operation via Python." };
  }

  const result = await callPythonService<{success: boolean; message?: string; error?: string}>('/copy-items', {
    source_token: sourceToken,
    destination_token: destinationToken,
    playlist_ids: selections.playlistIds,
    song_ids: selections.songIds,
  });

  if ('error' in result || !result.success) {
     return { success: false, error: result.error || "Unknown error during copy operation in Python service." };
  }
  
  return { success: result.success, message: result.message };
}


export async function runGenreAnalysis(
  input: AnalyzeCommonGenresInput
): Promise<AnalyzeCommonGenresOutput | { error: string }> {
  console.log('Running genre analysis with AI...');
  
  try {
    const validatedInput: AnalyzeCommonGenresInput = {
      account1Playlists: Array.isArray(input.account1Playlists) ? input.account1Playlists : [],
      account1LikedSongs: Array.isArray(input.account1LikedSongs) ? input.account1LikedSongs : [],
      account2Playlists: Array.isArray(input.account2Playlists) ? input.account2Playlists : [],
      account2LikedSongs: Array.isArray(input.account2LikedSongs) ? input.account2LikedSongs : [],
    };
    const result = await genAIAnalyzeCommonGenres(validatedInput);
    return result;
  } catch (error) {
    console.error("Error in AI genre analysis:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { error: `Failed to analyze genres: ${errorMessage}. Please try again later.` };
  }
}

// Placeholder for Firebase related actions
export async function saveSelectionToFirebase(userId: string, selections: { playlistIds: string[]; songIds: string[] }) {
  console.log(`Simulating saving selections for user ${userId} to Firebase...`, selections);
  // await simulateApiCall(null, 500);
  return { success: true };
}

