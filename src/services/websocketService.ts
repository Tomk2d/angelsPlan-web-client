import { Client, IMessage, IFrame } from '@stomp/stompjs';
import { TimeAuctionMessage, TimeAuctionRoom } from '../types/websocket';

class WebSocketService {
  private client: Client | null = null;
  private rooms: TimeAuctionRoom[] = [];
  private onRoomsUpdate: ((rooms: TimeAuctionRoom[]) => void) | null = null;
  private static instance: WebSocketService;

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect() {
    if (!this.client) {
      this.client = new Client({
        brokerURL: 'ws://localhost:8080/ws',
        connectHeaders: {
          login: 'guest',
          passcode: 'guest',
        },
        debug: (str: string) => {
          console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = () => {
        console.log('WebSocket 연결됨');
        this.subscribeToRooms();
      };

      this.client.onStompError = (frame: IFrame) => {
        console.error('STOMP 에러:', frame);
      };

      this.client.activate();
    }
  }

  private subscribeToRooms() {
    if (!this.client?.connected) return;

    this.client.subscribe('/topic/game/rooms', (message: IMessage) => {
      const data = JSON.parse(message.body);
      if (Array.isArray(data)) {
        this.rooms = data;
        this.onRoomsUpdate?.(data);
      }
    });
  }

  subscribeToRoom(roomId: string, callback: (message: TimeAuctionMessage) => void) {
    if (!this.client?.connected) return;

    this.client.subscribe(`/topic/game/${roomId}`, (message: IMessage) => {
      const data = JSON.parse(message.body);
      callback(data);
    });
  }

  createRoom(gameId: number): Promise<{ roomId: string }> {
    return new Promise((resolve, reject) => {
      if (!this.client?.connected) {
        reject(new Error('WebSocket이 연결되지 않았습니다.'));
        return;
      }

      const message: TimeAuctionMessage = {
        type: 'ROOM_CREATED',
        gameId: gameId.toString(),
        playerId: '1', // TODO: 실제 사용자 ID로 변경
      };

      this.client.publish({
        destination: '/app/timeAuction/create',
        body: JSON.stringify(message),
      });

      // 응답을 기다리는 구독
      const subscription = this.client.subscribe('/topic/game/rooms', (response: IMessage) => {
        const data = JSON.parse(response.body);
        if (data.type === 'ROOM_CREATED' && data.gameId === gameId.toString()) {
          subscription.unsubscribe();
          resolve({ roomId: data.roomId });
        }
      });
    });
  }

  joinRoom(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client?.connected) {
        reject(new Error('WebSocket이 연결되지 않았습니다.'));
        return;
      }

      const message: TimeAuctionMessage = {
        type: 'PLAYER_JOINED',
        roomId,
        playerId: '1', // TODO: 실제 사용자 ID로 변경
      };

      this.client.publish({
        destination: `/app/timeAuction/join/${roomId}`,
        body: JSON.stringify(message),
      });

      // 응답을 기다리는 구독
      const subscription = this.client.subscribe(`/topic/game/${roomId}`, (response: IMessage) => {
        const data = JSON.parse(response.body);
        if (data.type === 'PLAYER_JOINED') {
          subscription.unsubscribe();
          resolve();
        }
      });
    });
  }

  quickJoin(gameId: number): Promise<{ roomId: string }> {
    return new Promise((resolve, reject) => {
      if (!this.client?.connected) {
        reject(new Error('WebSocket이 연결되지 않았습니다.'));
        return;
      }

      // TODO: 빠른 참가 로직 구현
      // 현재는 첫 번째 방에 참가하는 것으로 구현
      this.client.publish({
        destination: '/app/timeAuction/rooms',
        body: JSON.stringify({ type: 'ROOM_LIST' }),
      });

      const subscription = this.client.subscribe('/topic/game/rooms', (response: IMessage) => {
        const data = JSON.parse(response.body);
        if (data.type === 'ROOM_LIST' && Array.isArray(data.rooms)) {
          const availableRoom = data.rooms.find((room: TimeAuctionRoom) => 
            room.gameId === gameId && room.currentPlayers < room.maxPlayers
          );

          if (availableRoom) {
            subscription.unsubscribe();
            this.joinRoom(availableRoom.roomId)
              .then(() => resolve({ roomId: availableRoom.roomId }))
              .catch(reject);
          } else {
            // 사용 가능한 방이 없으면 새 방 생성
            subscription.unsubscribe();
            this.createRoom(gameId)
              .then(resolve)
              .catch(reject);
          }
        }
      });
    });
  }

  leaveRoom(roomId: string) {
    if (!this.client?.connected) return;

    const message: TimeAuctionMessage = {
      type: 'PLAYER_LEFT',
      roomId,
      playerId: '1', // TODO: 실제 사용자 ID로 변경
    };

    this.client.publish({
      destination: `/app/timeAuction/leave/${roomId}`,
      body: JSON.stringify(message),
    });
  }

  getRooms() {
    if (!this.client?.connected) return;

    this.client.publish({
      destination: '/app/timeAuction/rooms',
      body: JSON.stringify({ type: 'ROOM_LIST' }),
    });
  }

  setOnRoomsUpdate(callback: (rooms: TimeAuctionRoom[]) => void) {
    this.onRoomsUpdate = callback;
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }
}

export default WebSocketService; 