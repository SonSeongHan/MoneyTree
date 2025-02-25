import React, { createContext, useContext, useState } from 'react';

// Context 생성
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // 로그인된 유저 정보 (null이면 비로그인 상태)
  const [step, setStep] = useState(1); // 단계 상태 관리 (1단계 기본)

  const login = (userData) => {
    setUser(userData); // 로그인 시 유저 정보 업데이트
  };

  const logout = () => {
    setUser(null); // 로그아웃 시 유저 정보 초기화
    setStep(1); // 로그아웃 시 단계 초기화
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, step, setStep }}>
      {children}
    </AuthContext.Provider>
  );
};

// Context 훅 생성
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
