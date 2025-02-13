// src/pages/estate/fss/MortgageLoanProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../../../css/estate/fss/MortgageLoanProductDetail.css';

const MortgageLoanProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/fss/mortgage-loan-products/${id}`)
      .then((response) => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('상세 상품 데이터 로딩 오류:', err);
        setError('상세 상품 데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="no-data">상품을 찾을 수 없습니다.</div>;

  return (
    <div className="detail-container">
      <h1>{product.finPrdtNm}</h1>
      <div className="detail-item">
        <strong>신고월:</strong> {product.dclsMonth}
      </div>
      <div className="detail-item">
        <strong>금융회사 번호:</strong> {product.finCoNo}
      </div>
      <div className="detail-item">
        <strong>금융상품 코드:</strong> {product.finPrdtCd}
      </div>
      <div className="detail-item">
        <strong>금융회사 이름:</strong> {product.korCoNm}
      </div>
      <div className="detail-item">
        <strong>가입 방식:</strong> {product.joinWay}
      </div>
      <div className="detail-item">
        <strong>인지세 정보:</strong> {product.loanInciExpn}
      </div>
      <div className="detail-item">
        <strong>중도상환수수료:</strong> {product.erlyRpayFee}
      </div>
      <div className="detail-item">
        <strong>연체율 정보:</strong> {product.dlyRate}
      </div>
      <div className="detail-item">
        <strong>대출한도 정보:</strong> {product.loanLmt}
      </div>
      <div className="detail-item">
        <strong>신고 시작일:</strong> {product.dclsStrtDay}
      </div>
      <div className="detail-item">
        <strong>신고 종료일:</strong> {product.dclsEndDay ? product.dclsEndDay : '없음'}
      </div>
      <div className="detail-item">
        <strong>금융회사 제출일:</strong> {product.finCoSubmDay}
      </div>
    </div>
  );
};

export default MortgageLoanProductDetail;
