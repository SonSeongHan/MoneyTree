import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getCookie } from '../../../util/cookieUtil';
import '../../../css/estate/fss/SubscriptionDetail.css';

const SubscriptionDetail = () => {
  const { id } = useParams(); // 금융상품 ID
  const navigate = useNavigate();
  const location = useLocation();

  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoanLimitSet, setIsLoanLimitSet] = useState(false); // 대출 한도 설정 여부 상태 추가

  const loggedInUser = useMemo(() => getCookie('member'), []);

  const getAuthHeaders = () => {
    const headers = {};
    if (loggedInUser && loggedInUser.accessToken) {
      headers.Authorization = `Bearer ${loggedInUser.accessToken}`;
      headers.memberId = String(loggedInUser.memberId);
    }
    return headers;
  };

  const stateMessage = useMemo(() => location.state?.message, [location.state]);
  const stateLoanAmount = useMemo(() => location.state?.loanAmount, [location.state]);

  useEffect(() => {
    if (stateMessage) {
      setSubscriptionInfo(location.state);
      setIsLoanLimitSet(location.state.isLoanLimitSet);
      setLoading(false);
    } else {
      axios
        .get(`http://localhost:8080/api/subscription-details/${id}`, {
          headers: getAuthHeaders(),
        })
        .then((response) => {
          setSubscriptionInfo(response.data);
          setIsLoanLimitSet(response.data.isLoanLimitSet);
          setLoading(false);
        })
        .catch((err) => {
          console.error('가입 상세 데이터 로딩 오류:', err);
          setError('가입 상세 데이터를 불러오는 중 오류가 발생했습니다.');
          setLoading(false);
        });
    }
  }, [id, stateMessage, stateLoanAmount, loggedInUser]);

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!subscriptionInfo) return <div className="no-data">가입 상세 정보를 확인할 수 없습니다.</div>;

  const displayLoanAmount =
    subscriptionInfo.loanAmount !== undefined && subscriptionInfo.loanAmount !== null
      ? Number(subscriptionInfo.loanAmount)
      : stateLoanAmount !== undefined && stateLoanAmount !== null
        ? Number(stateLoanAmount)
        : null;

  const handleLoanAmountSubmit = () => {
    if (displayLoanAmount > subscriptionInfo.availableLoanLimit) {
      alert('대출 금액이 남은 한도를 초과합니다.');
      return;
    }

    const loanAmountInUnits = Math.floor(displayLoanAmount / 10000000) * 10000000;

    axios
      .post(
        `http://localhost:8080/api/subscription-details/${id}/apply-loan`,
        { loanAmount: loanAmountInUnits },
        { headers: getAuthHeaders() },
      )
      .then((response) => {
        alert(`대출 신청 완료: ${loanAmountInUnits.toLocaleString()} 원`);
        setSubscriptionInfo((prevState) => ({
          ...prevState,
          availableLoanLimit: prevState.availableLoanLimit - loanAmountInUnits,
          borrowedAmount: prevState.borrowedAmount + loanAmountInUnits,
        }));
      })
      .catch((err) => {
        console.error('대출 신청 오류:', err);
        setError('대출 신청 중 오류가 발생했습니다.');
      });
  };

  return (
    <div className="subscription-detail-container">
      <h1>가입 상세 정보</h1>
      <p>
        {subscriptionInfo.message
          ? subscriptionInfo.message
          : '가입 상세 정보를 확인할 수 없습니다.'}
        {displayLoanAmount !== null && !isNaN(displayLoanAmount) && (
          <> (선택한 대출 금액: {displayLoanAmount.toLocaleString()} 원)</>
        )}
      </p>

      {subscriptionInfo.availableLoanLimit !== undefined && (
        <p>
          남은 대출 가능 금액: {Number(subscriptionInfo.availableLoanLimit).toLocaleString()} 원
        </p>
      )}

      <button onClick={handleLoanAmountSubmit} disabled={subscriptionInfo.availableLoanLimit <= 0}>
        대출 신청
      </button>

      {!isLoanLimitSet && (
        <button onClick={() => navigate(`/loan-limit-check`)}>대출한도 알아보기</button>
      )}

      <button onClick={() => navigate(-1)}>뒤로가기</button>
    </div>
  );
};

export default SubscriptionDetail;
