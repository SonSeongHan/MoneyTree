import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {fetchDepositById} from '../../api/DepositAPI';

const DepositDetail = () => {
  const {id} = useParams(); // URL에서 ID 가져오기
  const [deposit, setDeposit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepositDetail = async() => {
      try{
        const data = await fetchDepositById(id);
        setDeposit(data);
      }catch(err){
        console.error('Error fetching deposit details : ', err);
        setError('상품 데이터를 가져오지 못하였습니다.');
      }finally{
        setLoading(false);
      }
    };
    fetchDepositDetail();
  },[id]);

  if(loading) return <p>로딩 중....</p>;
  if(error) return <p>{error}</p>;
  if(!deposit) return <p>해당 상품 정보를 찾을 수 없습니다.</p>;

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
    </div>
  );
}

export default DepositDetail;