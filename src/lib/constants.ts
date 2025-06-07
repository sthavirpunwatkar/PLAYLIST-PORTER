import type { SpotifyPlaylist, SpotifyTrack } from '@/types';

export const MOCK_SPOTIFY_PLAYLISTS: SpotifyPlaylist[] = [
  { id: 'p1', name: 'Chill Vibes', owner: 'User A', trackCount: 50, imageUrl: 'https://placehold.co/100x100.png', dataAiHint: 'abstract music' },
  { id: 'p2', name: 'Workout Hits', owner: 'User A', trackCount: 30, imageUrl: 'https://placehold.co/100x100.png', dataAiHint: 'gym fitness' },
  { id: 'p3', name: 'Road Trip Anthems', owner: 'User A', trackCount: 75, imageUrl: 'https://placehold.co/100x100.png', dataAiHint: 'car travel' },
  { id: 'p4', name: 'Focus Flow', owner: 'User A', trackCount: 20, imageUrl: 'https://placehold.co/100x100.png', dataAiHint: 'study work' },
];

export const MOCK_SPOTIFY_LIKED_SONGS: SpotifyTrack[] = [
  { id: 's1', name: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', imageUrl: 'https://placehold.co/60x60.png', dataAiHint: 'rock classic' },
  { id: 's2', name: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', imageUrl: 'https://placehold.co/60x60.png', dataAiHint: 'pop synthwave' },
  { id: 's3', name: 'Stairway to Heaven', artist: 'Led Zeppelin', album: 'Led Zeppelin IV', imageUrl: 'https://placehold.co/60x60.png', dataAiHint: 'rock epic' },
  { id: 's4', name: 'good 4 u', artist: 'Olivia Rodrigo', album: 'SOUR', imageUrl: 'https://placehold.co/60x60.png', dataAiHint: 'pop punk' },
  { id: 's5', name: 'Hotel California', artist: 'Eagles', album: 'Hotel California', imageUrl: 'https://placehold.co/60x60.png', dataAiHint: 'rock classic' },
];

export const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-library-read",
  "user-library-modify",
  "user-top-read", // For genre analysis potentially
].join(" ");
