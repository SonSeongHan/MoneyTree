// src/api/MemberAPI.js
import axios from "axios";
import { API_SERVER_HOST } from "./todoApi";

const host = `${API_SERVER_HOST}/api/members`; // Member API 경로

// Axios 기본 설정: 인증 헤더 제거하고, 쿠키를 포함한 요청 설정
const memberAxios = axios.create({
  baseURL: host,
  withCredentials: true, // 쿠키 기반 인증
  headers: {
    "Content-Type": "application/json",
  },
});

// 로그인 API


// 회원 생성 API
export const createMember = async (memberData) => {
  return memberAxios.post(`/make`, memberData);
};

// 비밀번호 변경 API
export const changePassword = async (passwordData) => {
  return memberAxios.post(`/changePassword`, passwordData);
};

// 아이디 변경 API
export const changeId = async (idData) => {
  return memberAxios.post(`/changeId`, idData);
};

export const changeName = async (nameData) => {
  return memberAxios.post(`/changeName`, nameData);
};