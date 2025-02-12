// src/components/ReactivateAccount.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../../util/cookieUtil";
import { reactivateMember } from "../../api/MemberAPI";

function ReactivateAccount() {
    const [memberInfo, setMemberInfo] = useState({
        memberId: "",
        memberName: "",
    });
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // 쿠키에서 회원 정보를 불러옴
    useEffect(() => {
        const memberCookie = getCookie("member");
        if (memberCookie) {
            setMemberInfo({
                memberId: memberCookie.memberId || "",
                memberName: memberCookie.member_name || "",
            });
        }
    }, []);

    const handleReactivate = async () => {
        if (!window.confirm("계정을 재활성화 하시겠습니까?")) return;
        try {
            await reactivateMember(memberInfo.memberId, password);
            alert("계정이 재활성화되었습니다.");
            // 재활성화 후 로그인 페이지나 메인 페이지로 이동
            navigate("/");
        } catch (error) {
            console.error("재활성화 실패", error);
            alert("재활성화에 실패하였습니다: " + (error.response?.data || error.message));
        }
    };

    return (
        <div style={styles.container}>
            <h2>{memberInfo.memberName} 님, 계정이 비활성화되어 있습니다.</h2>
            <p>계정을 재활성화 하시겠습니까? 비밀번호를 입력해주세요.</p>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                style={styles.input}
            />
            <button onClick={handleReactivate} style={styles.button}>
                재활성화
            </button>
        </div>
    );
}

export default ReactivateAccount;

const styles = {
    container: {
        padding: "20px",
        maxWidth: "400px",
        margin: "0 auto",
        textAlign: "center",
    },
    input: {
        width: "100%",
        padding: "10px",
        margin: "10px 0",
        fontSize: "16px",
    },
    button: {
        width: "100%",
        padding: "10px",
        backgroundColor: "#28a745",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        fontSize: "16px",
        cursor: "pointer",
    },
};
