// src/api/MemberAPI.js
import axios from "axios";
import { API_SERVER_HOST } from "./todoApi";

const host = `${API_SERVER_HOST}/api/members`; // Member API 경로

// Axios 기본 설정: 쿠키를 포함한 요청 설정
const memberAxios = axios.create({
  baseURL: host,
  withCredentials: true, // 쿠키 기반 인증
  headers: {
    "Content-Type": "application/json",
  },
});

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

// 이름 변경 API
export const changeName = async (nameData) => {
  return memberAxios.post(`/changeName`, nameData);
};

/**
 * 로그인 API: JSON 방식 전송
 * 백엔드에서는 CustomLoginFilter에서 "memberId"와 "memberpassword" 파라미터를 읽습니다.
 * 추가로, 정회원의 경우 residentRegistrationNumber 파라미터를 전달할 수 있습니다.
 */
export const loginPost = async (loginParam) => {
  const header = { headers: { "Content-Type": "application/json" } };

  // loginParam 객체에는 memberId, memberpassword, (옵션 residentRegistrationNumber) 가 포함되어야 합니다.
  const res = await axios.post(`${host}/login`, loginParam, header);
  return res.data;
};

// 만약 다른 로그인 방식이 필요하다면 별도의 함수를 추가할 수 있습니다.
// 회원 탈퇴 API
export const withdrawMember = async (memberId, withdrawalReason = "사용자탈퇴") => {
  return memberAxios.delete(`/${memberId}/withdraw`, { params: { withdrawalReason } });
};

// 재활성화 API 추가
export const reactivateMember = async (memberId, password) => {
  // 예: 재활성화 API 엔드포인트는 POST /api/members/{memberId}/reactivate 라고 가정
  return memberAxios.post(`/${memberId}/reactivate`, { password });
};
