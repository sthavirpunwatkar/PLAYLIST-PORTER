'use server';

/**
 * @fileOverview Analyzes the common genres between two Spotify accounts using AI.
 *
 * - analyzeCommonGenres - A function that handles the genre analysis process.
 * - AnalyzeCommonGenresInput - The input type for the analyzeCommonGenres function.
 * - AnalyzeCommonGenresOutput - The return type for the analyzeCommonGenres function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCommonGenresInputSchema = z.object({
  account1Playlists: z
    .array(z.string())
    .describe('List of playlists from the first Spotify account.'),
  account1LikedSongs: z
    .array(z.string())
    .describe('List of liked songs from the first Spotify account.'),
  account2Playlists: z
    .array(z.string())
    .describe('List of playlists from the second Spotify account.'),
  account2LikedSongs: z
    .array(z.string())
    .describe('List of liked songs from the second Spotify account.'),
});
export type AnalyzeCommonGenresInput = z.infer<typeof AnalyzeCommonGenresInputSchema>;

const AnalyzeCommonGenresOutputSchema = z.object({
  commonGenres: z
    .array(z.string())
    .describe('List of common genres between the two accounts.'),
  playlistCurationSuggestions: z
    .string()
    .describe('Suggestions for curating playlists based on common genres.'),
});
export type AnalyzeCommonGenresOutput = z.infer<typeof AnalyzeCommonGenresOutputSchema>;

export async function analyzeCommonGenres(
  input: AnalyzeCommonGenresInput
): Promise<AnalyzeCommonGenresOutput> {
  return analyzeCommonGenresFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCommonGenresPrompt',
  input: {schema: AnalyzeCommonGenresInputSchema},
  output: {schema: AnalyzeCommonGenresOutputSchema},
  prompt: `You are a playlist curation expert. You are provided with the playlist
  and liked song data from two different Spotify accounts. Analyze the data to
  determine the common musical genres liked by both accounts.

  Account 1 Playlists: {{account1Playlists}}
  Account 1 Liked Songs: {{account1LikedSongs}}
  Account 2 Playlists: {{account2Playlists}}
  Account 2 Liked Songs: {{account2LikedSongs}}

  Based on this analysis, suggest some ways to curate playlists based on the
  identified common genres.

  Output a JSON object containing:
  - A "commonGenres" field with a list of the common genres.
  - A "playlistCurationSuggestions" field with suggestions for how to create playlists based on those genres.
`,
});

const analyzeCommonGenresFlow = ai.defineFlow(
  {
    name: 'analyzeCommonGenresFlow',
    inputSchema: AnalyzeCommonGenresInputSchema,
    outputSchema: AnalyzeCommonGenresOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
