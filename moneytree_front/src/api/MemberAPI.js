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

// 로그인 API (첫 번째 방식: FormData 사용, email/pw 방식)
export const loginPost = async (loginParam) => {
  const header = { headers: { "Content-Type": "application/x-www-form-urlencoded" } };

  const form = new FormData();
  form.append("username", loginParam.email); // username에 이메일 추가
  form.append("password", loginParam.pw); // password에 비밀번호 추가

  const res = await axios.post(`${host}/login`, form, header);
  return res.data;
};

// 로그인 API (두 번째 방식: FormData 사용, member_id/member_password 방식)
export const login = async (loginData) => {
  const form = new FormData();
  form.append("member_id", loginData.member_id);
  form.append("member_password", loginData.member_password);
  form.append("membershipType", loginData.membershipType);

  const header = { headers: { "Content-Type": "application/x-www-form-urlencoded" } };
  return memberAxios.post(`/login`, form, header);
};

// 회원 탈퇴 API
export const withdrawMember = async (memberId, withdrawalReason = "사용자탈퇴") => {
  return memberAxios.delete(`/${memberId}/withdraw`, { params: { withdrawalReason } });
};

// 재활성화 API 추가
export const reactivateMember = async (memberId, password) => {
  // 예: 재활성화 API 엔드포인트는 POST /api/members/{memberId}/reactivate 라고 가정
  return memberAxios.post(`/${memberId}/reactivate`, { password });
};
