import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../../util/cookieUtil';
import SavingAPI from '../../api/SavingAPI';
import '../../css/recommends/SavingJoinModal.css';

const SavingJoinModal = ({ saving, onClose, joinedProducts, setJoinedProducts }) => {
  const navigate = useNavigate();

  // 입력 필드 상태 관리
  const [savingDepositAmount, setSavingDepositAmount] = useState('');  // 변경: initialAmount -> savingDepositAmount
  const [accountPassword, setAccountPassword] = useState('');
  const [savingRegularPaymentAmount, setSavingRegularPaymentAmount] = useState('');  // 변경: monthlyAmount -> savingRegularPaymentAmount
  const [savingRegularPaymentDay, setSavingRegularPaymentDay] = useState('');  // 변경: paymentDay -> savingRegularPaymentDay

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
    let isSubscribed = true;

    const checkExistingAccount = async () => {
      try {
        const response = await SavingAPI.getMySavingAccounts();

        if (!isSubscribed) return;

        const existingAccount = response.accounts.find(
          account => account.savingProductId === saving.savingProductId
        );

        if (existingAccount) {
          setIsAlreadyJoined(true);
          alert('이미 가입한 상품입니다.');
          onClose();
          return;
        }

        const joinedProductIds = response.accounts.map(account => account.savingProductId);
        if (isSubscribed) {
          setJoinedProducts(joinedProductIds);
        }
      } catch (error) {
        if (isSubscribed) {
          console.error('계좌 조회 중 오류 발생:', error);
        }
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

    return () => {
      isSubscribed = false;
    };
  }, []); // 의존성 배열 비움

  // 적금 만기일 계산
  const calculateMaturityDate = () => {
    const today = new Date();
    today.setMonth(today.getMonth() + saving.savingMaturityPeriod);
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

    if (!savingDepositAmount) {
      setError('초기 납입금액을 입력해주세요.');
      return;
    }

    if (Number(savingDepositAmount) < saving.savingMinAmount) {
      setError(`최소 가입금액은 ${saving.savingMinAmount.toLocaleString()}원 입니다.`);
      return;
    }

    if (Number(savingDepositAmount) > saving.savingMaxAmount) {
      setError(`최대 가입금액은 ${saving.savingMaxAmount.toLocaleString()}원 입니다.`);
      return;
    }

    if (!savingRegularPaymentAmount || !savingRegularPaymentDay) {
      setError('월 납입금액과 납입일을 입력해주세요.');
      return;
    }

    try {
      const accountData = {
        savingDepositAmount: Number(savingDepositAmount),  // 변경: 필드명 매칭
        savingProductId: saving.savingProductId,
        accountPassword,
        savingRegularPaymentAmount: Number(savingRegularPaymentAmount),  // 변경: 필드명 매칭
        savingRegularPaymentDay: Number(savingRegularPaymentDay)  // 변경: 필드명 매칭
      };

      await SavingAPI.createSavingAccount(accountData);
      setJoinedProducts(prev => [...prev, saving.savingProductId]);

      alert('적금 상품 가입이 완료되었습니다.');
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
    <div className="saving-modal-overlay">
      <div className="saving-modal-container">
        <div className="saving-modal-content">
          <div className="saving-modal-header">
            <h2 className="saving-modal-title">{saving.savingProductName} 가입</h2>
            <button onClick={onClose} className="saving-modal-close">×</button>
          </div>

          <div className="saving-product-summary">
            <div className="saving-summary-grid">
              <div className="saving-summary-item">
                <p className="saving-summary-label">기본금리</p>
                <p className="saving-summary-value">{saving.savingBaseInterestRate}%</p>
              </div>
              <div className="saving-summary-item">
                <p className="saving-summary-label">우대금리</p>
                <p className="saving-summary-value">{saving.savingPrimeInterestRate}%</p>
              </div>
              <div className="saving-summary-item">
                <p className="saving-summary-label">최소가입금액</p>
                <p className="saving-summary-value">{saving.savingMinAmount.toLocaleString()}원</p>
              </div>
              <div className="saving-summary-item">
                <p className="saving-summary-label">만기일</p>
                <p className="saving-summary-value">{calculateMaturityDate()}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="saving-join-form">
            <div className="saving-form-fields">
              <div className="saving-input-group">
                <label className="saving-input-label">초기 납입금액</label>
                <input
                  type="number"
                  value={savingDepositAmount}
                  onChange={(e) => setSavingDepositAmount(e.target.value)}
                  min={saving.savingMinAmount}
                  max={saving.savingMaxAmount}
                  className="saving-input"
                  placeholder="초기 납입금액을 입력하세요"
                  required
                />
              </div>

              <div className="saving-input-group">
                <label className="saving-input-label">계좌 비밀번호</label>
                <input
                  type="password"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  maxLength={4}
                  className="saving-input"
                  placeholder="4자리 숫자"
                  required
                />
              </div>

              <div className="saving-input-group">
                <label className="saving-input-label">월 납입금액</label>
                <input
                  type="number"
                  value={savingRegularPaymentAmount}
                  onChange={(e) => setSavingRegularPaymentAmount(e.target.value)}
                  className="saving-input"
                  placeholder="월 납입금액을 입력하세요"
                  required
                />
              </div>

              <div className="saving-input-group">
                <label className="saving-input-label">월 납입일</label>
                <select
                  value={savingRegularPaymentDay}
                  onChange={(e) => setSavingRegularPaymentDay(e.target.value)}
                  className="saving-select"
                  required
                >
                  <option value="">납입일 선택</option>
                  {[...Array(28)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>매월 {i + 1}일</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="saving-agreements">
              <label className="saving-checkbox-label">
                <input
                  type="checkbox"
                  checked={allAgreed}
                  onChange={(e) => handleAllAgreements(e.target.checked)}
                  className="saving-checkbox"
                />
                모든 약관에 동의합니다
              </label>

              <div className="saving-agreement-list">
                <label className="saving-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreements.terms}
                    onChange={(e) => handleAgreementChange('terms', e.target.checked)}
                    className="saving-checkbox"
                  />
                  적금거래 기본약관 동의
                </label>
                <label className="saving-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreements.privacy}
                    onChange={(e) => handleAgreementChange('privacy', e.target.checked)}
                    className="saving-checkbox"
                  />
                  개인정보 수집 및 이용 동의
                </label>
                <label className="saving-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreements.interest}
                    onChange={(e) => handleAgreementChange('interest', e.target.checked)}
                    className="saving-checkbox"
                  />
                  이자율 및 이자지급 방식 동의
                </label>
                <label className="saving-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreements.maturity}
                    onChange={(e) => handleAgreementChange('maturity', e.target.checked)}
                    className="saving-checkbox"
                  />
                  만기 전 해지 불이익 안내 동의
                </label>
              </div>
            </div>

            {error && <div className="saving-error">{error}</div>}

            <div className="saving-button-group">
              <button type="button" onClick={onClose} className="saving-cancel-btn">
                취소
              </button>
              <button type="submit" className="saving-submit-btn">
                가입신청
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SavingJoinModal;