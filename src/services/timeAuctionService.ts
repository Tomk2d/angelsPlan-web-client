import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/rest/time-auction';

export const timeAuctionService = {
  async getAllRooms() {
    const response = await axios.get(`${API_BASE_URL}/rooms`);
    return response.data;
  },

  async getActiveRooms() {
    const response = await axios.get(`${API_BASE_URL}/rooms/active`);
    return response.data;
  },

  async getRoomById(roomId: string) {
    const response = await axios.get(`${API_BASE_URL}/rooms/${roomId}`);
    return response.data;
  },

  async quickJoin(playerId: string) {
    try {
      const response = await axios.post(`${API_BASE_URL}/quick-join?playerId=${playerId}`);
      const room = response.data;
      console.log('방 참가 성공:', room);
      return room;
    } catch (error) {
      console.error('방 참가 실패:', error);
      throw error;
    }
  }
}; 