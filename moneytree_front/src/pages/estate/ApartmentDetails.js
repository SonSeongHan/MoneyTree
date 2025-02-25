import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
// JSON 파일에는 “id -> 아파트 상세 정보” 매핑
import data from '../../data/processed_apartments_real.json';

const ApartmentDetails = () => {
  const { id } = useParams(); // 예: /apartments/:id
  const [apartmentFromJson, setApartmentFromJson] = useState(null);
  const [ownerId, setOwnerId] = useState(null); // DB에서 가져올 소유자
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // 1) JSON에서 아파트 데이터 찾기
  useEffect(() => {
    const apt = data[id];
    if (!apt) {
      setError('아파트 정보를 찾을 수 없습니다 (JSON).');
      setLoading(false);
    } else {
      setApartmentFromJson(apt);
    }
  }, [id]);

  // 2) DB에서 ownerId 가져오기
  useEffect(() => {
    if (!apartmentFromJson) return; // JSON 로딩이 끝나야 진행

    // 예: JSON 내부에 “단지명”이 있다 가정 -> DB에서 ownerId를 가져오는 API
    //    아래는 “/api/apartments/owner?name=...” 식으로 가정
    setLoading(true);
    const aptName = apartmentFromJson['단지명'];
    axios
      .get(`http://localhost:8080/api/apartments/owner?name=${encodeURIComponent(aptName)}`)
      .then((res) => {
        // 백엔드가 { ownerId: "somebody@domain.com" } 형태로 준다고 가정
        setOwnerId(res.data.ownerId || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('DB에서 아파트 소유자 정보를 가져오는 중 오류가 발생했습니다.');
        setLoading(false);
      });
  }, [apartmentFromJson]);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!apartmentFromJson) return <p>아파트 정보를 찾을 수 없습니다.</p>;

  // JSON 내 특정 필드명 예시:
  // "단지명", "도로명", "전용면적(㎡)", "거래금액(만원)", "변동률(%)" 등
  // ownerId는 DB에서 가져온 값 사용
  const aptName = apartmentFromJson['단지명'];
  const roadAddress = apartmentFromJson['도로명'];
  const area = apartmentFromJson['전용면적(㎡)'];
  const currentPrice = apartmentFromJson['거래금액(만원)'];
  const changeRate = apartmentFromJson['변동률(%)'];

  return (
    <div style={{ padding: '20px' }}>
      <h1>{aptName}</h1>
      <p>
        <strong>도로명:</strong> {roadAddress}
      </p>
      <p>
        <strong>전용 면적:</strong> {area ? `${area}㎡` : '정보 없음'}
      </p>
      <p>
        <strong>최신 거래가:</strong>{' '}
        {currentPrice ? (currentPrice / 10000).toFixed(2) + '억' : '정보 없음'}
      </p>
      <p>
        <strong>변동률:</strong>{' '}
        {changeRate !== null && changeRate !== undefined ? (
          <span style={{ color: changeRate > 0 ? 'green' : 'red' }}>{changeRate}%</span>
        ) : (
          '정보 없음'
        )}
      </p>

      {/* DB에서 가져온 ownerId */}
      <p>
        <strong>소유자(ownerId):</strong> {ownerId || '미등록'}
      </p>

      {/*
        연도별 가격 변동 차트 등은
        apartmentFromJson.prices를 이용하여 렌더링 가능
      */}
    </div>
  );
};

export default ApartmentDetails;
