import axios from 'axios';
import { getCookie } from '../util/cookieUtil';

const API_BASE_URL = 'http://localhost:8080/api/accounts';

/**
 * 계좌 생성 API 호출 함수
 */
export const createAccount = async (accountData) => {
    try {
        const response = await axios.post(API_BASE_URL, accountData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || '계좌 생성 중 오류가 발생했습니다.';
    }
};

export const getOwnerName = async (accountId) => {
    const response = await axios.get(`${API_BASE_URL}/ownerName`, {
        params: { accountId },
    });
    return response.data; // 문자열(이름)
};

/**
 * 송금 API 호출 함수
 * @param {string} receiverAccountId - 수신자 계좌 ID
 * @param {string} password - 송금 비밀번호
 * @param {number} amount - 송금 금액
 */
export const transferMoney = async (receiverAccountId, password, amount) => {
    const rawValue = getCookie('member'); // 이미 JSON 객체로 변환됨
    console.log('Raw Cookie Value:', rawValue);

    let senderMemberId = rawValue?.memberId || null; // 직접 객체에서 값 가져오기

    if (!senderMemberId) {
        throw '로그인 정보가 유효하지 않습니다.';
    }


    const body = {
        senderMemberId,
        receiverAccountId,
        password,
        amount: Number(amount) // 숫자로 변환
    };

    try {
        const response = await axios.post(`${API_BASE_URL}/transfer`, body, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || '송금 중 오류가 발생했습니다.';
    }
};
