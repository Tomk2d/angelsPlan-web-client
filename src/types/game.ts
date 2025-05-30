export type GameType = 'TIME_AUCTION';

export interface Game {
    id: number;
    name: string;
    description: string;
    minPlayers: number;
    maxPlayers: number;
    thumbnailUrl: string;
} 