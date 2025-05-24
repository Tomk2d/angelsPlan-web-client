import React, { useState } from 'react';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import '../styles/MainPage.css';

const MainPage: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const handleSignupClick = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const handleSignupSuccess = () => {
    setIsSignupModalOpen(false);
    alert('엔젤스 플랜 가입을 환영합니다.');
  };

  return (
    <div className="main-page">
      <div className="content-wrapper">
        <div className="logo">Angels Plan</div>
        <button 
          className="login-button"
          onClick={() => setIsLoginModalOpen(true)}
        >
          로그인
        </button>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSignupClick={handleSignupClick}
      />
      
      <SignupModal 
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSignupSuccess={handleSignupSuccess}
      />
    </div>
  );
};

export default MainPage; 