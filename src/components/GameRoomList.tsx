import React, { useEffect, useState } from 'react';
import { TimeAuctionRoom } from '../types/websocket';
import WebSocketService from '../services/websocketService';

interface GameRoomListProps {
  playerId: string;
}

export const GameRoomList: React.FC<GameRoomListProps> = ({ playerId }) => {
  const [rooms, setRooms] = useState<TimeAuctionRoom[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const websocketService = WebSocketService.getInstance();

  useEffect(() => {
    websocketService.connect();
    websocketService.setOnRoomsUpdate(setRooms);
    websocketService.getRooms();

    return () => {
      websocketService.disconnect();
    };
  }, []);

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      websocketService.createRoom(1); // TODO: 실제 게임 ID로 변경
      setNewRoomName('');
    }
  };

  const handleJoinRoom = (roomId: string) => {
    websocketService.joinRoom(roomId);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          placeholder="새로운 게임룸 이름"
          className="border p-2 mr-2"
        />
        <button
          onClick={handleCreateRoom}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          게임룸 생성
        </button>
      </div>

      <div className="grid gap-4">
        {rooms.map((room) => (
          <div
            key={room.roomId}
            className="border p-4 rounded flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold">{room.roomName}</h3>
              <p>참가자 수: {room.players.length}</p>
            </div>
            <button
              onClick={() => handleJoinRoom(room.roomId)}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              참가하기
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}; 