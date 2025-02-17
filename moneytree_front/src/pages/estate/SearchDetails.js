import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import data from '../../data/processed_apartments_real.json';

const SearchDetails = () => {
  const { name } = useParams(); // URL에서 단지명 가져옴
  const [isFavorite, setIsFavorite] = useState(false); // 찜 상태 관리
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 아파트 데이터 찾기
  const apartment = data.find((item) => item['단지명'] === decodeURIComponent(name));

  useEffect(() => {
    if (!apartment) return;

    // 백엔드에서 현재 아파트가 찜 목록에 있는지 확인
    axios
      .get('/api/favorites')
      .then((response) => {
        const favoriteList = response.data.map((apt) => apt.name);
        setIsFavorite(favoriteList.includes(apartment['단지명']));
      })
      .catch((error) => {
        console.error('찜 여부 조회 오류:', error);
      });
  }, [apartment]);

  if (!apartment) {
    return <p>해당 아파트 정보를 찾을 수 없습니다.</p>;
  }

  // 찜하기 버튼 핸들러
  const handleFavorite = async () => {
    try {
      if (isFavorite) {
        await axios.delete(`/api/favorites/${apartment.id}`);
        setIsFavorite(false);
      } else {
        await axios.post(`/api/favorites/${apartment.id}`);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('찜 기능 오류:', error);
      setError('관심 매물 기능을 처리하는 중 오류가 발생했습니다.');
    }
  };

  // 연도별 거래금액 데이터 구성
  const priceData = apartment.prices
    ? Object.keys(apartment.prices)
        .filter((year) => apartment.prices[year] !== null) // null 값 제거
        .map((year) => ({ year: parseInt(year, 10), price: apartment.prices[year] }))
    : []; // 가격 데이터가 없으면 빈 배열

  return (
    <div style={{ padding: '20px' }}>
      <h1>{apartment['단지명']}</h1>

      {/* 이미지 추가 */}
      {apartment.image ? (
        <img
          src={apartment.image}
          alt={`${apartment['단지명']} 이미지`}
          style={{ width: '100%', maxWidth: '600px', marginBottom: '20px', borderRadius: '8px' }}
        />
      ) : (
        <p></p>
      )}

      <p>
        <strong>도로명:</strong> {apartment['도로명']}
      </p>
      <p>
        <strong>전용 면적:</strong> {apartment['전용면적(㎡)']}㎡
      </p>
      <p>
        <strong>최신 거래가:</strong> {(apartment['거래금액(만원)'] / 10000).toFixed(2)}억
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

      {/* 🔥 찜 버튼 */}
      <button
        onClick={handleFavorite}
        style={{
          padding: '10px 20px',
          background: isFavorite ? '#ff4d4d' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px',
          fontSize: '16px',
        }}
      >
        {isFavorite ? '찜 취소' : '관심매물'}
      </button>

      {/* 에러 메시지 표시 */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

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

export default SearchDetails;
