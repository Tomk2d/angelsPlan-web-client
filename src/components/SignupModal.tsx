import React, { useState, useEffect, useCallback } from 'react';
import '../styles/LoginModal.css';  // 같은 스타일을 공유합니다
import axios from 'axios';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupSuccess: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSignupSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const [isNicknameValid, setIsNicknameValid] = useState(false);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [emailDuplicateError, setEmailDuplicateError] = useState('');

  // 닉네임 중복 검사를 위한 디바운스 타이머
  const [nicknameDebounce, setNicknameDebounce] = useState<NodeJS.Timeout | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // 최소 8자, 최소 하나의 문자, 하나의 숫자, 하나의 특수문자
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateNickname = (nickname: string) => {
    // 2-10자, 한글/영문/숫자만 허용
    const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,10}$/;
    return nicknameRegex.test(nickname);
  };

  const checkNickname = async () => {
    if (!nickname) {
      setNicknameError('닉네임을 입력해주세요.');
      setIsNicknameValid(false);
      return;
    }

    if (!validateNickname(nickname)) {
      setNicknameError('닉네임은 2-10자의 한글, 영문, 숫자만 사용 가능합니다.');
      setIsNicknameValid(false);
      return;
    }

    setIsCheckingNickname(true);
    try {
      const response = await axios.get(`/api/users/check-nickname?nickname=${nickname}`);
      if (response.data.available) {
        setNicknameError('사용 가능한 닉네임입니다.');
        setIsNicknameValid(true);
        setNicknameChecked(true);
      } else {
        setNicknameError('이미 사용 중인 닉네임입니다.');
        setIsNicknameValid(false);
        setNicknameChecked(false);
      }
    } catch (err) {
      setNicknameError('닉네임 확인 중 오류가 발생했습니다.');
      setIsNicknameValid(false);
      setNicknameChecked(false);
    } finally {
      setIsCheckingNickname(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError('');
    setEmailDuplicateError('');
    setIsEmailValid(validateEmail(newEmail));
  };

  const handleEmailInput = (e: React.FormEvent<HTMLInputElement>) => {
    const newEmail = e.currentTarget.value;
    setEmail(newEmail);
    setEmailError('');
    setEmailDuplicateError('');
    setIsEmailValid(validateEmail(newEmail));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const isValid = validatePassword(newPassword);
    setIsPasswordValid(isValid);
    if (!isValid) {
      setPasswordError('비밀번호는 영문, 숫자, 특수문자를 포함한 8자 이상이어야 합니다.');
    } else {
      setPasswordError('');
    }
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNickname = e.target.value;
    setNickname(newNickname);
    setNicknameError('');
    setNicknameChecked(false);
    setIsNicknameValid(validateNickname(newNickname));
  };

  const handlePasswordInput = (e: React.FormEvent<HTMLInputElement>) => {
    const newPassword = e.currentTarget.value;
    setPassword(newPassword);
    const isValid = validatePassword(newPassword);
    setIsPasswordValid(isValid);
    if (!isValid) {
      setPasswordError('비밀번호는 영문, 숫자, 특수문자를 포함한 8자 이상이어야 합니다.');
    } else {
      setPasswordError('');
    }
  };

  const handleNicknameInput = (e: React.FormEvent<HTMLInputElement>) => {
    const newNickname = e.currentTarget.value;
    setNickname(newNickname);

    if (nicknameDebounce) {
      clearTimeout(nicknameDebounce);
    }

    const timer = setTimeout(() => {
      checkNickname();
    }, 300);

    setNicknameDebounce(timer);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailDuplicateError('');

    if (!isEmailValid) {
      setError('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    if (!isPasswordValid) {
      setError('올바른 비밀번호를 입력해주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!nicknameChecked || !isNicknameValid) {
      setError('닉네임 중복 확인이 필요합니다.');
      return;
    }

    try {
      const response = await axios.post('/api/users/signup', {
        email,
        password,
        nickname
      });

      console.log('회원가입 성공:', response.data);
      onSignupSuccess();
    } catch (err) {
      console.error('회원가입 실패:', err);
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        if (err.response.data.message.includes('이메일')) {
          setEmailDuplicateError(err.response.data.message);
        } else {
          setError(err.response.data.message);
        }
      } else {
        setError('회원가입에 실패했습니다.\n입력하신 정보를 다시 확인해주세요.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={handleEmailChange}
              onInput={handleEmailInput}
              className={
                email.length > 0 
                  ? (emailDuplicateError 
                    ? 'input-error' 
                    : (isEmailValid ? 'input-valid' : 'input-error'))
                  : ''
              }
              required
            />
            {emailError && <div className="field-error-message">{emailError}</div>}
            {emailDuplicateError && <div className="field-error-message">{emailDuplicateError}</div>}
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={handlePasswordChange}
              onInput={handlePasswordInput}
              className={password.length > 0 ? (isPasswordValid ? 'input-valid' : 'input-error') : ''}
              required
            />
            {passwordError && <div className="field-error-message">{passwordError}</div>}
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="confirm password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              onInput={(e) => setPasswordConfirm(e.currentTarget.value)}
              className={passwordConfirm && password === passwordConfirm ? 'input-valid' : (passwordConfirm ? 'input-error' : '')}
              required
            />
            {passwordConfirm && password !== passwordConfirm && 
              <div className="field-error-message">비밀번호가 일치하지 않습니다.</div>
            }
          </div>
          <div className="form-group nickname-group">
            <div className="nickname-input-wrapper">
              <input
                type="text"
                placeholder="nickname"
                value={nickname}
                onChange={handleNicknameChange}
                className={nickname.length > 0 ? (isNicknameValid ? 'input-valid' : 'input-error') : ''}
                required
              />
              <button 
                type="button" 
                className="check-nickname-button"
                onClick={checkNickname}
                disabled={isCheckingNickname || !nickname}
              >
                {isCheckingNickname ? '확인중...' : '중복확인'}
              </button>
            </div>
            {nicknameError && <div className={`field-${isNicknameValid ? 'success' : 'error'}-message`}>{nicknameError}</div>}
          </div>
          {error && <div className="error-message">{error.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < error.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}</div>}
          <button type="submit" className="login-button">회원가입</button>
        </form>
      </div>
    </div>
  );
};

export default SignupModal; 