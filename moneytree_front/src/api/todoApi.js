import jwtAxios from '../util/jwtUtil';

export const API_SERVER_HOST = 'http://localhost:8080';
const prefix = '/api/todo'; // baseURL이 설정되어 있으므로 호스트 제거
const gamePrefix = `/categories/games`;

// 공통 API 호출 함수 수정
const fetchData = async (url, params = {}) => {
  try {
    const res = await jwtAxios.get(url, { params });
    return res.data;
  } catch (error) {
    console.error('API 호출 에러:', error);
    throw error;
  }
};

