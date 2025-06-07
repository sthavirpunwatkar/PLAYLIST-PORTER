'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { SpotifyTrack } from '@/types';
import { Disc3, Mic2 } from 'lucide-react';

interface SongItemCardProps {
  song: SpotifyTrack;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
}

export default function SongItemCard({ song, isSelected, onToggleSelection }: SongItemCardProps) {
  const checkboxId = `song-${song.id}`;
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 rounded-lg overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-center justify-between space-x-3">
          <div className="flex items-center space-x-3 min-w-0">
            <Image
              src={song.imageUrl || "https://placehold.co/48x48.png"}
              alt={song.name}
              width={48}
              height={48}
              className="rounded-md aspect-square object-cover border"
              data-ai-hint={song.dataAiHint || "music track"}
            />
            <div className="min-w-0 flex-grow">
              <p className="text-sm font-semibold truncate font-headline" title={song.name}>{song.name}</p>
              <div className="text-xs text-muted-foreground flex items-center space-x-1 truncate">
                <Mic2 className="h-3 w-3 shrink-0" />
                <span className="truncate" title={song.artist}>{song.artist}</span>
              </div>
              <div className="text-xs text-muted-foreground flex items-center space-x-1 truncate">
                <Disc3 className="h-3 w-3 shrink-0" />
                <span className="truncate" title={song.album}>{song.album}</span>
              </div>
            </div>
          </div>
          <Checkbox
            id={checkboxId}
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(song.id)}
            aria-label={`Select song ${song.name}`}
            className="shrink-0"
          />
        </div>
        <Label htmlFor={checkboxId} className="mt-2 block text-sm sr-only">
          Select {song.name} by {song.artist}
        </Label>
      </CardContent>
    </Card>
  );
}
