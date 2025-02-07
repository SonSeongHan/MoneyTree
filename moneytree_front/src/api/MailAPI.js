// src/api/MailAPI.js
import axios from "axios";
import { API_SERVER_HOST } from "./todoApi"; // API 서버 호스트 (예: http://localhost:8080)

const host = `${API_SERVER_HOST}/api/mail`; // Mail API 기본 경로

// Axios 인스턴스 생성
const mailAxios = axios.create({
    baseURL: host,
    withCredentials: true, // 쿠키 사용이 필요하다면 활성화
    headers: {
        "Content-Type": "application/json",
    },
});

// 인증번호 이메일 발송 API 호출 함수
// 이메일 값을 백엔드에 전달합니다.
export const sendVerificationEmail = async (email) => {
    return mailAxios.post("/send-verification", null, { params: { email } });
};

// 인증번호 검증 API 호출 함수
// 이메일과 사용자가 입력한 인증번호를 백엔드에 전달합니다.
export const verifyCode = async (email, code) => {
    return mailAxios.post("/verify", null, { params: { email, code } });
};
