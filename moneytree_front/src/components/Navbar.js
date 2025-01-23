import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getCookie, removeCookie } from '../util/cookieUtil'; // removeCookie 추가
import '../css/navbar.css';

function NavBar() {
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const [memberName, setMemberName] = useState(""); // 사용자 이름 상태
  const navigate = useNavigate(); // 로그아웃 후 리다이렉트를 위한 useNavigate

  useEffect(() => {
    // 쿠키에서 사용자 정보 가져오기
    const memberData = getCookie('member');
    console.log("쿠키 데이터 확인:", memberData);

    if (memberData && typeof memberData === "object") {
      // 이미 파싱된 객체일 경우
      setMemberName(memberData.member_name || "사용자");
    } else if (memberData && typeof memberData === "string") {
      try {
        const parsedMember = JSON.parse(memberData); // 문자열이면 파싱
        console.log("파싱된 데이터:", parsedMember);
        setMemberName(parsedMember.member_name || "사용자");
      } catch (error) {
        console.error("쿠키 파싱 실패:", error);
        setMemberName("사용자");
      }
    } else {
      console.warn("쿠키에서 사용자 정보를 찾을 수 없습니다.");
      setMemberName("사용자");
    }
  }, []);

  const toggleProductDropdown = () => {
    setShowProductDropdown((prev) => !prev);
    setShowCommunityDropdown(false);
  };

  const toggleCommunityDropdown = () => {
    setShowCommunityDropdown((prev) => !prev);
    setShowProductDropdown(false);
  };

  // 로그아웃 함수
  const handleLogout = () => {
    removeCookie("member"); // 쿠키 삭제
    alert("로그아웃되었습니다.");
    navigate("/"); // 홈 페이지로 리다이렉트
  };

  return (
      <nav className="navbar">
        {/* 로고 */}
        <div className="navbar-logo">
          <NavLink to="/">로고</NavLink>
        </div>

        {/* 메뉴 */}
        <ul className="navbar-menu">
          <li>
            <NavLink to="/mypage">마이페이지</NavLink>
          </li>
          <li className="navbar-menu-item" onClick={toggleProductDropdown}>
            상품소개
            {showProductDropdown && (
                <ul className="dropdown">
                  <li><NavLink to="/products/deposit-saving">예금/적금</NavLink></li>
                  <li><NavLink to="/products/installment-saving">펀드/주식</NavLink></li>
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

        {/* 우측 */}
        <div className="navbar-right">
          <span className="navbar-username">{memberName}</span>
          <button className="navbar-logout" onClick={handleLogout}>로그아웃</button>
        </div>
      </nav>
  );
}

export default NavBar;
