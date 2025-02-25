import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DepositAPI from '../../api/DepositAPI';
import DepositJoinModal from './DepositJoinModal';
import '../../css/recommends/DepositDetail.css';

const DepositDetail = () => {
  const { depositProductId } = useParams();
  const navigate = useNavigate();
  const [deposit, setDeposit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [joinedProducts, setJoinedProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 상품 상세 정보와 가입한 상품 목록을 동시에 조회
        const [depositData, myAccountsResponse] = await Promise.all([
          DepositAPI.getDepositById(depositProductId),
          DepositAPI.getMyDepositAccounts(),
        ]);

        setDeposit(depositData);

        // 가입 여부 확인
        const joinedProductIds = myAccountsResponse.accounts.map(
          (account) => account.depositProductId,
        );
        setJoinedProducts(joinedProductIds);
        setIsJoined(joinedProductIds.includes(Number(depositProductId)));
      } catch (err) {
        console.error('Error fetching data: ', err);
        setError('데이터를 가져오지 못하였습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [depositProductId]);

  if (loading) return <p>로딩 중....</p>;
  if (error) return <p>{error}</p>;
  if (!deposit) return <p>해당 상품 정보를 찾을 수 없습니다.</p>;

  return (
    <div className="deposit-detail">
      {isJoined && <div className="deposit-detail-joined-badge">가입완료</div>}

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

      {/* 가입하기 버튼 - 이미 가입한 경우 비활성화 */}
      <button
        className={`deposit-join-btn ${isJoined ? 'joined' : ''}`}
        onClick={() => setShowJoinModal(true)}
        disabled={isJoined}
      >
        {isJoined ? '가입완료' : '가입하기'}
      </button>

      {/* 가입 모달 */}
      {showJoinModal && !isJoined && (
        <DepositJoinModal
          deposit={deposit}
          onClose={() => setShowJoinModal(false)}
          joinedProducts={joinedProducts}
          setJoinedProducts={setJoinedProducts}
        />
      )}
    </div>
  );
};

export default DepositDetail;
