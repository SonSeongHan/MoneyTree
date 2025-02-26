import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import '../css/navbar.css';

function NavBar() {
    const [cookies, setCookie, removeCookie] = useCookies(["member"]);
    const [showProductDropdown, setShowProductDropdown] = React.useState(false);
    const [showCommunityDropdown, setShowCommunityDropdown] = React.useState(false);
    const [showMobileMenu, setShowMobileMenu] = React.useState(false);
    const navigate = useNavigate();

    // 쿠키에서 회원 정보 읽어오기
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

    const toggleMobileMenu = () => {
        setShowMobileMenu((prev) => !prev);
    };

    const handleLogout = () => {
        removeCookie("member", { path: "/" });
        alert("로그아웃되었습니다.");
        navigate("/");
    };

    return (
        <nav className="navbar">
            {/* 로고 영역 */}
            <div className="navbar-logo">
                <NavLink to="/home">로고</NavLink>
            </div>

            {/* PC/테블릿용 중앙 메뉴 (모바일에서는 숨김) */}
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
                <li>
                    <NavLink to="/realestate">부동산</NavLink>
                </li>
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

            {/* 우측 영역: 사용자 정보 및 (모바일용) 햄버거 버튼 */}
            <div className="navbar-right">
                <NavLink to="/allmanagement" className="navbar-username">{memberName}</NavLink>
                {/* PC/테블릿에서는 로그아웃 버튼을 보임 */}
                <button className="navbar-logout" onClick={handleLogout}>로그아웃</button>
                {/* 모바일에서만 보이는 햄버거 버튼 */}
                <button className="hamburger" onClick={toggleMobileMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            {/* 모바일 메뉴 (햄버거 버튼 클릭 시 표시) */}
            {showMobileMenu && (
                <div className="mobile-menu">
                    <ul>
                        <li><NavLink to="/mypage" onClick={() => setShowMobileMenu(false)}>마이페이지</NavLink></li>
                        <li>
                            <div onClick={toggleProductDropdown}>상품소개</div>
                            {showProductDropdown && (
                                <ul className="dropdown">
                                    <li><NavLink to="/products/deposit-saving" onClick={() => setShowMobileMenu(false)}>예금/적금</NavLink></li>
                                    <li><NavLink to="/products/fund-stock" onClick={() => setShowMobileMenu(false)}>펀드/주식</NavLink></li>
                                </ul>
                            )}
                        </li>
                        <li><NavLink to="/realestate" onClick={() => setShowMobileMenu(false)}>부동산</NavLink></li>
                        <li>
                            <div onClick={toggleCommunityDropdown}>커뮤니티</div>
                            {showCommunityDropdown && (
                                <ul className="dropdown">
                                    <li><NavLink to="/community/hobby" onClick={() => setShowMobileMenu(false)}>취미 커뮤니티</NavLink></li>
                                    <li><NavLink to="/community/real-estate" onClick={() => setShowMobileMenu(false)}>부동산 커뮤니티</NavLink></li>
                                </ul>
                            )}
                        </li>
                        <li><NavLink to="/allmanagement" onClick={() => setShowMobileMenu(false)}>사용자 페이지</NavLink></li>
                        <li><button onClick={handleLogout}>로그아웃</button></li>
                    </ul>
                </div>
            )}
        </nav>
    );
}

export default NavBar;
