'use client';

import { useState, useEffect } from 'react';
import PageTitle from '@/components/common/PageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { runGenreAnalysis } from '@/lib/actions';
import type { AnalyzeCommonGenresOutput } from '@/ai/flows/genre-analysis';
import { Sparkles, Lightbulb, ListChecks, AlertTriangle, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from '@/components/ui/textarea';

const genreAnalysisSchema = z.object({
  account1Data: z.string().min(1, "Please provide some music data (playlists or liked songs) for Account 1."),
  account2Data: z.string().min(1, "Please provide some music data (playlists or liked songs) for Account 2."),
});

type GenreAnalysisFormValues = z.infer<typeof genreAnalysisSchema>;

export default function GenreAnalysisPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeCommonGenresOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSourceConnected, setIsSourceConnected] = useState(false);
  const [isDestinationConnected, setIsDestinationConnected] = useState(false);
  const { toast } = useToast();

  const form = useForm<GenreAnalysisFormValues>({
    resolver: zodResolver(genreAnalysisSchema),
    defaultValues: {
      account1Data: "",
      account2Data: "",
    },
  });

  useEffect(() => {
    const sourceConnected = localStorage.getItem('sourceConnected') === 'true';
    const destinationConnected = localStorage.getItem('destinationConnected') === 'true';
    setIsSourceConnected(sourceConnected);
    setIsDestinationConnected(destinationConnected);

    if (!sourceConnected || !destinationConnected) {
      toast({
        title: "Accounts Not Connected",
        description: "Please connect both source and destination Spotify accounts on the home page to use genre analysis.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const onSubmit = async (values: GenreAnalysisFormValues) => {
    if (!isSourceConnected || !isDestinationConnected) {
      toast({
        title: "Accounts Not Connected",
        description: "Please ensure both Spotify accounts are connected via the home page.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    // For AI, we just pass the raw strings as examples of playlists/songs
    const inputForAI = {
      account1Playlists: [values.account1Data], // Simplified: treat all input as one "playlist description"
      account1LikedSongs: [],
      account2Playlists: [values.account2Data], // Simplified
      account2LikedSongs: [],
    };
    
    try {
      const result = await runGenreAnalysis(inputForAI);
      if ('error' in result) {
        setError(result.error);
        toast({ title: "Analysis Failed", description: result.error, variant: "destructive" });
      } else {
        setAnalysisResult(result);
        toast({ title: "Analysis Complete!", description: "Common genres and suggestions are ready." });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(errorMessage);
      toast({ title: "Analysis Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageTitle>Genre Analysis <Sparkles className="inline-block h-8 w-8 text-primary" /></PageTitle>
      <p className="text-muted-foreground max-w-3xl">
        Discover common musical tastes between two Spotify accounts. 
        For this demo, please manually enter comma-separated examples of playlists or liked songs from each account (e.g., "Pop Hits, Indie Anthems" or "SongA by ArtistX, SongB by ArtistY"). 
        In a full app, this data would be automatically fetched from your connected Spotify accounts.
      </p>

      {(!isSourceConnected || !isDestinationConnected) && (
         <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Accounts Not Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">
              Please connect both your source and destination Spotify accounts on the <a href="/" className="underline font-semibold hover:text-destructive/80">home page</a> to enable genre analysis.
            </p>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader><CardTitle className="font-headline text-lg">Account 1 (Source)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="account1Data"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Music Data (Playlists/Liked Songs)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Pop Hits, Indie Anthems, My Fav Rock Songs..." {...field} rows={4} />
                      </FormControl>
                      <FormDescription>Enter comma-separated playlist names or song titles.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader><CardTitle className="font-headline text-lg">Account 2 (Destination)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="account2Data"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Music Data (Playlists/Liked Songs)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Road Trip Jams, Focus Flow, Old School Classics..." {...field} rows={4} />
                      </FormControl>
                      <FormDescription>Enter comma-separated playlist names or song titles.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
          
          <Button type="submit" disabled={isLoading || !isSourceConnected || !isDestinationConnected} size="lg" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? <LoadingSpinner className="mr-2" /> : <Sparkles className="mr-2 h-5 w-5" />}
            Analyze Genres
          </Button>
        </form>
      </Form>

      {error && (
        <Card className="border-destructive bg-destructive/10 mt-8">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Analysis Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <Card className="mt-8 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center font-headline">
              <Music className="mr-3 h-7 w-7 text-primary" />
              Genre Analysis Results
            </CardTitle>
            <CardDescription>Here's what the AI found based on the provided music data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div>
              <h3 className="text-xl font-semibold flex items-center mb-2 font-headline">
                <ListChecks className="mr-2 h-5 w-5 text-primary" />
                Common Genres
              </h3>
              {analysisResult.commonGenres && analysisResult.commonGenres.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysisResult.commonGenres.map((genre, index) => (
                     <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                       {genre}
                     </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No distinct common genres found based on the input.</p>
              )}
            </div>
            <div className="pt-4 border-t">
              <h3 className="text-xl font-semibold flex items-center mb-2 font-headline">
                <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                Playlist Curation Suggestions
              </h3>
              <p className="text-foreground whitespace-pre-wrap leading-relaxed bg-secondary/20 p-4 rounded-md">
                {analysisResult.playlistCurationSuggestions || "No specific suggestions available."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
