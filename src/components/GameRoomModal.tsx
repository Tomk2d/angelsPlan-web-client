import React from 'react';
import styled from '@emotion/styled';

interface GameRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  playerCount: number;
  maxPlayers: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
}

const GameRoomModal: React.FC<GameRoomModalProps> = ({
  isOpen,
  onClose,
  roomId,
  roomName,
  playerCount,
  maxPlayers,
  status
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{roomName}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalBody>
          <RoomInfo>
            <InfoItem>
              <Label>방 번호</Label>
              <Value>{roomId}</Value>
            </InfoItem>
            <InfoItem>
              <Label>참가자</Label>
              <Value>{playerCount}/{maxPlayers}명</Value>
            </InfoItem>
            <InfoItem>
              <Label>상태</Label>
              <StatusBadge status={status}>
                {status === 'WAITING' ? '대기 중' : 
                 status === 'IN_PROGRESS' ? '게임 중' : '완료'}
              </StatusBadge>
            </InfoItem>
          </RoomInfo>
        </ModalBody>
        <ModalFooter>
          <ModalButton onClick={onClose}>
            나가기
          </ModalButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

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
  max-width: 500px;
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

const RoomInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  font-size: 1rem;
  color: #666;
`;

const Value = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: #1a1a1a;
`;

const StatusBadge = styled.span<{ status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  
  ${({ status }) => {
    switch (status) {
      case 'WAITING':
        return 'background-color: #fef3c7; color: #92400e;';
      case 'IN_PROGRESS':
        return 'background-color: #fee2e2; color: #991b1b;';
      default:
        return 'background-color: #f3f4f6; color: #374151;';
    }
  }}
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  background-color: #ef4444;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #dc2626;
  }
`;

export default GameRoomModal; 