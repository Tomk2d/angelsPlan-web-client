import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import { useAuth } from '../contexts/AuthContext';

interface GameCard {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const SAMPLE_GAMES: GameCard[] = [
  {
    id: 1,
    title: '숫자 맞추기',
    description: '1부터 100까지의 숫자 중 하나를 맞춰보세요!',
    difficulty: 'easy',
  },
  {
    id: 2,
    title: '단어 퍼즐',
    description: '주어진 글자로 단어를 만들어보세요!',
    difficulty: 'medium',
  },
  {
    id: 3,
    title: '메모리 게임',
    description: '카드를 뒤집어 짝을 맞춰보세요!',
    difficulty: 'hard',
  },
];

const MainBoard = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

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
          {SAMPLE_GAMES.map((game) => (
            <GameCardComponent key={game.id} game={game} />
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
    </PageContainer>
  );
};

const GameCardComponent: React.FC<{ game: GameCard }> = ({ game }) => {
  return (
    <Card difficulty={game.difficulty}>
      <CardContent>
        <CardTitle>{game.title}</CardTitle>
        <CardDescription>{game.description}</CardDescription>
        <DifficultyBadge difficulty={game.difficulty}>
          {game.difficulty}
        </DifficultyBadge>
      </CardContent>
    </Card>
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

const buttonStyles = `
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
`;

const LoginButton = styled.button`
  ${buttonStyles}
  background-color: #007AFF;
  color: white;
  border: none;

  &:hover {
    background-color: #0056b3;
  }
`;

const LogoutButton = styled.button`
  ${buttonStyles}
  background-color: #f1f3f5;
  color: #495057;
  border: 1px solid #dee2e6;

  &:hover {
    background-color: #e9ecef;
  }
`;

const Card = styled.div<{ difficulty: string }>`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;
  height: 200px;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
`;

const CardDescription = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.5;
  flex-grow: 1;
`;

const DifficultyBadge = styled.span<{ difficulty: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
  
  ${({ difficulty }) => {
    switch (difficulty) {
      case 'easy':
        return 'background-color: #e6f4ea; color: #1e7e34;';
      case 'medium':
        return 'background-color: #fff3e0; color: #f57c00;';
      case 'hard':
        return 'background-color: #fde7e7; color: #d32f2f;';
      default:
        return '';
    }
  }}
`;

export default MainBoard; 