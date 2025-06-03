import { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Stomp, CompatClient } from '@stomp/stompjs';

// SockJS를 위한 전역 객체 설정
declare global {
  var global: typeof globalThis;
}
globalThis.global = globalThis;

interface TimeAuctionRoom {
  roomId: string;
  roomName: string;
  playerIds: string[];
  maxPlayers: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
}

function TimeAuctionGame() {
  const [stompClient, setStompClient] = useState<CompatClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [rooms, setRooms] = useState<Record<string, TimeAuctionRoom>>({});
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [playerId] = useState('player_' + Math.random().toString(36).substr(2, 9));
  const [roomName, setRoomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiRooms, setApiRooms] = useState<TimeAuctionRoom[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  useEffect(() => {
    connect();
    fetchExistingRooms();
    return () => disconnect();
  }, []);

  // REST API로 기존 방 목록 가져오기
  const fetchExistingRooms = async () => {
    setIsLoadingRooms(true);
    try {
      console.log('🔍 기존 방 목록 조회 중...');
      const response = await fetch('/api/time-auction/rooms', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const roomList = await response.json();
      console.log('📋 기존 방 목록 조회 성공:', roomList);
      setApiRooms(roomList);
    } catch (error) {
      console.error('❌ 방 목록 조회 실패:', error);
      setApiRooms([]);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const connect = () => {
    console.log('SockJS WebSocket 연결 시도 중...');
    
    // SockJS를 사용한 연결 (서버 예시와 동일)
    const socket = new SockJS('/ws');
    const client = Stomp.over(socket);
    
    console.log('SockJS 연결 URL: /ws (프록시를 통해 localhost:8080으로 연결)');
    
    client.connect(
      { user: playerId },
      (frame: any) => {
        console.log('✅ SockJS WebSocket 연결 성공:', frame);
        setConnected(true);
        setStompClient(client);
        
        // 방 정보 구독
        client.subscribe('/topic/time-auction/rooms', (message) => {
          console.log('방 정보 수신:', message.body);
          const room = JSON.parse(message.body);
          updateRoom(room);
          // 실시간 업데이트 시 REST API 목록도 새로고침
          fetchExistingRooms();
        });

        // 현재 참가한 방의 게임 상태 구독
        if (currentRoomId) {
          client.subscribe(`/topic/time-auction/game/${currentRoomId}`, (message) => {
            const gameData = JSON.parse(message.body);
            console.log('게임 데이터:', gameData);
            // 게임 상태 업데이트 로직 추가
          });
        }
      },
      (error: any) => {
        console.error('❌ SockJS 연결 에러:', error);
        setConnected(false);
        // 재연결 시도
        setTimeout(() => {
          if (!connected) {
            console.log('🔄 5초 후 재연결 시도...');
            connect();
          }
        }, 5000);
      }
    );
  };

  const disconnect = () => {
    if (stompClient) {
      stompClient.disconnect();
      setConnected(false);
      setStompClient(null);
      console.log('🔌 SockJS 연결 해제됨');
    }
  };

  const createRoom = async () => {
    if (stompClient && roomName.trim()) {
      setIsLoading(true);
      try {
        stompClient.publish({
          destination: "/app/time-auction/create",
          body: JSON.stringify({
            roomName: roomName.trim(),
            playerId: playerId
          })
        });
        setRoomName('');
        // 방 생성 후 목록 새로고침
        setTimeout(() => fetchExistingRooms(), 1000);
      } catch (error) {
        console.error('방 생성 실패:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const joinRoom = async (roomId: string) => {
    if (stompClient) {
      setIsLoading(true);
      try {
        stompClient.publish({
          destination: "/app/time-auction/join",
          body: JSON.stringify({
            roomId: roomId,
            playerId: playerId
          })
        });
        // 방 참가 후 목록 새로고침
        setTimeout(() => fetchExistingRooms(), 1000);
      } catch (error) {
        console.error('방 참가 실패:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const joinApiRoom = async (roomId: string) => {
    await joinRoom(roomId);
  };

  const leaveRoom = async (roomId: string) => {
    if (stompClient) {
      setIsLoading(true);
      try {
        stompClient.publish({
          destination: "/app/time-auction/leave",
          body: JSON.stringify({
            roomId: roomId,
            playerId: playerId
          })
        });
        // 방 나가기 후 목록 새로고침
        setTimeout(() => fetchExistingRooms(), 1000);
      } catch (error) {
        console.error('방 나가기 실패:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const updateRoom = (room: TimeAuctionRoom) => {
    setRooms(prev => ({
      ...prev,
      [room.roomId]: room
    }));

    // 현재 참가 중인 방 확인
    if (room.playerIds.includes(playerId)) {
      setCurrentRoomId(room.roomId);
    } else if (currentRoomId === room.roomId) {
      setCurrentRoomId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      createRoom();
    }
  };

  const availableRooms = Object.values(rooms).filter(room => 
    room.status === 'WAITING' && room.playerIds.length < room.maxPlayers
  );

  return (
    <div className="time-auction-game p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-2">시간 경매 게임</h1>
        
        <div className="text-center mb-6 space-y-2">
          <div className="text-sm text-gray-600">
            플레이어 ID: <span className="font-mono font-semibold">{playerId}</span>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            connected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              connected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {connected ? '연결됨' : '연결 안됨'}
          </div>
        </div>

        {currentRoomId ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-blue-800">현재 참가 중인 방</h3>
                <p className="text-blue-600">
                  {rooms[currentRoomId]?.roomName} (ID: {currentRoomId})
                </p>
                <p className="text-sm text-blue-500">
                  참가자: {rooms[currentRoomId]?.playerIds.length}/{rooms[currentRoomId]?.maxPlayers}명
                </p>
              </div>
              <button
                onClick={() => leaveRoom(currentRoomId)}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                방 나가기
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 방 생성 섹션 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">새 게임방 만들기</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="게임방 이름을 입력하세요"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!connected || isLoading}
                />
                <button
                  onClick={createRoom}
                  disabled={!connected || !roomName.trim() || isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '생성 중...' : '방 만들기'}
                </button>
              </div>
            </div>

            {/* WebSocket 실시간 방 목록 */}
            <div>
              <h3 className="font-semibold mb-3">실시간 게임방 ({availableRooms.length}개)</h3>
              {availableRooms.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  실시간으로 업데이트되는 방이 없습니다.
                </div>
              ) : (
                <div className="grid gap-3 mb-6">
                  {availableRooms.map((room) => (
                    <div
                      key={room.roomId}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-lg">{room.roomName}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>참가자: {room.playerIds.length}/{room.maxPlayers}명</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              실시간 업데이트
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => joinRoom(room.roomId)}
                          disabled={isLoading}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                        >
                          {isLoading ? '참가 중...' : '참가하기'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* REST API 기존 방 목록 섹션 */}
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">기존 게임방 목록 ({apiRooms.length}개)</h3>
            <button
              onClick={fetchExistingRooms}
              disabled={isLoadingRooms}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 text-sm"
            >
              {isLoadingRooms ? '새로고침 중...' : '새로고침'}
            </button>
          </div>
          
          {isLoadingRooms ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">방 목록을 불러오는 중...</p>
            </div>
          ) : apiRooms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>기존 게임방이 없습니다.</p>
              <p className="text-sm">새로운 방을 만들어보세요!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {apiRooms.map((room) => (
                <div
                  key={room.roomId}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-blue-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-lg">{room.roomName}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>참가자: {room.playerIds.length}/{room.maxPlayers}명</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          room.status === 'WAITING' 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : room.status === 'IN_PROGRESS' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {room.status === 'WAITING' ? '대기 중' : 
                           room.status === 'IN_PROGRESS' ? '게임 중' : '완료'}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          API 조회
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => joinApiRoom(room.roomId)}
                      disabled={isLoading || room.status !== 'WAITING' || room.playerIds.length >= room.maxPlayers}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? '참가 중...' : 
                       room.status !== 'WAITING' ? '참가 불가' :
                       room.playerIds.length >= room.maxPlayers ? '정원 초과' : '참가하기'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TimeAuctionGame; 