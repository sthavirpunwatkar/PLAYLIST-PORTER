'use server';
import { analyzeCommonGenres as genAIAnalyzeCommonGenres } from '@/ai/flows/genre-analysis';
import type { AnalyzeCommonGenresInput, AnalyzeCommonGenresOutput } from '@/ai/flows/genre-analysis';
import type { SpotifyPlaylist, SpotifyTrack, SpotifyUser } from '@/types';
import { MOCK_SPOTIFY_PLAYLISTS, MOCK_SPOTIFY_LIKED_SONGS } from './constants';

// Simulate API calls
const simulateApiCall = <T>(data: T, delay = 1000): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), delay));

export async function connectSpotifyAccount(
  accountType: 'source' | 'destination'
): Promise<{ success: boolean; user?: SpotifyUser; error?: string }> {
  // In a real app, this would involve OAuth redirection and token exchange.
  // We'll simulate a successful connection.
  console.log(`Simulating Spotify connection for ${accountType} account...`);
  await simulateApiCall(null, 500);
  const userName = accountType === 'source' ? 'SourceUser123' : 'DestUser456';
  const userId = accountType === 'source' ? 'source_user_id' : 'dest_user_id';
  const userImage = accountType === 'source' ? 'https://placehold.co/40x40.png' : 'https://placehold.co/40x40.png';
  return {
    success: true,
    user: { id: userId, displayName: userName, imageUrl: userImage },
  };
}

export async function fetchSourceAccountData(): Promise<{
  playlists: SpotifyPlaylist[];
  likedSongs: SpotifyTrack[];
}> {
  console.log('Simulating fetching source account data...');
  return simulateApiCall({
    playlists: MOCK_SPOTIFY_PLAYLISTS,
    likedSongs: MOCK_SPOTIFY_LIKED_SONGS,
  });
}

export async function copyDataToDestination(selections: {
  playlistIds: string[];
  songIds: string[];
}): Promise<{ success: boolean; error?: string; message?: string }> {
  console.log('Simulating copying data to destination account...', selections);
  await simulateApiCall(null, 2000);
  // Simulate some items failing
  if (Math.random() < 0.1 && selections.playlistIds.length > 0) {
    return { success: false, error: `Failed to copy playlist ID: ${selections.playlistIds[0]}. Please try again.` };
  }
  return { success: true, message: `Successfully copied ${selections.playlistIds.length} playlists and ${selections.songIds.length} liked songs.` };
}

export async function runGenreAnalysis(
  input: AnalyzeCommonGenresInput
): Promise<AnalyzeCommonGenresOutput | { error: string }> {
  console.log('Running genre analysis with AI...');
  
  try {
    // Ensure inputs are arrays of strings, even if empty
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
    return { error: "Failed to analyze genres. Please try again later." };
  }
}

// Placeholder for Firebase related actions
export async function saveSelectionToFirebase(userId: string, selections: { playlistIds: string[]; songIds: string[] }) {
  console.log(`Simulating saving selections for user ${userId} to Firebase...`, selections);
  await simulateApiCall(null, 500);
  return { success: true };
}
