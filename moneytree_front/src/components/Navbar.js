import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import '../css/navbar.css';

function NavBar() {
  const [cookies, setCookie, removeCookie] = useCookies(["member"]);
  const [showProductDropdown, setShowProductDropdown] = React.useState(false);
  const [showCommunityDropdown, setShowCommunityDropdown] = React.useState(false);
  const navigate = useNavigate();

  // 쿠키의 member 데이터가 변경될 때마다 memberName을 업데이트
  const memberData = cookies.member;
  let memberName = "사용자";
  if (memberData) {
    try {
      const parsedMember = typeof memberData === "string" ? JSON.parse(memberData) : memberData;
      memberName = parsedMember.member_name || "사용자";
    } catch (error) {
      console.error("쿠키 파싱 실패:", error);
    }
  }

  const toggleProductDropdown = () => {
    setShowProductDropdown((prev) => !prev);
    setShowCommunityDropdown(false);
  };

  const toggleCommunityDropdown = () => {
    setShowCommunityDropdown((prev) => !prev);
    setShowProductDropdown(false);
  };

  const handleLogout = () => {
    removeCookie("member", { path: "/" });
    alert("로그아웃되었습니다.");
    navigate("/");
  };

  return (
      <nav className="navbar">
        <div className="navbar-logo">
          <NavLink to="/home">로고</NavLink>
        </div>
        <ul className="navbar-menu">
          <li>
            <NavLink to="/mypage">마이페이지</NavLink>
          </li>
          <li className="navbar-menu-item" onClick={toggleProductDropdown}>
            상품소개
            {showProductDropdown && (
                <ul className="dropdown">
                  <li><NavLink to="/products/deposit-saving">예금/적금</NavLink></li>
                  <li><NavLink to="/products/fund-stock">펀드/주식</NavLink></li>
                </ul>
            )}
          </li>
          <li><NavLink to="/realestate">부동산</NavLink></li>
          <li className="navbar-menu-item" onClick={toggleCommunityDropdown}>
            커뮤니티
            {showCommunityDropdown && (
                <ul className="dropdown">
                  <li><NavLink to="/community/hobby">취미 커뮤니티</NavLink></li>
                  <li><NavLink to="/community/real-estate">부동산 커뮤니티</NavLink></li>
                </ul>
            )}
          </li>
        </ul>
        <div className="navbar-right">
          <NavLink to="/allmanagement" className="navbar-username">{memberName}</NavLink>
          <button className="navbar-logout" onClick={handleLogout}>로그아웃</button>
        </div>
      </nav>
  );
}

export default NavBar;
