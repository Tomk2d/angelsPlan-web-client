import { useEffect, useState } from 'react';
import { Game } from '../types/game';

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        console.log('게임 목록 요청 시작');
        const response = await fetch('http://localhost:8080/api/games/list', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('API 응답:', response);
        
        if (!response.ok) {
          throw new Error('게임 목록을 불러오는데 실패했습니다.');
        }
        
        const gameList = await response.json();
        console.log('받아온 게임 목록:', gameList);
        setGames(gameList);
      } catch (err) {
        console.error('게임 목록 로딩 에러:', err);
        setError(err instanceof Error ? err.message : '게임 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">게임 목록</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="relative h-48">
              <img
                src={game.thumbnailUrl}
                alt={game.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{game.name}</h2>
              <p className="text-gray-600 mb-4 line-clamp-3">{game.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">
                  참가자: {game.minPlayers}~{game.maxPlayers}명
                </span>
              </div>
              <button
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300"
                onClick={() => {
                  console.log('Selected game:', game.id);
                }}
              >
                게임 시작하기
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
} 