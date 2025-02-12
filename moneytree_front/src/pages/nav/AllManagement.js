// src/components/AllManagement.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCookie } from "../../util/cookieUtil"; // 쿠키에서 회원 정보를 가져오는 유틸
import { withdrawMember } from "../../api/MemberAPI"; // 백엔드와 연동된 회원 탈퇴 API 함수

function AllManagement() {
    // 회원 정보 상태 관리
    const [memberInfo, setMemberInfo] = useState({
        memberId: "",
        memberName: "",
        membershipType: "",
    });

    const navigate = useNavigate();

    // 쿠키에서 회원 정보를 불러와 상태에 저장
    useEffect(() => {
        const memberCookie = getCookie("member");
        if (memberCookie) {
            setMemberInfo({
                memberId: memberCookie.memberId || "알 수 없음",
                memberName: memberCookie.member_name || "알 수 없음",
                membershipType: memberCookie.membershipType || "알 수 없음",
            });
        }
    }, []);

    // 쿠키 삭제 함수 (지정한 이름의 쿠키를 삭제)
    const deleteCookie = (name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    };

    // 회원 탈퇴 API 호출 함수
    const handleWithdraw = async () => {
        // 탈퇴 전 사용자 확인
        if (!window.confirm("정말로 회원 탈퇴하시겠습니까?")) {
            return;
        }
        try {
            // 백엔드의 탈퇴 API 호출 (탈퇴 사유는 기본값 "사용자탈퇴"로 전달)
            await withdrawMember(memberInfo.memberId);
            // 쿠키 삭제 (회원 정보를 담고 있는 "member" 쿠키 삭제)
            deleteCookie("member");
            alert("회원 탈퇴가 완료되었습니다.");
            // 탈퇴 후 홈 페이지 또는 로그인 페이지로 이동 (원하는 페이지로 수정 가능)
            navigate("/");
        } catch (error) {
            console.error("회원 탈퇴 중 오류 발생:", error);
            alert("회원 탈퇴 중 오류가 발생했습니다.");
        }
    };

    return (
        <div style={styles.container}>
            {/* 상단 회원 정보 */}
            <div style={styles.memberInfo}>
                <h1>회원 정보</h1>
                <p>
                    <strong>아이디:</strong> {memberInfo.memberId}
                </p>
                <p>
                    <strong>이름:</strong> {memberInfo.memberName}
                </p>
                <p>
                    <strong>회원 유형:</strong> {memberInfo.membershipType}
                </p>
            </div>

            {/* 메뉴 버튼 영역 */}
            <div style={styles.menuContainer}>
                <Link to="/change-password" style={styles.linkButton}>
                    비밀번호 변경
                </Link>
                <Link to="/change-name" style={styles.linkButton}>
                    이름 변경
                </Link>
                <Link to="/make-account" style={styles.linkButton}>
                    계좌생성
                </Link>
                <Link to="/reissue-certificate" style={styles.linkButton}>
                    인증서 발급
                </Link>
                {/* 회원 탈퇴 버튼 */}
                <button onClick={handleWithdraw} style={styles.withdrawButton}>
                    회원 탈퇴
                </button>
            </div>
        </div>
    );
}

export default AllManagement;

// 컴포넌트 내 사용되는 스타일 객체
const styles = {
    container: {
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    memberInfo: {
        marginBottom: "40px",
        textAlign: "center",
    },
    menuContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "20px",
    },
    linkButton: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "180px",
        height: "60px",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "4px",
        textDecoration: "none",
        color: "#000",
        fontSize: "16px",
        fontWeight: "bold",
    },
    withdrawButton: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "180px",
        height: "60px",
        backgroundColor: "#ff4d4f",
        border: "none",
        borderRadius: "4px",
        color: "#fff",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
    },
};
