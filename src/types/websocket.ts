export interface TimeAuctionMessage {
  type: 'ROOM_CREATED' | 'PLAYER_JOINED' | 'PLAYER_LEFT' | 'ROOM_LIST';
  roomId?: string;
  roomName?: string;
  playerId: string;
  gameId?: string;
}

export interface TimeAuctionRoom {
  roomId: string;
  roomName: string;
  players: string[];
  gameId: number;
  currentPlayers: number;
  maxPlayers: number;
} 