import React from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import data from '../../data/processed_apartments_real.json'; // JSON 파일 가져오기

const ApartmentDetails = () => {
  const { id } = useParams();
  const apartment = data[id];

  if (!apartment) {
    return <p>아파트 정보를 찾을 수 없습니다.</p>;
  }

  // 연도별 거래금액 데이터를 구성
  const priceData = apartment.prices
    ? Object.keys(apartment.prices)
        .filter((year) => apartment.prices[year] !== null)
        .map((year) => ({ year: parseInt(year, 10), price: apartment.prices[year] }))
    : [];

  return (
    <div style={{ padding: '20px' }}>
      <h1>{apartment['단지명']}</h1>

      <p>
        <strong>도로명:</strong> {apartment['도로명']}
      </p>
      <p>
        <strong>전용 면적:</strong> {apartment['전용면적(㎡)']}㎡
      </p>
      <p>
        <strong>최신 거래가:</strong>{' '}
        {apartment['거래금액(만원)']
          ? (apartment['거래금액(만원)'] / 10000).toFixed(2) + '억'
          : '정보 없음'}
      </p>
      <p>
        <strong>변동률:</strong>{' '}
        {apartment['변동률(%)'] !== null ? (
          <span style={{ color: apartment['변동률(%)'] > 0 ? 'green' : 'red' }}>
            {apartment['변동률(%)']}%
          </span>
        ) : (
          '정보 없음'
        )}
      </p>
      <p>
        <strong>3.3㎡당 가격:</strong>{' '}
        {apartment['거래금액(만원)'] && apartment['전용면적(㎡)']
          ? (apartment['거래금액(만원)'] / apartment['전용면적(㎡)'] / 3.3 / 1000).toFixed(2) + '억'
          : '정보 없음'}
      </p>

      {/* 연도별 가격 변동 그래프 */}
      {priceData.length > 0 ? (
        <div style={{ marginTop: '40px' }}>
          <h3>연도별 가격 변동</h3>
          <LineChart
            width={600}
            height={300}
            data={priceData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </div>
      ) : (
        <p>가격 데이터가 부족합니다.</p>
      )}
    </div>
  );
};

export default ApartmentDetails;
