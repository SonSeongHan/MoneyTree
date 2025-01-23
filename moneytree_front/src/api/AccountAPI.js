
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/accounts';

/**
 * 계좌 생성 API 호출 함수
 * @param {Object} accountData - 계좌 생성에 필요한 데이터
 * @returns {Promise} - Axios Promise 객체
 */
export const createAccount = async (accountData) => {
    try {
        const response = await axios.post(API_BASE_URL, accountData, {
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
