import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  nickname: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: { id: number; email: string; nickname: string; token: string }) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // 컴포넌트 마운트 시 localStorage에서 인증 정보 복원
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = (userData: { id: number; email: string; nickname: string; token: string }) => {
    const { token: newToken, ...userInfo } = userData;
    
    // localStorage 업데이트
    localStorage.setItem('user', JSON.stringify(userInfo));
    localStorage.setItem('token', newToken);

    // 상태 업데이트
    setUser(userInfo);
    setToken(newToken);

    console.log('로그인 완료:', { user: userInfo, token: newToken }); // 상태 업데이트 확인
  };

  const logout = () => {
    // localStorage에서 인증 정보 제거
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // 상태 업데이트
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token
  };

  console.log('AuthContext 현재 상태:', value); // 컨텍스트 상태 확인

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// axios 인터셉터를 위한 헬퍼 함수
export const getAuthToken = () => {
  return localStorage.getItem('token');
}; 