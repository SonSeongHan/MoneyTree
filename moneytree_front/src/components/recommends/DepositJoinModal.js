import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../../util/cookieUtil';
import DepositAPI from '../../api/DepositAPI';
import '../../css/recommends/DepositJoinModal.css';

const DepositJoinModal = ({ deposit, onClose, joinedProducts, setJoinedProducts }) => {
  const navigate = useNavigate();

  // 입력 필드 상태 관리
  const [depositAmount, setDepositAmount] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [isRegularPayment, setIsRegularPayment] = useState(false);
  const [regularAmount, setRegularAmount] = useState('');
  const [regularDay, setRegularDay] = useState('');

  // 약관 동의 상태 관리
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    interest: false,
    maturity: false
  });

  // 에러 메시지 상태
  const [error, setError] = useState('');
  const [isAlreadyJoined, setIsAlreadyJoined] = useState(false);

  // 모든 약관 동의 체크
  const [allAgreed, setAllAgreed] = useState(false);

  // 이미 가입한 상품인지 체크
  useEffect(() => {
    const checkExistingAccount = async () => {
      try {
        const response = await DepositAPI.getMyDepositAccounts();
        const existingAccount = response.accounts.find(
          account => account.depositProductId === deposit.depositProductId
        );

        if (existingAccount) {
          setIsAlreadyJoined(true);
          alert('이미 가입한 상품입니다.');
          onClose();
        }

        // 전체 가입 상품 목록 업데이트
        const joinedProductIds = response.accounts.map(account => account.depositProductId);
        setJoinedProducts(joinedProductIds);
      } catch (error) {
        console.error('계좌 조회 중 오류 발생:', error);
      }
    };

    const memberInfo = getCookie('member');
    if (!memberInfo) {
      alert('로그인이 필요한 서비스입니다.');
      onClose();
      navigate('/loginpage');
    } else {
      checkExistingAccount();
    }
  }, [deposit.depositProductId, onClose, navigate, setJoinedProducts]);

  // 예금 만기일 계산
  const calculateMaturityDate = () => {
    const today = new Date();
    today.setMonth(today.getMonth() + deposit.depositMaturityPeriod);
    return today.toLocaleDateString();
  };

  // 모든 약관 동의 처리
  const handleAllAgreements = (checked) => {
    setAllAgreed(checked);
    setAgreements({
      terms: checked,
      privacy: checked,
      interest: checked,
      maturity: checked
    });
  };

  // 개별 약관 동의 처리
  const handleAgreementChange = (name, checked) => {
    const newAgreements = { ...agreements, [name]: checked };
    setAgreements(newAgreements);
    setAllAgreed(Object.values(newAgreements).every(value => value));
  };

  // 가입 신청 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!Object.values(agreements).every(value => value)) {
      setError('모든 약관에 동의해주세요.');
      return;
    }

    if (Number(depositAmount) < deposit.depositMinAmount) {
      setError(`최소 가입금액은 ${deposit.depositMinAmount.toLocaleString()}원 입니다.`);
      return;
    }

    if (isRegularPayment && (!regularAmount || !regularDay)) {
      setError('정기 납입 정보를 모두 입력해주세요.');
      return;
    }

    try {
      const accountData = {
        depositAmount: Number(depositAmount),
        depositProductId: deposit.depositProductId,
        accountPassword,
        isRegularPayment,
        regularPaymentAmount: isRegularPayment ? Number(regularAmount) : null,
        regularPaymentDay: isRegularPayment ? Number(regularDay) : null
      };

      await DepositAPI.createDepositAccount(accountData);

      // 가입 성공 시 가입된 상품 목록 업데이트
      setJoinedProducts(prev => [...prev, deposit.depositProductId]);

      alert('예금 상품 가입이 완료되었습니다.');
      onClose();
      navigate('/mypage');
    } catch (error) {
      setError(error.response?.data || '가입 처리 중 오류가 발생했습니다.');
    }
  };

  if (isAlreadyJoined) {
    return null;
  }

  return (
    <div className="deposit-modal-overlay">
      <div className="deposit-modal-container">
        <div className="deposit-modal-content">
          {/* 헤더 */}
          <div className="deposit-modal-header">
            <h2 className="deposit-modal-title">{deposit.depositProductName} 가입</h2>
            <button onClick={onClose} className="deposit-modal-close">×</button>
          </div>

          {/* 상품 정보 요약 */}
          <div className="deposit-product-summary">
            <div className="deposit-summary-grid">
              <div className="deposit-summary-item">
                <p className="deposit-summary-label">기본금리</p>
                <p className="deposit-summary-value">{deposit.depositBaseInterestRate}%</p>
              </div>
              <div className="deposit-summary-item">
                <p className="deposit-summary-label">우대금리</p>
                <p className="deposit-summary-value">{deposit.depositPrimeInterestRate}%</p>
              </div>
              <div className="deposit-summary-item">
                <p className="deposit-summary-label">최소가입금액</p>
                <p className="deposit-summary-value">{deposit.depositMinAmount.toLocaleString()}원</p>
              </div>
              <div className="deposit-summary-item">
                <p className="deposit-summary-label">만기일</p>
                <p className="deposit-summary-value">{calculateMaturityDate()}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="deposit-join-form">
            {/* 입력 필드 섹션 */}
            <div className="deposit-form-fields">
              <div className="deposit-input-group">
                <label className="deposit-input-label">가입금액</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min={deposit.depositMinAmount}
                  className="deposit-input"
                  placeholder="가입금액을 입력하세요"
                  required
                />
              </div>

              <div className="deposit-input-group">
                <label className="deposit-input-label">계좌 비밀번호</label>
                <input
                  type="password"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  maxLength={4}
                  className="deposit-input"
                  placeholder="4자리 숫자"
                  required
                />
              </div>

              {/* 정기 납입 설정 */}
              <div className="deposit-regular-payment">
                <label className="deposit-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isRegularPayment}
                    onChange={(e) => setIsRegularPayment(e.target.checked)}
                    className="deposit-checkbox"
                  />
                  정기 납입 설정
                </label>

                {isRegularPayment && (
                  <div className="deposit-regular-options">
                    <div className="deposit-input-group">
                      <label className="deposit-input-label">월 납입액</label>
                      <input
                        type="number"
                        value={regularAmount}
                        onChange={(e) => setRegularAmount(e.target.value)}
                        className="deposit-input"
                        placeholder="월 납입액을 입력하세요"
                        required
                      />
                    </div>
                    <div className="deposit-input-group">
                      <label className="deposit-input-label">납입일</label>
                      <select
                        value={regularDay}
                        onChange={(e) => setRegularDay(e.target.value)}
                        className="deposit-select"
                        required
                      >
                        <option value="">납입일 선택</option>
                        {[...Array(28)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>매월 {i + 1}일</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 약관 동의 섹션 */}
            <div className="deposit-agreements">
              <label className="deposit-checkbox-label">
                <input
                  type="checkbox"
                  checked={allAgreed}
                  onChange={(e) => handleAllAgreements(e.target.checked)}
                  className="deposit-checkbox"
                />
                모든 약관에 동의합니다
              </label>

              <div className="deposit-agreement-list">
                <label className="deposit-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreements.terms}
                    onChange={(e) => handleAgreementChange('terms', e.target.checked)}
                    className="deposit-checkbox"
                  />
                  예금거래 기본약관 동의
                </label>
                <label className="deposit-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreements.privacy}
                    onChange={(e) => handleAgreementChange('privacy', e.target.checked)}
                    className="deposit-checkbox"
                  />
                  개인정보 수집 및 이용 동의
                </label>
                <label className="deposit-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreements.interest}
                    onChange={(e) => handleAgreementChange('interest', e.target.checked)}
                    className="deposit-checkbox"
                  />
                  이자율 및 이자지급 방식 동의
                </label>
                <label className="deposit-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreements.maturity}
                    onChange={(e) => handleAgreementChange('maturity', e.target.checked)}
                    className="deposit-checkbox"
                  />
                  만기 전 해지 불이익 안내 동의
                </label>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && <div className="deposit-error">{error}</div>}

            {/* 제출 버튼 */}
            <div className="deposit-button-group">
              <button type="button" onClick={onClose} className="deposit-cancel-btn">
                취소
              </button>
              <button type="submit" className="deposit-submit-btn">
                가입신청
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DepositJoinModal;