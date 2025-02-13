// src/pages/estate/fss/MortgageLoanProducts.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../../css/estate/fss/MortgageLoanProducts.css';

const MortgageLoanProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/fss/mortgage-loan-products')
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('모기지론 상품 데이터 로딩 오류:', err);
        setError('추천 상품 데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!products || products.length === 0)
    return <div className="no-data">추천 상품이 없습니다.</div>;

  return (
    <div className="products-container">
      <h1>모기지론 상품 목록</h1>
      투자 과열 지구는 대출한도가 거래가의 50%가 최대
      <div className="products-list">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/estate/fss/mortgage-loan-products/${product.id}`}
            className="product-link"
          >
            <div className="product-card">
              <h2>{product.finPrdtNm}</h2>
              <p>
                <strong>금융회사 이름:</strong> {product.korCoNm}
              </p>
              <p>
                <strong>중도상환수수료:</strong> {product.erlyRpayFee}
              </p>
              <p>
                <strong>연체율 정보:</strong> {product.dlyRate}
              </p>
              <p>
                <strong>대출한도 정보:</strong> {product.loanLmt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MortgageLoanProducts;
