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
    <div className="saving-detail-container">
      <h1 className="saving-title">{savingProduct.savingProductName}</h1>
      <p className="saving-bank">은행: {savingProduct.savingBankName}</p>
      <p className="saving-join-way">가입 방법: {savingProduct.savingJoinWay}</p>
      <p className="saving-min-amount">
        최소 가입 금액: {savingProduct.savingMinAmount.toLocaleString()} 원
      </p>
      <p className="saving-max-amount">
        최대 가입 금액: {savingProduct.savingMaxAmount.toLocaleString()} 원
      </p>
      <p className="saving-interest-rate">기본 이자율: {savingProduct.savingBaseInterestRate}%</p>
      <p className="saving-prime-interest-rate">
        최고 우대 이자율: {savingProduct.savingPrimeInterestRate}%
      </p>
      <p className="saving-maturity-period">만기 기간: {savingProduct.savingMaturityPeriod}개월</p>

    </div>
  );
};

export default SavingDetail;