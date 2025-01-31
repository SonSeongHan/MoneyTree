import axios from "axios";
import { API_SERVER_HOST } from "./todoApi";

const host = `${API_SERVER_HOST}/api/members`; // Player API 경로
// Axios 기본 설정: 인증 헤더 제거하고, 쿠키를 포함한 요청 설정
const memberAxios = axios.create({
  baseURL: host,
  withCredentials: true, // 쿠키 기반 인증
  headers: {
    "Content-Type": "application/json",
  },
});

export const loginPost = async (loginParam) => {
  // HTTP POST 요청을 통해 FormData를 전송
  const header = { headers: { "Content-Type": "application/x-www-form-urlencoded" } };

  const form = new FormData();
  form.append("username", loginParam.email); // username에 이메일 추가
  form.append("password", loginParam.pw); // password에 비밀번호 추가

  const res = await axios.post(`${host}/login`, form, header);

  return res.data;
};


// 로그인 API
export const login = async (loginData) => {
  const form = new FormData();
  form.append("member_id", loginData.member_id);
  form.append("member_password", loginData.member_password);
  form.append("membershipType", loginData.membershipType);

  const header = { headers: { "Content-Type": "application/x-www-form-urlencoded" } };
  return memberAxios.post(`/login`, form, header);
};


// 회원 생성 API
export const createMember = async (memberData) => {
  return memberAxios.post(`/make`, memberData);
};
