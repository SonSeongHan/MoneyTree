import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import KakaoMap from '../estate/KakaoMap'; // 지도를 불러오기 위해 추가

function RealEstate() {
  const location = useLocation(); // 현재 경로 확인

  return (
    <div style={{ padding: '20px' }}>
      <h2>🏡 부동산 정보 페이지</h2>
      <p>부동산 관련 매물을 검색하고 커뮤니티에 참여하세요.</p>

      {/* 네비게이션 추가 */}
      <nav style={{ marginBottom: '20px' }}>
        <Link
          to="/realestate/search"
          style={{ marginRight: '15px', textDecoration: 'none', fontWeight: 'bold' }}
        >
          📌 아파트 검색
        </Link>
        <Link
          to="/realestate/map"
          style={{ marginRight: '15px', textDecoration: 'none', fontWeight: 'bold' }}
        >
          🗺 지도 보기
        </Link>
        <Link to="/community/estate" style={{ textDecoration: 'none', fontWeight: 'bold' }}>
          🏢 부동산 커뮤니티
        </Link>
      </nav>

      {/* 기본 화면을 KakaoMap(지도)으로 설정, 다른 페이지에서는 Outlet 렌더링 */}
      {location.pathname === '/realestate' ? <KakaoMap /> : <Outlet />}
    </div>
  );
}

export default RealEstate;
