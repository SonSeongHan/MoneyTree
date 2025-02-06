import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SavingAPI from '../../api/SavingAPI';

function SavingDetail() {
  const { savingProductId } = useParams();
  const [savingProduct, setSavingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSavingProduct = async () => {
      try {
        const response = await SavingAPI.getSavingProductById(savingProductId);
        setSavingProduct(response);
      } catch (error) {
        setError('적금 상품 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavingProduct();
  }, [savingProductId]);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;
  if (!savingProduct) return <p>적금 상품 정보를 찾을 수 없습니다.</p>;

  return (
    <div className="saving-detail-container">
      <h1 className="saving-title">{savingProduct.savingProductName}</h1>
      <p className="saving-bank">은행: {savingProduct.savingBankName}</p>
      <p className="saving-join-way">가입 방법: {savingProduct.savingJoinWay}</p>
      <p className="saving-min-amount">최소 가입 금액: {savingProduct.savingMinAmount.toLocaleString()} 원</p>
      <p className="saving-max-amount">최대 가입 금액: {savingProduct.savingMaxAmount.toLocaleString()} 원</p>
      <p className="saving-interest-rate">기본 이자율: {savingProduct.savingBaseInterestRate}%</p>
      <p className="saving-prime-interest-rate">최고 우대 이자율: {savingProduct.savingPrimeInterestRate}%</p>
      <p className="saving-maturity-period">만기 기간: {savingProduct.savingMaturityPeriod}개월</p>
    </div>
  );
}

export default SavingDetail;
