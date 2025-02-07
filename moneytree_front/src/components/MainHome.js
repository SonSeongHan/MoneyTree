// src/components/PromotionalPage.js

import React from "react";
import { useNavigate } from "react-router-dom";

const PromotionalPage = () => {
    const navigate = useNavigate();

    // "가입하기" 버튼 클릭 시 회원가입 페이지로 이동
    const handleSignUp = () => {
        navigate("/loginpage");
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>자산 관리의 새로운 시작</h1>
                <p style={styles.subtitle}>
                    당신의 자산을 안전하게 관리하고, 더 나은 미래를 설계하세요.
                </p>
            </header>
            <section style={styles.section}>
                {/* 홍보용 이미지 (서비스에 맞는 이미지 URL 사용) */}
                <img
                    style={styles.image}
                    src="https://via.placeholder.com/400x300.png?text=%EC%9E%90%EC%82%B0%EA%B4%80%EB%A6%AC"
                    alt="자산관리 홍보 이미지"
                />
                <div style={styles.content}>
                    <h2>왜 우리와 함께해야 할까요?</h2>
                    <ul>
                        <li>맞춤형 자산 관리 솔루션 제공</li>
                        <li>최신 보안 기술로 안전한 거래</li>
                        <li>전문가와의 1:1 상담 지원</li>
                        <li>투명하고 간편한 금융 관리</li>
                    </ul>
                    <button style={styles.button} onClick={handleSignUp}>
                        가입하기
                    </button>
                </div>
            </section>
            <footer style={styles.footer}>
                <p>© 2025 자산관리 서비스. All rights reserved.</p>
            </footer>
        </div>
    );
};

const styles = {
    container: {
        fontFamily: "'Helvetica Neue', sans-serif",
        margin: 0,
        padding: 0,
        textAlign: "center",
        color: "#333",
    },
    header: {
        background: "linear-gradient(135deg, #4e54c8, #8f94fb)",
        padding: "2rem",
        color: "#fff",
    },
    title: {
        fontSize: "2.5rem",
        margin: "0.5rem 0",
    },
    subtitle: {
        fontSize: "1.2rem",
        margin: "0.5rem 0",
    },
    section: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "2rem",
        justifyContent: "center",
        flexWrap: "wrap",
    },
    image: {
        width: "400px",
        maxWidth: "90%",
        borderRadius: "8px",
        margin: "1rem",
    },
    content: {
        maxWidth: "500px",
        margin: "1rem",
        textAlign: "left",
    },
    button: {
        marginTop: "1rem",
        padding: "0.75rem 1.5rem",
        fontSize: "1rem",
        backgroundColor: "#4e54c8",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
    footer: {
        backgroundColor: "#f1f1f1",
        padding: "1rem",
        marginTop: "2rem",
    },
};

export default PromotionalPage;
