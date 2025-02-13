import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SavingAPI from '../../api/SavingAPI';
import SavingJoinModal from './SavingJoinModal';
import '../../css/recommends/SavingDetail.css';

const SavingDetail = () => {
  const { savingProductId } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [joinedProducts, setJoinedProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 상품 상세 정보와 가입한 상품 목록을 동시에 조회
        const [savingData, myAccountsResponse] = await Promise.all([
          SavingAPI.getSavingProductById(savingProductId),
          SavingAPI.getMySavingAccounts()
        ]);

        setSaving(savingData);

        // 가입 여부 확인
        const joinedProductIds = myAccountsResponse.accounts.map(account => account.savingProductId);
        setJoinedProducts(joinedProductIds);
        setIsJoined(joinedProductIds.includes(Number(savingProductId)));

      } catch (err) {
        console.error('Error fetching data: ', err);
        setError('데이터를 가져오지 못하였습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [savingProductId]);

  if (loading) return <p>로딩 중....</p>;
  if (error) return <p>{error}</p>;
  if (!saving) return <p>해당 상품 정보를 찾을 수 없습니다.</p>;

  return (
    <div className="saving-detail">
      {isJoined && (
        <div className="saving-detail-joined-badge">
          가입완료
        </div>
      )}

      <h2>{saving.savingProductName}</h2>
      <p>은행 이름: {saving.savingBankName}</p>
      <p>최소 금액: {saving.savingMinAmount.toLocaleString()}원</p>
      <p>최대 금액: {saving.savingMaxAmount.toLocaleString()}원</p>
      <p>만기 기간: {saving.savingMaturityPeriod}개월</p>
      <p>기본 이율: {saving.savingBaseInterestRate}%</p>
      <p>최고 우대 이율: {saving.savingPrimeInterestRate}%</p>
      <p>가입 방법: {saving.savingJoinWay}</p>
      <p>이율 유형: {saving.savingInterestRateType}</p>
      <p>생성 일자: {new Date(saving.savingProductCreatedAt).toLocaleDateString()}</p>
      <p>수정 일자: {new Date(saving.savingProductUpdatedAt).toLocaleDateString()}</p>

      {/* 가입하기 버튼 - 이미 가입한 경우 비활성화 */}
      <button
        className={`saving-join-btn ${isJoined ? 'joined' : ''}`}
        onClick={() => setShowJoinModal(true)}
        disabled={isJoined}
      >
        {isJoined ? '가입완료' : '가입하기'}
      </button>

      {/* 가입 모달 */}
      {showJoinModal && !isJoined && (
        <SavingJoinModal
          saving={saving}
          onClose={() => setShowJoinModal(false)}
          joinedProducts={joinedProducts}
          setJoinedProducts={setJoinedProducts}
        />
      )}
    </div>
  );
};

export default SavingDetail;