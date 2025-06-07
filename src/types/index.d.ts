export interface SpotifyUser {
  id: string;
  displayName: string;
  imageUrl?: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  imageUrl?: string;
  dataAiHint?: string; 
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description?: string;
  owner: string;
  trackCount: number;
  imageUrl?: string;
  dataAiHint?: string;
  tracks?: SpotifyTrack[]; // Optional, if tracks are fetched
}
