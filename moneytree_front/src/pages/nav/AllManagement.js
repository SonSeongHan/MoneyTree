import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCookie } from "../../util/cookieUtil"; // 쿠키 유틸 가져오기

function AllManagement() {
    // 회원 정보 상태 관리
    const [memberInfo, setMemberInfo] = useState({
        memberId: "",
        memberName: "",
        membershipType: "",
    });

    // 쿠키에서 회원 정보 가져오기
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

    return (
        <div style={styles.container}>
            {/* 상단 회원 정보 */}
            <div style={styles.memberInfo}>
                <h1>회원 정보</h1>
                <p><strong>아이디:</strong> {memberInfo.memberId}</p>
                <p><strong>이름:</strong> {memberInfo.memberName}</p>
                <p><strong>회원 유형:</strong> {memberInfo.membershipType}</p>
            </div>

            {/* 메뉴 버튼 */}
            <div style={styles.menuContainer}>
                <Link to="/change-password" style={styles.linkButton}>
                    비밀번호 변경
                </Link>
                <Link to="/change-name" style={styles.linkButton}>
                    이름 변경
                </Link>
                <Link to="/change-id" style={styles.linkButton}>
                    계좌생성
                </Link>
                <Link to="/reissue-certificate" style={styles.linkButton}>
                    인증서 발급
                </Link>
            </div>
        </div>
    );
}

export default AllManagement;

// 스타일 정의
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
        gridTemplateColumns: "1fr 1fr",
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
};
