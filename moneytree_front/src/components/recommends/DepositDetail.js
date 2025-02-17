import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DepositAPI from '../../api/DepositAPI';
import DepositJoinModal from './DepositJoinModal';
import '../../css/recommends/DepositDetail.css';

const DepositDetail = () => {
  const { depositProductId } = useParams();
  const [deposit, setDeposit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    const fetchDepositDetail = async () => {
      try {
        const data = await DepositAPI.getDepositById(depositProductId);
        setDeposit(data);
      } catch (err) {
        console.error('Error fetching deposit details: ', err);
        setError('상품 데이터를 가져오지 못하였습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchDepositDetail();
  }, [depositProductId]);

  if (loading) return <p>로딩 중....</p>;
  if (error) return <p>{error}</p>;
  if (!deposit) return <p>해당 상품 정보를 찾을 수 없습니다.</p>;

  return (
    <div className="deposit-detail">
      <h2>{deposit.depositProductName}</h2>
      <p>은행 이름: {deposit.bankName}</p>
      <p>최소 금액: {deposit.depositMinAmount.toLocaleString()}원</p>
      <p>만기 기간: {deposit.depositMaturityPeriod}개월</p>
      <p>기본 이율: {deposit.depositBaseInterestRate}%</p>
      <p>최고 우대 이율: {deposit.depositPrimeInterestRate}%</p>
      <p>가입 방법: {deposit.depositJoinWay}</p>
      <p>이율 유형: {deposit.depositInterestRateType}</p>
      <p>생성 일자: {new Date(deposit.depositProductCreatedAt).toLocaleDateString()}</p>
      <p>수정 일자: {new Date(deposit.depositProductUpdatedAt).toLocaleDateString()}</p>

      {/* 가입하기 버튼 추가 */}
      <button
        className="deposit-join-btn"
        onClick={() => setShowJoinModal(true)}
      >
        가입하기
      </button>

      {/* 가입 모달 */}
      {showJoinModal && (
        <DepositJoinModal
          deposit={deposit}
          onClose={() => setShowJoinModal(false)}
        />
      )}
    </div>
  );
};

export default DepositDetail;