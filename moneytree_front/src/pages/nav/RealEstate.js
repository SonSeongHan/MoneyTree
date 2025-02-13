import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import KakaoMap from '../estate/KakaoMap';
import LoginModal from '../../components/LoginModal';
import axios from 'axios';
import { getCookie } from '../../util/cookieUtil';
import { FaSearch, FaMapMarkedAlt, FaStar, FaBuilding, FaHandshake } from 'react-icons/fa';
import '../../css/estate/RealEstateNav.css';

const RealEstate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // pending 거래 건수 상태
  const [buyerPendingCount, setBuyerPendingCount] = useState(0);
  const [sellerPendingCount, setSellerPendingCount] = useState(0);

  const loggedInUser = getCookie('member');
  const userId = loggedInUser?.memberId || '';

  // pending 거래 건수를 가져오는 함수
  useEffect(() => {
    if (!userId) return;
    const headers = {
      Authorization: `Bearer ${loggedInUser.accessToken}`,
      memberId: encodeURIComponent(String(userId)),
    };
    Promise.all([
      axios.get(
        `http://localhost:8080/api/apartment-transactions/buyer/${encodeURIComponent(String(userId))}`,
        { headers },
      ),
      axios.get(
        `http://localhost:8080/api/apartment-transactions/seller/${encodeURIComponent(String(userId))}`,
        { headers },
      ),
    ])
      .then(([buyerRes, sellerRes]) => {
        const buyerCount = buyerRes.data.filter((tx) => tx.status === 'PENDING').length;
        const sellerCount = sellerRes.data.filter((tx) => tx.status === 'PENDING').length;
        setBuyerPendingCount(buyerCount);
        setSellerPendingCount(sellerCount);
      })
      .catch((err) => {
        console.error('Pending 거래 건수 조회 오류:', err);
      });
  }, [userId, loggedInUser]);

  // "관심 매물" 클릭 시 로그인 여부 확인 후 처리
  const handleFavoriteNav = (e) => {
    e.preventDefault();
    if (!loggedInUser || !loggedInUser.memberId || !loggedInUser.accessToken) {
      alert('로그인이 필요합니다.');
      setIsLoginModalOpen(true);
    } else {
      navigate('/estate/favorite-apartments');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🏡 부동산 정보 페이지</h2>
      <p>부동산 관련 매물을 검색하고 커뮤니티에 참여하세요.</p>

      {/* 네비게이터 */}
      <nav className="real-estate-nav">
        <div className="nav-links">
          <Link to="/realestate/search" className="nav-link">
            <FaSearch className="nav-icon" /> 아파트 검색
          </Link>
          <Link to="/realestate/map" className="nav-link">
            <FaMapMarkedAlt className="nav-icon" /> 지도 보기
          </Link>
          <Link to="/estate/transactions" className="nav-link">
            <FaHandshake className="nav-icon" /> 매물 거래
          </Link>
          <Link to="/estate/favorite-apartments" className="nav-link">
            <FaStar className="nav-icon" /> 관심 매물
          </Link>
          <Link to="/community/estate" className="nav-link">
            <FaBuilding className="nav-icon" /> 부동산 커뮤니티
          </Link>
        </div>
        {/* 로그인한 경우에만 우측에 pending 건수 표시 */}
        {loggedInUser && (
          <div className="nav-pending-indicator">
            매수 대기중: <span className="pending-count">{buyerPendingCount}</span>건 | 매도 대기중:{' '}
            <span className="pending-count">{sellerPendingCount}</span>건
          </div>
        )}
      </nav>

      {location.pathname === '/realestate' ? <KakaoMap /> : <Outlet />}

      {isLoginModalOpen && (
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      )}
    </div>
  );
};

export default RealEstate;
