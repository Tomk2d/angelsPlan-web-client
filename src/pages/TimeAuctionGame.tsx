import React, { useState, useEffect, ChangeEvent } from 'react';
import styled from 'styled-components';

interface Player {
  id: number;
  name: string;
  remainingTime: number;
  currentBet?: number;
  hasBet: boolean;
}

const TimeAuctionGame: React.FC = () => {
  const [remainingTime, setRemainingTime] = useState<number>(600); // 10분 = 600초
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [isRoundStarted, setIsRoundStarted] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(3);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [roundWinner, setRoundWinner] = useState<Player | null>(null);
  const [showRoundResult, setShowRoundResult] = useState<boolean>(false);
  const [myBet, setMyBet] = useState<number | null>(null);
  const [isBettingComplete, setIsBettingComplete] = useState<boolean>(false);
  const [hasBet, setHasBet] = useState<boolean>(false);
  const [isAllPlayersBetted, setIsAllPlayersBetted] = useState<boolean>(false);

  const [players, setPlayers] = useState<Player[]>([
    { id: 0, name: '나', remainingTime: 600, hasBet: false },
    { id: 1, name: '가상 유저 1', remainingTime: 600, hasBet: false },
    { id: 2, name: '가상 유저 2', remainingTime: 600, hasBet: false },
    { id: 3, name: '가상 유저 3', remainingTime: 600, hasBet: false },
  ]);

  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // 모든 플레이어의 베팅 완료 여부 확인
  useEffect(() => {
    const allBetted = players.every(player => player.hasBet);
    setIsAllPlayersBetted(allBetted);
    if (allBetted && timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }, [players]);

  const formatRemainingTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(4);
    return `${minutes}분 ${remainingSeconds}초`;
  };

  const handleStartGame = () => {
    setIsGameStarted(true);
    startRound();
  };

  const generateRandomBet = (maxTime: number): number => {
    // 1분(60초) 이하의 랜덤한 시간 생성
    const maxBetTime = Math.min(60, maxTime);
    const weights = [0.3, 0.3, 0.2, 0.15, 0.05]; // 20%, 40%, 60%, 80%, 100% 가중치
    const weight = weights[Math.floor(Math.random() * weights.length)];
    const betTime = Math.random() * (maxBetTime * weight - 0.1) + 0.1;
    return Math.min(betTime, 60); // 최대 60초로 제한
  };

  const startRound = () => {
    setIsWaiting(true);
    setIsRoundStarted(false);
    setTimer(0);
    setCountdown(3);
    setRoundWinner(null);
    setShowRoundResult(false);
    setMyBet(null);
    setIsBettingComplete(false);
    setHasBet(false);
    setIsAllPlayersBetted(false);

    // 가상 유저들의 베팅 상태 초기화
    setPlayers(prev => prev.map(player => ({
      ...player,
      currentBet: undefined,
      hasBet: false
    })));

    // 3초 대기
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsWaiting(false);
          setIsRoundStarted(true);
          startTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 10); // 10ms 단위로 증가
    }, 10);
    setTimerInterval(interval);
  };

  const simulateOtherPlayersBetting = () => {
    // 가상 유저들의 베팅 시뮬레이션
    const updatedPlayers = [...players];
    const bettingOrder = [1, 2, 3]; // 가상 유저들의 베팅 순서
    let currentIndex = 0;

    const simulateNextBet = () => {
      if (currentIndex >= bettingOrder.length) {
        // 모든 플레이어의 베팅이 완료되면 결과 표시
        determineRoundWinner();
        return;
      }

      const playerId = bettingOrder[currentIndex];
      const player = updatedPlayers[playerId];
      const betTime = generateRandomBet(player.remainingTime);
      
      // 베팅 시간 표시를 위한 딜레이
      setTimeout(() => {
        updatedPlayers[playerId] = {
          ...player,
          currentBet: betTime,
          hasBet: true,
          remainingTime: player.remainingTime - betTime
        };
        setPlayers([...updatedPlayers]);
        currentIndex++;
        simulateNextBet();
      }, 2000); // 2초 간격으로 베팅
    };

    simulateNextBet();
  };

  const determineRoundWinner = () => {
    // 모든 플레이어의 베팅이 있는지 확인
    const allPlayersBetted = players.every(player => player.currentBet !== undefined);
    if (!allPlayersBetted) return;

    // 가장 높은 베팅 시간을 가진 플레이어 찾기
    const winner = players.reduce((prev, current) => {
      if (!prev.currentBet || !current.currentBet) return prev;
      return prev.currentBet > current.currentBet ? prev : current;
    });

    setRoundWinner(winner);
    setShowRoundResult(true);

    // 3초 후 다음 라운드로 진행
    setTimeout(() => {
      if (currentRound < 10) {
        setCurrentRound(prev => prev + 1);
        startRound();
      } else {
        // 게임 종료
        setIsGameStarted(false);
      }
    }, 3000);
  };

  const handleStopTimer = () => {
    if (hasBet) return; // 이미 베팅했다면 무시

    const betTime = timer / 1000; // ms를 초로 변환
    if (betTime > remainingTime) {
      alert('베팅할 수 있는 시간이 부족합니다!');
      startRound(); // 라운드 재시작
      return;
    }

    // 내 베팅 시간 저장
    setMyBet(betTime);
    setRemainingTime(prev => prev - betTime);
    setHasBet(true);
    
    // 내 베팅 상태 업데이트
    setPlayers(prev => prev.map(player => 
      player.id === 0 
        ? { ...player, currentBet: betTime, hasBet: true, remainingTime: player.remainingTime - betTime }
        : player
    ));

    // 다른 플레이어들의 베팅 시뮬레이션 시작
    simulateOtherPlayersBetting();
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
  };

  return (
    <GameContainer>
      <GameHeader>
        <h1>시간 경매</h1>
        <GameInfo>
          <div>남은 시간: {formatRemainingTime(remainingTime)}</div>
          <div>현재 라운드: {currentRound}/10</div>
        </GameInfo>
      </GameHeader>

      {!isGameStarted ? (
        <StartButton onClick={handleStartGame}>게임 시작</StartButton>
      ) : (
        <GameContent>
          {isWaiting ? (
            <WaitingMessage>
              라운드 시작까지 <CountdownNumber>{countdown}</CountdownNumber>초
            </WaitingMessage>
          ) : showRoundResult ? (
            <RoundResult>
              <h2>{roundWinner?.name}님이 승리!</h2>
            </RoundResult>
          ) : (
            <>
              <TimerSection>
                <Timer>{formatTime(timer)}</Timer>
                <StopButton onClick={handleStopTimer} disabled={hasBet}>
                  {hasBet ? '베팅 완료' : '정지'}
                </StopButton>
              </TimerSection>
              {myBet !== null && (
                <MyBetDisplay>
                  내 베팅: {formatTime(myBet * 1000)}
                </MyBetDisplay>
              )}
            </>
          )}
        </GameContent>
      )}
    </GameContainer>
  );
};

const GameContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const GameHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const GameInfo = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
  font-size: 1.2rem;
`;

const StartButton = styled.button`
  display: block;
  margin: 2rem auto;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  
  &:hover {
    background-color: #45a049;
  }
`;

const GameContent = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const WaitingMessage = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CountdownNumber = styled.span`
  color: #f44336;
  font-size: 3rem;
`;

const TimerSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const Timer = styled.div`
  font-size: 4rem;
  font-weight: bold;
  font-family: monospace;
`;

const StopButton = styled.button<{ disabled: boolean }>`
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background-color: ${props => props.disabled ? '#ccc' : '#f44336'};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    background-color: ${props => props.disabled ? '#ccc' : '#d32f2f'};
  }
`;

const RoundResult = styled.div`
  text-align: center;
  font-size: 1.5rem;
  color: #2196F3;
  font-weight: bold;
`;

const MyBetDisplay = styled.div`
  font-size: 1.5rem;
  color: #4CAF50;
  font-weight: bold;
`;

export default TimeAuctionGame; 