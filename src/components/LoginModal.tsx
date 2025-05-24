import React, { useState } from 'react';
import axios from 'axios';
import '../styles/LoginModal.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupClick: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSignupClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/api/users/login', {
        email,
        password
      });

      console.log('로그인 성공:', response.data);
      onClose();
    } catch (err) {
      console.error('로그인 실패:', err);
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>로그인</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < error.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}</div>}
          <button type="submit" className="login-button">로그인</button>
        </form>
        <div className="signup-section">
          <p>계정이 없으신가요?</p>
          <button className="signup-button" onClick={onSignupClick}>회원가입</button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal; 