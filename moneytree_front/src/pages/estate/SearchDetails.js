import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import data from '../../data/processed_apartments_real.json';
import { getCookie } from '../../util/cookieUtil';
import LoginModal from '../../components/LoginModal'; // 로그인 모달 컴포넌트
import '../../css/estate/SearchDetails.css';

const SearchDetails = () => {
  const { name } = useParams(); // URL에서 단지명 가져옴
  const navigate = useNavigate();

  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 로그인 모달 표시 여부 상태
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // ★ DB에서 가져올 ownerId
  const [dbOwnerId, setDbOwnerId] = useState(null);

  // JSON 데이터에서 아파트 데이터 검색
  const apartment = data.find((item) => item['단지명'] === decodeURIComponent(name));

  // 1) 아파트 찜 여부 확인
  useEffect(() => {
    if (!apartment) {
      setLoading(false);
      return;
    }

    const loggedInUser = getCookie('member');
    // 로그인하지 않은 경우 찜 기능은 건너뛰고 로딩만 해제
    if (!loggedInUser || !loggedInUser.memberId || !loggedInUser.accessToken) {
      setLoading(false);
      return;
    }

    const headers = {
      Authorization: `Bearer ${loggedInUser.accessToken}`,
      memberId: encodeURIComponent(String(loggedInUser.memberId)),
    };

    axios
      .get('http://localhost:8080/api/favorite-apartments', { headers })
      .then((response) => {
        const favoriteList = response.data.map((apt) => apt.apartmentName);
        setIsFavorite(favoriteList.includes(apartment['단지명']));
        setLoading(false);
      })
      .catch((err) => {
        console.error('찜 여부 조회 오류:', err);
        setLoading(false);
      });
  }, [apartment]);

  // 2) DB에서 ownerId 가져오기 (별도 API 예시: GET /api/apartments/owner?name=...)
  useEffect(() => {
    if (!apartment) return;

    // 예: JSON에서 "단지명" 추출 후 백엔드 호출
    const aptName = apartment['단지명'];
    axios
      .get(`http://localhost:8080/api/apartments/owner?name=${encodeURIComponent(aptName)}`)
      .then((res) => {
        // 백엔드가 { ownerId: "소유자아이디" } 형태로 응답한다고 가정
        setDbOwnerId(res.data.ownerId || null);
      })
      .catch((err) => {
        console.error(err);
        setError('DB에서 아파트 소유자 정보를 가져오는 중 오류가 발생했습니다.');
      });
  }, [apartment]);

  // 로그인 필요 함수
  const requireLogin = () => {
    const loggedInUser = getCookie('member');
    if (!loggedInUser || !loggedInUser.memberId || !loggedInUser.accessToken) {
      alert('로그인이 필요합니다.');
      setIsLoginModalOpen(true);
      return false;
    }
    return true;
  };

  // 찜하기/해제
  const handleFavorite = async () => {
    if (!requireLogin()) return;

    try {
      const aptName = apartment['단지명'];
      const loggedInUser = getCookie('member');
      const headers = {
        Authorization: `Bearer ${loggedInUser.accessToken}`,
        memberId: encodeURIComponent(String(loggedInUser.memberId)),
      };

      if (isFavorite) {
        await axios.delete(
          `http://localhost:8080/api/favorite-apartments/${encodeURIComponent(aptName)}`,
          { headers },
        );
        setIsFavorite(false);
      } else {
        await axios.post(
          `http://localhost:8080/api/favorite-apartments/${encodeURIComponent(aptName)}`,
          {},
          { headers },
        );
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('찜 기능 오류:', error);
      setError('관심 매물 기능을 처리하는 중 오류가 발생했습니다.');
    }
  };

  // 찜 목록 보기
  const handleViewFavorites = () => {
    if (!requireLogin()) return;
    navigate('/estate/favorite-apartments');
  };

  if (loading) return <p className="sd-loading">로딩 중...</p>;
  if (!apartment) return <p className="sd-error">해당 아파트 정보를 찾을 수 없습니다.</p>;

  // 연도별 거래금액 데이터 구성
  const priceData = apartment.prices
    ? Object.keys(apartment.prices)
      .filter((year) => apartment.prices[year] !== null)
      .map((year) => ({
        year: parseInt(year, 10),
        price: apartment.prices[year],
      }))
    : [];

  return (
    <div className="sd-container">
      <h1 className="sd-title">{apartment['단지명']}</h1>

      {apartment.image ? (
        <img className="sd-image" src={apartment.image} alt={`${apartment['단지명']} 이미지`} />
      ) : (
        <p className="sd-no-image">이미지가 없습니다.</p>
      )}

      <p className="sd-info">
        <strong>도로명:</strong> {apartment['도로명']}
      </p>
      <p className="sd-info">
        <strong>전용 면적:</strong> {apartment['전용면적(㎡)']}㎡
      </p>
      <p className="sd-info">
        <strong>최신 거래가:</strong> {(apartment['거래금액(만원)'] / 10000).toFixed(2)}억
      </p>
      <p className="sd-info">
        <strong>변동률:</strong>{' '}
        {apartment['변동률(%)'] !== null ? (
          <span
            style={{
              color: apartment['변동률(%)'] > 0 ? 'green' : 'red',
            }}
          >
            {apartment['변동률(%)']}%
          </span>
        ) : (
          '정보 없음'
        )}
      </p>
      <p className="sd-info">
        <strong>3.3㎡당 가격:</strong>{' '}
        {apartment['거래금액(만원)'] && apartment['전용면적(㎡)']
          ? (apartment['거래금액(만원)'] / apartment['전용면적(㎡)'] / 3.3 / 1000).toFixed(2) + '억'
          : '정보 없음'}
      </p>

      {/* ★ DB에서 가져온 ownerId 표시 */}
      <p className="sd-info">
        <strong>소유자(ownerId):</strong> {dbOwnerId ? dbOwnerId : '미등록'}
      </p>

      <div className="sd-buttons">
        <button
          className="sd-btn toggle"
          onClick={handleFavorite}
          style={{
            background: isFavorite ? '#ffc107' : '#ff4d4d',
            color: isFavorite ? '#000' : '#fff',
          }}
        >
          {isFavorite ? '관심매물 해제' : '관심매물 등록'}
        </button>
        <button className="sd-btn view" onClick={handleViewFavorites}>
          찜목록 보기
        </button>
      </div>
      {error && <p className="sd-error">{error}</p>}

      {priceData.length > 0 ? (
        <div className="sd-chart-container">
          <h3 className="sd-chart-title">연도별 가격 변동</h3>
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
        <p className="sd-empty">가격 데이터가 부족합니다.</p>
      )}

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};

export default SearchDetails;
