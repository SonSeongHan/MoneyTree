import React, { useState, useEffect } from 'react';
import FundAPI from '../../api/FundAPI';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../../css/recommends/MyFundDetail.css';

const MyFundDetail = ({ isOpen, onClose, account, productDetails }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [expectedProfit, setExpectedProfit] = useState(0);
  const [redemptionAmount, setRedemptionAmount] = useState(0);
  const [remainingDays, setRemainingDays] = useState(0);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isEligibleForRedemption, setIsEligibleForRedemption] = useState(false);
  const [redemptionDate, setRedemptionDate] = useState(null);

  useEffect(() => {
    if (account) {
      // 예상 수익금 조회
      const fetchExpectedProfit = async () => {
        try {
          const profit = await FundAPI.calculateExpectedProfit(account.fundAccountNumber);
          setExpectedProfit(profit);
        } catch (error) {
          console.error('Error fetching expected profit:', error);
        }
      };

      // 환매 가능 금액 조회
      const fetchRedemptionAmount = async () => {
        try {
          const amount = await FundAPI.calculateRedemptionAmount(
            account.fundAccountNumber,
            account.fundInvestmentAmount
          );
          setRedemptionAmount(amount);
        } catch (error) {
          console.error('Error fetching redemption amount:', error);
        }
      };

      // 만기까지 남은 일수 조회
      const fetchRemainingDays = async () => {
        try {
          const days = await FundAPI.getRemainingDays(account.fundAccountNumber);
          setRemainingDays(days);
        } catch (error) {
          console.error('Error fetching remaining days:', error);
        }
      };

      // 환매 가능 여부 확인
      const checkRedemption = async () => {
        try {
          const eligibility = await FundAPI.checkRedemptionEligibility(account.fundAccountNumber);
          setIsEligibleForRedemption(eligibility);

          // 환매 가능 날짜 계산
          if (account.fundInvestmentDate) {
            const investmentDate = new Date(account.fundInvestmentDate);
            const maturityDate = new Date(account.fundMaturityDate);
            const totalDays = Math.floor((maturityDate - investmentDate) / (1000 * 60 * 60 * 24));
            const redemptionPossibleDate = new Date(investmentDate);
            redemptionPossibleDate.setDate(redemptionPossibleDate.getDate() + Math.floor(totalDays / 2));
            setRedemptionDate(redemptionPossibleDate);
          }
        } catch (error) {
          console.error('Error checking redemption eligibility:', error);
        }
      };

      fetchExpectedProfit();
      fetchRedemptionAmount();
      fetchRemainingDays();
      checkRedemption();
    }
  }, [account]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 환매 처리
  const handleRedeem = async () => {
    if (window.confirm('이 펀드를 환매하시겠습니까? 중도환매 시 수수료가 발생할 수 있습니다.')) {
      try {
        setIsRedeeming(true);
        await FundAPI.redeemFund(account.fundAccountNumber, account.fundInvestmentAmount);
        alert('펀드가 성공적으로 환매되었습니다.');
        onClose();
        window.location.reload();
      } catch (error) {
        alert('펀드 환매 중 오류가 발생했습니다: ' + error.message);
      } finally {
        setIsRedeeming(false);
      }
    }
  };

  // 수익률 시뮬레이션 데이터 생성
  const generateSimulationData = () => {
    const initialAmount = account.fundInvestmentAmount;
    const monthlyData = [];
    const months = remainingDays / 30;

    for (let i = 0; i <= months; i++) {
      const randomFluctuation = 1 + (Math.random() * 0.1 - 0.05); // -5% to +5%
      const estimatedAmount = initialAmount * Math.pow(randomFluctuation, i);
      const profit = estimatedAmount - initialAmount;

      monthlyData.push({
        month: i === 0 ? '시작' : `${i}개월`,
        estimatedAmount: Math.round(estimatedAmount),
        profit: Math.round(profit),
        allFee: Math.round(estimatedAmount * (productDetails.fundProductManagementFee / 100) + estimatedAmount * (productDetails.fundProductRedemptionFee / 100))
      });
    }

    return monthlyData;
  };

  const getRedemptionTooltip = () => {
    if (!redemptionDate) return '환매 정보를 불러올 수 없습니다';

    const today = new Date();
    if (today >= redemptionDate) return '현재 환매 가능합니다';

    const remainingDays = Math.ceil((redemptionDate - today) / (1000 * 60 * 60 * 24));
    return `${remainingDays}일 후 환매 가능합니다`;
  };

  if (!isOpen || !account || !productDetails) return null;

  return (
    <div className="modal-backdrop">
      <div className="deposit-detail-modal">
        <div className="deposit-detail-header">
          <h2 className="deposit-detail-title">
            {productDetails.fundProductName} 상세정보
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
              className={`deposit-detail-tab ${activeTab === 'fees' ? 'active' : ''}`}
              onClick={() => setActiveTab('fees')}
            >
              수수료정보
            </button>
            <button
              className={`deposit-detail-tab ${activeTab === 'investment' ? 'active' : ''}`}
              onClick={() => setActiveTab('investment')}
            >
              투자정보
            </button>
            <button
              className={`deposit-detail-tab ${activeTab === 'simulation' ? 'active' : ''}`}
              onClick={() => setActiveTab('simulation')}
            >
              수익 시뮬레이션
            </button>
          </div>

          {activeTab === 'summary' && (
            <div className="deposit-summary-content">
              <div className="deposit-summary-card">
                <div className="deposit-summary-details">
                  <div className="deposit-summary-grid">
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">펀드 계좌번호</p>
                      <p className="deposit-info-value">{account.fundAccountNumber}</p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">투자 금액</p>
                      <p className="deposit-info-value">{account.fundInvestmentAmount?.toLocaleString()}원</p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">예상 수익금</p>
                      <p className="deposit-info-value">{expectedProfit.toLocaleString()}원</p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">만기까지 남은 기간</p>
                      <p className="deposit-info-value">{remainingDays}일</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="deposit-interest-content">
              {/*{console.log('세부정보 컴포넌트의 productDetails:', productDetails)}*/}
              <div className="deposit-interest-card">
                <div className="deposit-interest-details">
                  <div className="deposit-interest-grid">
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">운용 수수료</p>
                      <p className="deposit-info-value">{productDetails.fundProductManagementFee}%</p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">환매 수수료</p>
                      <p className="deposit-info-value">{productDetails.fundProductRedemptionFee}%</p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">총 펀드 규모</p>
                      <p className="deposit-info-value">{productDetails.fundProductTotalAmount?.toLocaleString()}원</p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">환매 가능 금액</p>
                      <p className="deposit-info-value">{redemptionAmount.toLocaleString()}원</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'investment' && (
            <div className="deposit-regular-content">
              <div className="deposit-regular-card">
                <div className="deposit-regular-details">
                  <div className="deposit-regular-grid">
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">투자 시작일</p>
                      <p className="deposit-info-value">{formatDate(account.fundInvestmentDate)}</p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">만기일</p>
                      <p className="deposit-info-value">{formatDate(account.fundMaturityDate)}</p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">펀드 상태</p>
                      <p className="deposit-info-value">{account.fundStatus}</p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">투자 유형</p>
                      <p className="deposit-info-value">{productDetails.fundProductType}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'simulation' && (
            <div className="deposit-simulation-content">
              <div className="deposit-simulation-card">
                <div className="deposit-simulation-details">
                  <div className="simulation-chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={generateSimulationData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                          tickFormatter={(value) => `${(value/10000).toFixed(0)}만`}
                        />
                        <Tooltip
                          formatter={(value) => new Intl.NumberFormat('ko-KR').format(value) + '원'}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="estimatedAmount"
                          name="예상 평가금액"
                          stroke="#2563eb"
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="profit"
                          name="예상 수익금"
                          stroke="#22c55e"
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="allFee"
                          name="총수수료"
                          stroke="#9333ea"
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="simulation-footnote">
                    <p>* 위 시뮬레이션은 예상 수치이며, 실제 수익률과는 차이가 있을 수 있습니다.</p>
                    <p>* 중도환매 시 환매수수료가 발생할 수 있으며, 시장상황에 따라 손실이 발생할 수 있습니다.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="deposit-detail-actions">
          <button
            className="terminate-button"
            onClick={handleRedeem}
            disabled={!isEligibleForRedemption || isRedeeming}
            title={getRedemptionTooltip()}
          >
            {isRedeeming ? '환매 처리 중...' :
              !isEligibleForRedemption ? getRedemptionTooltip() :
                '펀드 환매하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyFundDetail;