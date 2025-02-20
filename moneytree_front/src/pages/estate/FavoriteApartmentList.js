import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getCookie } from '../../util/cookieUtil';
import '../../css/estate/FavoriteApartmentList.css';

const FavoriteApartmentList = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = getCookie('member');
    if (!loggedInUser || !loggedInUser.memberId || !loggedInUser.accessToken) {
      setError('로그인이 필요합니다.');
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
        console.log('FavoriteApartmentList GET 응답:', response.data);
        setFavorites(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('찜 목록 조회 오류:', err);
        setError('찜 목록 조회 중 오류가 발생했습니다.');
        setLoading(false);
      });
  }, []);

  const handleCancelFavorite = async (fav) => {
    const loggedInUser = getCookie('member');
    if (!loggedInUser || !loggedInUser.memberId || !loggedInUser.accessToken) {
      setError('로그인이 필요합니다.');
      return;
    }

    const headers = {
      Authorization: `Bearer ${loggedInUser.accessToken}`,
      memberId: encodeURIComponent(String(loggedInUser.memberId)),
    };

    try {
      await axios.delete(
        `http://localhost:8080/api/favorite-apartments/${encodeURIComponent(fav.apartmentName)}`,
        { headers },
      );
      setFavorites(favorites.filter((item) => item.id !== fav.id));
    } catch (err) {
      console.error('찜 취소 오류:', err);
      setError('찜 취소 처리 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <p className="fal-loading">로딩 중...</p>;
  if (error) return <p className="fal-error">{error}</p>;

  return (
    <div className="fal-container">
      <h2 className="fal-title">내 관심 매물</h2>
      {favorites.length === 0 ? (
        <p className="fal-empty">관심 매물이 없습니다.</p>
      ) : (
        <ul className="fal-list">
          {favorites.map((fav) => (
            <li key={fav.id} className="fal-item">
              <div
                className="fal-info"
                onClick={() =>
                  navigate(`/realestate/details/${encodeURIComponent(fav.apartmentName)}`)
                }
              >
                <div className="fal-name">
                  <span className="fal-label">단지명: </span>
                  <span className="fal-value">{fav.apartmentName}</span>
                </div>
                <div className="fal-detail-item">
                  <span className="fal-label">전용면적: </span>
                  <span className="fal-value">{fav.area ? fav.area + '㎡' : '정보 없음'}</span>
                </div>
                <div className="fal-detail-item">
                  <span className="fal-label">최신 거래가: </span>
                  <span className="fal-value">
                    {fav.currentPrice ? (fav.currentPrice / 10000).toFixed(2) + '억' : '정보 없음'}
                  </span>
                </div>
                <small className="fal-date">
                  등록일: {new Date(fav.createdAt).toLocaleDateString()}
                </small>
              </div>
              <button className="fal-cancel-btn" onClick={() => handleCancelFavorite(fav)}>
                관심매물 해제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FavoriteApartmentList;
