import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import GameRoomModal from '../components/GameRoomModal';
import { useAuth } from '../contexts/AuthContext';
import { Game } from '../types/game';
import { useNavigate } from 'react-router-dom';
import { timeAuctionService } from '../services/timeAuctionService';

const buttonStyles = `
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const MainBoard = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isGameRoomModalOpen, setIsGameRoomModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [currentRoom, setCurrentRoom] = useState<{
    roomId: string;
    roomName: string;
    playerCount: number;
    maxPlayers: number;
    status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
  } | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games/list', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('게임 목록을 불러오는데 실패했습니다.');
        }
        
        const gameList = await response.json();
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

  // 인증 상태 변화 로깅
  useEffect(() => {
    console.log('MainBoard 인증 상태:', { isAuthenticated, user });
  }, [isAuthenticated, user]);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleSignupClick = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const handleCloseSignupModal = () => {
    setIsSignupModalOpen(false);
  };

  const handleSignupSuccess = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  const handleGameClick = async (game: Game) => {
    setSelectedGame(game);
    setIsGameModalOpen(true);
  };

  const handleCloseGameModal = () => {
    setIsGameModalOpen(false);
    setSelectedGame(null);
  };

  const handleCreateRoom = async () => {
    if (!selectedGame) return;
    
    // TimeAuction 게임인 경우 게임 페이지로 이동
    if (selectedGame.id === 1 && selectedGame.name.includes('시간')) {
      navigate('/time-auction');
      handleCloseGameModal();
      return;
    }
    
    // 다른 게임들에 대한 방 생성 로직
    console.log('게임 방 생성:', selectedGame.name);
  };

  const handleQuickJoin = async () => {
    if (!selectedGame || !user) return;
    
    // TimeAuction 게임인 경우 빠른 참가 API 호출
    if (selectedGame.id === 1 && selectedGame.name.includes('시간')) {
      try {
        const room = await timeAuctionService.quickJoin(user.id.toString());
        console.log('방 참가 성공:', room);
        
        // 게임 모달 닫고 게임방 모달 열기
        setIsGameModalOpen(false);
        setCurrentRoom({
          roomId: room.roomId,
          roomName: room.roomName,
          playerCount: room.playerIds.length,
          maxPlayers: room.maxPlayers,
          status: room.status
        });
        setIsGameRoomModalOpen(true);
      } catch (error) {
        console.error('방 참가 실패:', error);
        alert('빠른 참가에 실패했습니다. 다시 시도해주세요.');
      }
      return;
    }
    
    // 다른 게임들에 대한 빠른 참가 로직
    console.log('빠른 참가:', selectedGame.name);
  };

  const handleCloseGameRoomModal = () => {
    setIsGameRoomModalOpen(false);
    setCurrentRoom(null);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-red-500">{error}</div>
        </div>
      </PageContainer>
    );
  }

  const isTimeAuctionGame = selectedGame?.id === 1 && selectedGame?.name.includes('시간');

  return (
    <PageContainer>
      <Header>
        <HeaderContent>
          <TitleSection>
            <Title>Angels Plan</Title>
            <SubTitle>다양한 미니게임을 즐겨보세요!</SubTitle>
          </TitleSection>
          <AuthSection>
            {isAuthenticated ? (
              <>
                <WelcomeText>환영합니다, {user?.nickname}님!</WelcomeText>
                <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
              </>
            ) : (
              <LoginButton onClick={handleLoginClick}>로그인</LoginButton>
            )}
          </AuthSection>
        </HeaderContent>
      </Header>
      <MainContent>
        <GameGrid>
          {games.map((game) => (
            <GameCardComponent 
              key={game.id} 
              game={game} 
              onClick={() => handleGameClick(game)}
            />
          ))}
        </GameGrid>
      </MainContent>
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onSignupClick={handleSignupClick}
      />
      <SignupModal 
        isOpen={isSignupModalOpen}
        onClose={handleCloseSignupModal}
        onSignupSuccess={handleSignupSuccess}
      />
      {selectedGame && (
        <GameModal
          isOpen={isGameModalOpen}
          onClose={handleCloseGameModal}
          game={selectedGame}
          onCreateRoom={handleCreateRoom}
          onQuickJoin={handleQuickJoin}
        />
      )}

      {currentRoom && (
        <GameRoomModal
          isOpen={isGameRoomModalOpen}
          onClose={handleCloseGameRoomModal}
          roomId={currentRoom.roomId}
          roomName={currentRoom.roomName}
          playerCount={currentRoom.playerCount}
          maxPlayers={currentRoom.maxPlayers}
          status={currentRoom.status}
        />
      )}
    </PageContainer>
  );
};

const GameCardComponent: React.FC<{ game: Game; onClick: () => void }> = ({ game, onClick }) => {
  const truncatedDescription = game.description.length > 100 
    ? `${game.description.slice(0, 100)}...` 
    : game.description;

  return (
    <Card onClick={onClick}>
      <CardImage src={game.thumbnailUrl} alt={game.name} />
      <CardContent>
        <CardTitle>{game.name}</CardTitle>
        <CardDescription>{truncatedDescription}</CardDescription>
        <PlayerCount>
          <HashTag>{game.minPlayers}~{game.maxPlayers}인</HashTag>
        </PlayerCount>
      </CardContent>
    </Card>
  );
};

const GameModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  game: Game;
  onCreateRoom: () => void;
  onQuickJoin: () => void;
}> = ({ 
  isOpen, 
  onClose, 
  game, 
  onCreateRoom, 
  onQuickJoin
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{game.name}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalBody>
          <GameImage src={game.thumbnailUrl} alt={game.name} />
          <GameDescription>{game.description}</GameDescription>
          <PlayerInfo>
            <HashTag>{game.minPlayers}~{game.maxPlayers}인</HashTag>
          </PlayerInfo>
        </ModalBody>
        <ModalFooter>
          <ModalButton onClick={onCreateRoom} primary>
            방 생성하기
          </ModalButton>
          <ModalButton onClick={onQuickJoin}>
            빠른 참가하기
          </ModalButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const Header = styled.header`
  background-color: white;
  padding: 1.5rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: -0.5px;
`;

const SubTitle = styled.p`
  font-size: 1.25rem;
  color: #666;
  margin: 0;
  letter-spacing: -0.3px;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 8rem 2rem 2rem;
`;

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const AuthSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const WelcomeText = styled.span`
  color: #1a1a1a;
  font-size: 1.1rem;
  font-weight: 500;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-bottom: 1px solid #eee;
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
`;

const CardDescription = styled.p`
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
`;

const PlayerCount = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
`;

const HashTag = styled.span`
  color: #3b82f6;
  font-size: 0.9rem;
  font-weight: 500;
  background-color: #eff6ff;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
`;

const LoginButton = styled.button`
  ${buttonStyles}
  background-color: #3b82f6;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }
`;

const LogoutButton = styled.button`
  ${buttonStyles}
  background-color: #ef4444;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #dc2626;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  
  &:hover {
    color: #1a1a1a;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const GameImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const GameDescription = styled.p`
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 1rem 0;
`;

const PlayerInfo = styled.div`
  margin-top: 1rem;
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const ModalButton = styled.button<{ primary?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${({ primary }) => primary ? `
    background-color: #3b82f6;
    color: white;
    
    &:hover {
      background-color: #2563eb;
    }
  ` : `
    background-color: #f3f4f6;
    color: #1a1a1a;
    
    &:hover {
      background-color: #e5e7eb;
    }
  `}
`;

export default MainBoard;