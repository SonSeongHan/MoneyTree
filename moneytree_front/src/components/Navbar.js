import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../css/navbar.css'; // 스타일 별도 적용 가능

function NavBar() {
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);

  const toggleProductDropdown = () => {
    setShowProductDropdown((prev) => !prev);
    setShowCommunityDropdown(false);
  };

  const toggleCommunityDropdown = () => {
    setShowCommunityDropdown((prev) => !prev);
    setShowProductDropdown(false);
  };

  return (
    <nav className="navbar">
      {/* 로고 (홈 링크) */}
      <div className="navbar-logo">
        <NavLink to="/">로고</NavLink>
      </div>

      {/* 좌측 메뉴 */}
      <ul className="navbar-menu">
        <li>
          <NavLink to="/mypage">마이페이지</NavLink>
        </li>

        {/* 상품소개 드롭다운 */}
        <li className="navbar-menu-item" onClick={toggleProductDropdown}>
          상품소개
          {showProductDropdown && (
            <ul className="dropdown">
              <li>
                <NavLink to="/products/deposit-saving">예금</NavLink>
              </li>
              <li>
                <NavLink to="/products/installment-saving">적금</NavLink>
              </li>
            </ul>
          )}
        </li>

        <li>
          <NavLink to="/realestate">부동산</NavLink>
        </li>

        {/* 커뮤니티 드롭다운 */}
        <li className="navbar-menu-item" onClick={toggleCommunityDropdown}>
          커뮤니티
          {showCommunityDropdown && (
            <ul className="dropdown">
              <li>
                <NavLink to="/community/hobby">취미 커뮤니티</NavLink>
              </li>
              <li>
                <NavLink to="/community/real-estate">부동산 커뮤니티</NavLink>
              </li>
            </ul>
          )}
        </li>
      </ul>

      {/* 우측 - 사용자 이름, 로그아웃 버튼 */}
      <div className="navbar-right">
        <span className="navbar-username">사용자이름</span>
        <button className="navbar-logout">로그아웃</button>
      </div>
    </nav>
  );
}

export default NavBar;
