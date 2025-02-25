import React, { useState } from 'react';
import DepositAPI from '../../api/DepositAPI';
import '../../css/recommends/MyDepositDetail.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const MyDepositDetail = ({ isOpen, onClose, account, productDetails }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isTerminating, setIsTerminating] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateRemainingDays = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 시뮬레이션 계산 함수 추가
  const calculateSimulation = () => {
    const principal = account.depositAmount;
    const baseRate = Number(productDetails.depositBaseInterestRate);
    const primeRate = Number(productDetails.depositPrimeInterestRate);
    const totalRate = (baseRate + primeRate) / 100;
    const isSimple = productDetails.depositInterestRateType === '단리';

    // 총 만기 개월 수 계산
    const startDate = new Date(account.depositStartDate);
    const endDate = new Date(account.depositEndDate);
    const totalMonths = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 30.44));

    // 시뮬레이션 기간 생성
    const periods = [
      { label: '즉시', months: 0 },
      { label: '1개월', months: 1 },
    ];

    // 3개월 단위로 기간 추가
    for (let month = 3; month <= totalMonths; month += 3) {
      periods.push({ label: `${month}개월`, months: month });
    }

    // 마지막이 만기와 같지 않다면 만기 추가
    if (periods[periods.length - 1].months !== totalMonths) {
      periods.push({ label: `만기(${totalMonths}개월)`, months: totalMonths });
    }

    // 동적 위약금 계산 로직
    const calculatePenaltyRate = (monthsPassed) => {
      const ratioToMaturity = monthsPassed / totalMonths;
      // 초기에 높은 위약금, 만기에 가까워질수록 낮아짐
      return Math.max(0, 0.02 - ratioToMaturity * 0.02);
    };

    return periods.map((period) => {
      let interest = 0;
      if (isSimple) {
        interest = principal * totalRate * (period.months / 12);
      } else {
        interest = principal * (Math.pow(1 + totalRate, period.months / 12) - 1);
      }

      // 동적 위약금 적용
      const penaltyRate = period.months === totalMonths ? 0 : calculatePenaltyRate(period.months);
      const penalty = period.months === totalMonths ? 0 : principal * penaltyRate;
      const serviceFee = principal * 0.007;

      const totalReturn = principal + interest - penalty - serviceFee;
      const profit = totalReturn - principal;

      return {
        period: period.label,
        months: period.months,
        interest: Math.round(interest),
        penalty: Math.round(penalty),
        serviceFee: Math.round(serviceFee),
        totalReturn: Math.round(totalReturn),
        profit: Math.round(profit),
      };
    });
  };

  // 해지 관련
  const handleTerminate = async () => {
    if (
      window.confirm(
        '정말로 이 예금 계좌를 해지하시겠습니까? 중도해지 시 위약금이 발생할 수 있습니다.',
      )
    ) {
      try {
        setIsTerminating(true);
        const response = await DepositAPI.terminateDepositAccount(
          account.depositAccountNumber,
          '중도해지',
        );
        alert(
          `계좌가 성공적으로 해지되었습니다. 환급액: ${response.totalRefundAmount.toLocaleString()}원`,
        );
        onClose();
        window.location.reload();
      } catch (error) {
        alert('계좌 해지 중 오류가 발생했습니다: ' + error.message);
      } finally {
        setIsTerminating(false);
      }
    }
  };

  if (!isOpen || !account || !productDetails) return null;

  return (
    <div className="modal-backdrop">
      <div className="deposit-detail-modal">
        <div className="deposit-detail-header">
          <h2 className="deposit-detail-title">{productDetails.depositProductName} 상세정보</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
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
            <button
              className={`deposit-detail-tab ${activeTab === 'simulation' ? 'active' : ''}`}
              onClick={() => setActiveTab('simulation')}
            >
              예상 수익
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
                      <p className="deposit-info-value deposit-amount">
                        {account.depositAmount?.toLocaleString()}원
                      </p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">은행명</p>
                      <p className="deposit-info-value">{productDetails.bankName}</p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">만기까지 남은 기간</p>
                      <p className="deposit-info-value remaining-days">
                        {calculateRemainingDays(account.depositEndDate)}일
                      </p>
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
                      <p className="deposit-info-value interest-type">
                        {productDetails.depositInterestRateType}
                      </p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">기본 이자율</p>
                      <p className="deposit-info-value interest-rate">
                        {productDetails.depositBaseInterestRate}%
                      </p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">우대 이자율</p>
                      <p className="deposit-info-value prime-rate">
                        {productDetails.depositPrimeInterestRate}%
                      </p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">총 이자율</p>
                      <p className="deposit-info-value total-rate">
                        {(
                          Number(productDetails.depositBaseInterestRate) +
                          Number(productDetails.depositPrimeInterestRate)
                        ).toFixed(2)}
                        %
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
                        <p className="deposit-info-value payment-day">
                          매월 {account.regularPaymentDay}일
                        </p>
                      </div>
                      <div className="deposit-info-item">
                        <p className="deposit-info-label">마지막 납입일</p>
                        <p className="deposit-info-value last-payment">
                          {account.lastPaymentDate
                            ? formatDate(account.lastPaymentDate)
                            : '납입 이력 없음'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="deposit-no-regular-payment">
                      정기 납입이 설정되지 않은 계좌입니다.
                    </p>
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
                      <p className="deposit-info-value start-date">
                        {formatDate(account.depositStartDate)}
                      </p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">만기일</p>
                      <p className="deposit-info-value end-date">
                        {formatDate(account.depositEndDate)}
                      </p>
                    </div>
                    <div className="deposit-info-item">
                      <p className="deposit-info-label">만기 기간</p>
                      <p className="deposit-info-value maturity-period">
                        {productDetails.depositMaturityPeriod}개월
                      </p>
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

          {activeTab === 'simulation' && (
            <div className="deposit-simulation-content">
              <div className="deposit-simulation-card">
                <div className="deposit-simulation-details">
                  <div className="simulation-chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={calculateSimulation()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`} />
                        <Tooltip
                          formatter={(value) => new Intl.NumberFormat('ko-KR').format(value) + '원'}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="totalReturn"
                          name="총 환급액"
                          stroke="#2563eb"
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="profit"
                          name="순수익"
                          stroke="#22c55e"
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="serviceFee"
                          name="수수료"
                          stroke="#9333ea"
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-8">
                    <table className="simulation-table">{/* 기존 테이블 내용 유지 */}</table>
                  </div>

                  <div className="simulation-footnote">
                    <p>* 위 시뮬레이션은 예상 수치이며, 실제 금액과는 차이가 있을 수 있습니다.</p>
                    <p>* 중도해지 시 기간에 따라 차등 적용되는 해지 수수료가 발생할 수 있습니다.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 해지 */}
        <div className="deposit-detail-actions">
          <button className="terminate-button" onClick={handleTerminate} disabled={isTerminating}>
            {isTerminating ? '해지 처리 중...' : '예금 해지하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyDepositDetail;
