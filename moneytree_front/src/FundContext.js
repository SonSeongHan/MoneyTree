import React, { createContext, useContext, useState } from 'react';

const FundContext = createContext();

export const FundProvider = ({ children }) => {
  //FundProvider 컴포넌트로 펀드 관련 상태를 전역에서 관리
  const [selectedFundId, setSelectedFundId] = useState(null);
  const [isChatbotRequest, setIsChatbotRequest] = useState(false);

  return (
    <FundContext.Provider
      value={{
        selectedFundId,
        setSelectedFundId,
        isChatbotRequest,
        setIsChatbotRequest,
      }}
    >
      {children}
    </FundContext.Provider>
  );
};

export const useFund = () => {
  const context = useContext(FundContext);
  if (!context) {
    throw new Error('useFund must be used within a FundProvider');
  }
  return context;
};
