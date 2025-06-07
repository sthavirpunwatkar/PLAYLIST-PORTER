'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { SpotifyPlaylist } from '@/types';
import { Users } from 'lucide-react';

interface PlaylistItemCardProps {
  playlist: SpotifyPlaylist;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
}

export default function PlaylistItemCard({ playlist, isSelected, onToggleSelection }: PlaylistItemCardProps) {
  const checkboxId = `playlist-${playlist.id}`;
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 rounded-lg overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 min-w-0">
             <Image
                src={playlist.imageUrl || "https://placehold.co/64x64.png"}
                alt={playlist.name}
                width={64}
                height={64}
                className="rounded-md aspect-square object-cover border"
                data-ai-hint={playlist.dataAiHint || "music album"}
              />
            <div className="min-w-0">
              <CardTitle className="text-base font-semibold font-headline truncate" title={playlist.name}>{playlist.name}</CardTitle>
              <CardDescription className="text-xs">
                {playlist.trackCount} songs
              </CardDescription>
            </div>
          </div>
          <Checkbox
            id={checkboxId}
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(playlist.id)}
            aria-label={`Select playlist ${playlist.name}`}
            className="shrink-0"
          />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 flex-grow">
        {playlist.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2 h-8">{playlist.description}</p>}
        <div className="flex items-center text-xs text-muted-foreground space-x-1 mt-auto pt-1 border-t border-border/60">
          <Users className="h-3 w-3 shrink-0" />
          <span className="truncate">Owned by {playlist.owner}</span>
        </div>
         <Label htmlFor={checkboxId} className="mt-2 block text-sm sr-only">
          Select {playlist.name}
        </Label>
      </CardContent>
    </Card>
  );
}
