import React, { useState, useEffect } from 'react';
import { getCookie } from '../util/cookieUtil';
import FundAPI from '../api/FundAPI';
import '../css/FundTradeModal.css';

const FundTradeModal = ({ isOpen, onClose, fundProduct }) => {
  // 상태 관리
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [dandwAcId, setDandwAcId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEligibleForRedemption, setIsEligibleForRedemption] = useState(false);
  const [currentInvestment, setCurrentInvestment] = useState(null);
  const [redemptionDate, setRedemptionDate] = useState(null);

  // 계좌 정보 불러오기
  const fetchAccountInfo = async () => {
    try {
      setLoading(true);
      const memberCookie = getCookie('member');
      if (!memberCookie) {
        throw new Error('로그인이 필요합니다.');
      }

      // 입출금 계좌 ID 가져오기
      const accountNumber = await FundAPI.getDandwacAccountNumber(memberCookie.memberId);
      if (!accountNumber) {
        throw new Error('입출금 계좌를 찾을 수 없습니다.');
      }
      setDandwAcId(accountNumber);

      // 해당 입출금 계좌의 펀드 계좌 정보 조회
      const fundAccounts = await FundAPI.getFundAccount(accountNumber);

      // 현재 선택된 펀드 상품에 해당하는 계좌 찾기
      const matchingAccount = fundAccounts.find(account =>
        account.fundProductId === fundProduct.fundProductId
      );

      if (matchingAccount) {
        setCurrentInvestment({
          accountNumber: matchingAccount.fundAccountNumber,
          amount: matchingAccount.fundInvestmentAmount,
          investmentDate: matchingAccount.fundInvestmentDate,
          maturityDate: matchingAccount.fundMaturityDate,
          status: matchingAccount.fundStatus
        });

        // 환매 가능 여부 확인
        const eligibility = await FundAPI.checkRedemptionEligibility(matchingAccount.fundAccountNumber);
        setIsEligibleForRedemption(eligibility);

        // 환매 가능 날짜 계산
        if (matchingAccount.fundInvestmentDate) {
          const investmentDate = new Date(matchingAccount.fundInvestmentDate);
          const maturityDate = new Date(matchingAccount.fundMaturityDate);
          const totalDays = Math.floor((maturityDate - investmentDate) / (1000 * 60 * 60 * 24));
          const redemptionPossibleDate = new Date(investmentDate);
          redemptionPossibleDate.setDate(redemptionPossibleDate.getDate() + Math.floor(totalDays / 2));
          setRedemptionDate(redemptionPossibleDate);
        }
      } else {
        // 해당 펀드에 투자하지 않은 경우 초기화
        setCurrentInvestment(null);
        setIsEligibleForRedemption(false);
        setRedemptionDate(null);
      }
    } catch (err) {
      console.error('Error fetching account info:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && fundProduct) {
      fetchAccountInfo();
      setInvestmentAmount(0); // 모달이 열릴 때마다 투자금액 초기화
    }
  }, [isOpen, fundProduct]);

  // 투자금액 변경 핸들러
  const handleAmountChange = (e) => {
    const value = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
    setInvestmentAmount(isNaN(value) ? 0 : value);
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    setInvestmentAmount(0);
    setError(null);
    setCurrentInvestment(null);
    onClose();
  };

  // 가입/환매 핸들러
  const handleTrade = async (type) => {
    if (!dandwAcId) {
      alert('입출금 계좌 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      if (type === 'invest') {
        await FundAPI.investInFund(
          dandwAcId,
          fundProduct.fundProductId,
          investmentAmount
        );
        alert('펀드 가입이 완료되었습니다.');
      } else {
        if (!currentInvestment) {
          alert('해당 펀드에 대한 투자 정보를 찾을 수 없습니다.');
          return;
        }
        await FundAPI.redeemFund(
          currentInvestment.accountNumber,
          investmentAmount
        );
        alert('환매 신청이 완료되었습니다.');
      }

      await fetchAccountInfo();
    } catch (err) {
      alert(err.response?.data?.message || '거래 중 오류가 발생했습니다.');
    }
  };

  const getRedemptionTooltip = () => {
    if (!currentInvestment) return '가입된 펀드가 아닙니다';
    if (!redemptionDate) return '환매 정보를 불러올 수 없습니다';

    const today = new Date();
    if (today >= redemptionDate) return '현재 환매 가능합니다';

    const remainingDays = Math.ceil((redemptionDate - today) / (1000 * 60 * 60 * 24));
    return `${remainingDays}일 후 환매 가능합니다`;
  };

  if (!isOpen) return null;

  if (loading) return (
    <div className="fund-trade-modal-overlay">
      <div className="fund-trade-modal-loading">
        <p>로딩 중...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="fund-trade-modal-overlay">
      <div className="fund-trade-modal-error">
        <p className="fund-trade-modal-error-message">{error}</p>
        <button onClick={handleClose} className="fund-trade-modal-close-btn">
          닫기
        </button>
      </div>
    </div>
  );

  return (
    <div className="fund-trade-modal-overlay">
      <div className="fund-trade-modal-container">
        {/* 헤더 섹션 */}
        <div className="fund-trade-modal-header">
          <div>
            <h2 className="fund-trade-modal-title">
              {fundProduct.fundProductName}
              {currentInvestment && <span className="fund-trade-modal-invested-badge">가입중</span>}
            </h2>
            <p className="fund-trade-modal-manager">{fundProduct.fundProductManager}</p>
          </div>
          <button
            onClick={handleClose}
            className="fund-trade-modal-close-btn"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 계좌 정보 섹션 - 가입한 경우에만 표시 */}
        {currentInvestment && (
          <div className="fund-trade-modal-account-section">
            <div className="fund-trade-modal-account-row">
              <span className="fund-trade-modal-account-label">계좌번호</span>
              <span className="fund-trade-modal-account-value">
                {currentInvestment.accountNumber}
              </span>
            </div>
            <div className="fund-trade-modal-account-row">
              <span className="fund-trade-modal-account-label">투자금액</span>
              <span className="fund-trade-modal-account-value">
                {currentInvestment.amount?.toLocaleString()}원
              </span>
            </div>
            {currentInvestment.status === '운용중' && (
              <div className="fund-trade-modal-account-row">
                <span className="fund-trade-modal-account-label">투자일</span>
                <span className="fund-trade-modal-account-value">
                  {new Date(currentInvestment.investmentDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 투자금액 입력 섹션 */}
        <div className="fund-trade-modal-amount-section">
          <p className="fund-trade-modal-amount-label">투자금액</p>
          <input
            type="text"
            className="fund-trade-modal-amount-input"
            value={investmentAmount.toLocaleString()}
            onChange={handleAmountChange}
            placeholder="투자금액을 입력하세요"
          />
          <p className="fund-trade-modal-amount-unit">원</p>
        </div>

        {/* 가입/환매 버튼 섹션 */}
        <div className="fund-trade-modal-actions">
          <button
            className="fund-trade-modal-invest-btn"
            onClick={() => handleTrade('invest')}
            disabled={investmentAmount <= 0 || currentInvestment !== null}
          >
            {currentInvestment ? '가입완료' : '가입하기'}
          </button>
          <button
            className="fund-trade-modal-redeem-btn"
            onClick={() => handleTrade('redeem')}
            disabled={!isEligibleForRedemption || investmentAmount <= 0 || !currentInvestment}
            title={getRedemptionTooltip()}
          >
            환매하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default FundTradeModal;