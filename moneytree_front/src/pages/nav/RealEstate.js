import React from 'react';
import { Link, Outlet } from 'react-router-dom';

function RealEstate() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>🏡 부동산 정보 페이지</h2>
      <p>부동산 관련 정보를 검색하고 커뮤니티에 참여하세요.</p>

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

      {/* 하위 라우트 페이지를 렌더링 */}
      <Outlet />
    </div>
  );
}

export default RealEstate;
