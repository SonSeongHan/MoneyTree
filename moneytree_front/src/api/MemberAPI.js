import axios from "axios";

const BASE_URL = "http://localhost:8080/api/members";

export const login = async (loginData) => {
  return axios.post(`${BASE_URL}/login`, loginData);
};

export const createMember = async (memberData) => {
  return axios.post(`${BASE_URL}/make`, memberData);
};

export const updateMember = async (id, memberData) => {
  return axios.put(`${BASE_URL}/modify/${id}`, memberData);
};

export const deleteMember = async (id) => {
  return axios.delete(`${BASE_URL}/delete/${id}`);
};

/**
 * 계좌 생성 API 호출 함수
 * @param {Object} accountData - 계좌 생성에 필요한 데이터
 * @returns {Promise} - Axios Promise 객체
 */
export const createAccount = async (accountData) => {
  try {
    const response = await axios.post(BASE_URL, accountData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data; // 성공 시 응답 데이터 반환
  } catch (error) {
    // 에러 처리 (필요 시 커스터마이징)
    throw error.response?.data || '계좌 생성 중 오류가 발생했습니다.';
  }
};