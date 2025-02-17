import React, { useState } from 'react';

const MyDepositDetail = ({ isOpen, onClose, account, productDetails }) => {
  const [activeTab, setActiveTab] = useState('summary');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateRemainingDays = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (!isOpen || !account || !productDetails) return null;

  return (
    <div className="modal-backdrop">
      <div className="deposit-detail-modal">
        <div className="deposit-detail-header">
          <h2 className="deposit-detail-title">
            {productDetails.depositProductName} 상세정보
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="deposit-detail-tabs">
          <div className="deposit-detail-tabs-list">
            <button
              className={`deposit-detail-tab ${activeTab === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              핵심정보
            </button>
            <button
              className={`deposit-detail-tab ${activeTab === 'interest' ? 'active' : ''}`}
              onClick={() => setActiveTab('interest')}
            >
              이자정보
            </button>
            <button
              className={`deposit-detail-tab ${activeTab === 'regular' ? 'active' : ''}`}
              onClick={() => setActiveTab('regular')}
            >
              정기납입
            </button>
            <button
              className={`deposit-detail-tab ${activeTab === 'maturity' ? 'active' : ''}`}
              onClick={() => setActiveTab('maturity')}
            >
              만기정보
            </button>
          </div>

          {activeTab === 'summary' && (
            <div className="deposit-summary-content">
              <div className="deposit-summary-card">
                <div className="deposit-summary-details">
                  <div className="deposit-summary-grid">
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">계좌번호</p>
                      <p className="deposit-info-value">{account.formattedAccountNumber}</p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">현재 예금액</p>
                      <p className="deposit-info-value deposit-amount">{account.depositAmount?.toLocaleString()}원</p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">은행명</p>
                      <p className="deposit-info-value">{productDetails.bankName}</p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">만기까지 남은 기간</p>
                      <p className="deposit-info-value remaining-days">{calculateRemainingDays(account.depositEndDate)}일</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interest' && (
            <div className="deposit-interest-content">
              <div className="deposit-interest-card">
                <div className="deposit-interest-details">
                  <div className="deposit-interest-grid">
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">이율 유형</p>
                      <p className="deposit-info-value interest-type">{productDetails.depositInterestRateType}</p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">기본 이자율</p>
                      <p className="deposit-info-value interest-rate">{productDetails.depositBaseInterestRate}%</p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">우대 이자율</p>
                      <p className="deposit-info-value prime-rate">{productDetails.depositPrimeInterestRate}%</p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">총 이자율</p>
                      <p className="deposit-info-value total-rate">
                        {(Number(productDetails.depositBaseInterestRate) +
                          Number(productDetails.depositPrimeInterestRate)).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'regular' && (
            <div className="deposit-regular-content">
              <div className="deposit-regular-card">
                <div className="deposit-regular-details">
                  {account.isRegularPayment ? (
                    <div className="deposit-regular-grid">
                      <div className="deposit-info-item">
                        <p className="deposit-info-label">정기 납입액</p>
                        <p className="deposit-info-value regular-amount">
                          {account.regularPaymentAmount?.toLocaleString()}원
                        </p>
                      </div>
                      <div className="deposit-info-item">
                        <p className="deposit-info-label">정기 납입일</p>
                        <p className="deposit-info-value payment-day">매월 {account.regularPaymentDay}일</p>
                      </div>
                      <div className="deposit-info-item">
                        <p className="deposit-info-label">마지막 납입일</p>
                        <p className="deposit-info-value last-payment">
                          {account.lastPaymentDate ? formatDate(account.lastPaymentDate) : '납입 이력 없음'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="deposit-no-regular-payment">정기 납입이 설정되지 않은 계좌입니다.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maturity' && (
            <div className="deposit-maturity-content">
              <div className="deposit-maturity-card">
                <div className="deposit-maturity-details">
                  <div className="deposit-maturity-grid">
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">가입일</p>
                      <p className="deposit-info-value start-date">{formatDate(account.depositStartDate)}</p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">만기일</p>
                      <p className="deposit-info-value end-date">{formatDate(account.depositEndDate)}</p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">만기 기간</p>
                      <p className="deposit-info-value maturity-period">{productDetails.depositMaturityPeriod}개월</p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">최소 가입금액</p>
                      <p className="deposit-info-value min-amount">
                        {productDetails.depositMinAmount?.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDepositDetail;