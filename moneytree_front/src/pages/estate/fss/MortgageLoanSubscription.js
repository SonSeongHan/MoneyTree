import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { getCookie } from '../../../util/cookieUtil';
import '../../../css/estate/fss/MortgageLoanSubscription.css';

const MortgageLoanSubscription = () => {
  const { id } = useParams(); // 금융상품 ID
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [availableLimit, setAvailableLimit] = useState(0); // 대출 가능 한도
  const [selectedAmount, setSelectedAmount] = useState(0); // 선택한 대출 금액
  const [remainingLimit, setRemainingLimit] = useState(0); // 남은 대출 한도
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loggedInUser = getCookie('member');

  const getAuthHeaders = () => {
    const headers = {};
    if (loggedInUser && loggedInUser.accessToken) {
      headers.Authorization = `Bearer ${loggedInUser.accessToken}`;
      headers.memberId = String(loggedInUser.memberId);
    }
    return headers;
  };

  // 상품 정보를 백엔드에서 재조회하는 함수
  const fetchProduct = () => {
    axios
      .get(`http://localhost:8080/api/fss/mortgage-loan-products/${id}`, {
        headers: getAuthHeaders(),
      })
      .then((response) => {
        setProduct(response.data);
        const limit = response.data.availableLoanLimit;
        if (!limit) {
          setError('백엔드에서 availableLoanLimit 값을 제대로 전달받지 못했습니다.');
          setLoading(false);
          return;
        }
        setAvailableLimit(limit);
        // 구독 후 남은 한도도 새로 계산 (만약 이전 선택이 있으면 0으로 초기화할 수 있음)
        setRemainingLimit(limit - selectedAmount);
        setLoading(false);
      })
      .catch((err) => {
        console.error('상품 상세 데이터 로딩 오류:', err);
        setError('상품 데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 대출 금액 선택 시 실시간으로 남은 한도 계산
  const handleAmountChange = (e) => {
    const newAmount = Number(e.target.value);
    setSelectedAmount(newAmount);
    setRemainingLimit(availableLimit - newAmount);
  };

  const handleSubscribe = () => {
    const headers = {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    };

    axios
      .post(
        `http://localhost:8080/api/fss/mortgage-loan-products/${id}/subscribe`,
        { loanAmount: selectedAmount },
        { headers },
      )
      .then((response) => {
        console.log('Subscribe response:', response.data);
        alert('가입이 완료되었습니다.');
        // 구독 성공 후 최신 상품 정보를 다시 받아와서 화면에 반영
        fetchProduct();
        // 가입 상세 페이지로 이동 (필요시)
        navigate(`/subscription-details/${id}?loanAmount=${selectedAmount}`);
      })
      .catch((err) => {
        console.error('구독(가입) 오류:', err.response ? err.response.data : err);
        alert('구독(가입) 처리 중 오류가 발생했습니다.');
      });
  };

  if (!loggedInUser) {
    return <div className="error">로그인이 필요합니다.</div>;
  }
  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="no-data">상품을 찾을 수 없습니다.</div>;

  return (
    <div className="subscription-container">
      <h1>{product.finPrdtNm}</h1>
      <div className="subscription-details">
        <p>
          <strong>금융회사 이름:</strong> {product.korCoNm}
        </p>
        <p>
          <strong>가입 방식:</strong> {product.joinWay}
        </p>
        <p>
          <strong>대출한도 정보:</strong> {product.loanLmt}
        </p>
        <p>
          <strong>가입 시 대출 가능 한도:</strong> {product.formattedAvailableLoanLimit}
        </p>
      </div>

      <div className="loan-selection">
        <label htmlFor="loanAmountRange">
          받으실 대출 금액 선택 (최소 5천만원부터 1천만원 단위):
        </label>
        <input
          type="range"
          id="loanAmountRange"
          min="50000000"
          max={availableLimit}
          step="10000000"
          value={selectedAmount}
          onChange={handleAmountChange}
        />
        <div className="selected-amount">선택된 금액: {selectedAmount.toLocaleString()} 원</div>
        <div className="remaining-limit">남은 대출 한도: {remainingLimit.toLocaleString()} 원</div>
      </div>

      <div className="max-loan-limit">
        최대 대출 가능 금액: {availableLimit.toLocaleString()} 원
      </div>

      <button className="subscribe-btn" onClick={handleSubscribe}>
        가입하기
      </button>
      <button className="back-btn" onClick={() => navigate(-1)}>
        뒤로가기
      </button>
    </div>
  );
};

export default MortgageLoanSubscription;
