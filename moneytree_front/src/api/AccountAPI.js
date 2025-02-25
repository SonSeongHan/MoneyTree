import axios from 'axios';

// 로컬 개발 환경 기준 예시 URL
const API_BASE_URL = 'http://localhost:8080/api/accounts';

/**
 * 계좌 생성 API 호출 함수
 */
export const createAccount = async (accountData) => {
  try {
    const response = await axios.post(API_BASE_URL, accountData, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || '계좌 생성 중 오류가 발생했습니다.';
  }
};

/**
 * 계좌 소유주(이름) 확인
 * GET /api/accounts/ownerName?accountId=xxx
 */
export const getOwnerName = async (accountId) => {
  const response = await axios.get(`${API_BASE_URL}/ownerName`, {
    params: { accountId },
  });
  return response.data; // 문자열(계좌주 이름)
};

/**
 * 송금 API (fromMemberName / toMemberName 버전)
 *
 * @param {string} senderMemberId   - 보내는 사람(로그인 회원ID)
 * @param {string} receiverAccountId- 받는 계좌 번호
 * @param {string} password         - 송금 계좌 비밀번호
 * @param {number} amount           - 송금 금액
 * @param {string} depositPurpose   - 송금 목적(메모)
 * @param {string} fromMemberName   - 보내는 사람 닉네임 / 이름
 * @param {string} toMemberName     - 받는 사람 닉네임 / 이름
 */
export const transferMoney = async (
  senderMemberId,
  receiverAccountId,
  password,
  amount,
  depositPurpose,
  fromMemberName,
  toMemberName,
) => {
  const body = {
    senderMemberId,
    receiverAccountId,
    password,
    amount: Number(amount),
    depositPurpose,
    fromMemberName, // 기존 senderNickname → fromMemberName
    toMemberName, // 기존 receiverNickname → toMemberName
  };

  try {
    const response = await axios.post(`${API_BASE_URL}/transfer`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || '송금 중 오류가 발생했습니다.';
  }
};

/**
 * 입금(충전) API (fromMemberName 버전)
 *
 * @param {string} memberId        - 본인 회원 ID
 * @param {string} password        - 계좌 비밀번호
 * @param {number} amount          - 충전 금액
 * @param {string} depositPurpose  - 충전 목적(메모)
 * @param {string} fromMemberName  - 내 닉네임 (입금 시 표시할 이름)
 */
export const depositMoney = async (memberId, password, amount, depositPurpose, fromMemberName) => {
  const body = {
    memberId,
    password,
    amount: Number(amount),
    depositPurpose,
    fromMemberName, // 기존 senderNickname → fromMemberName
  };

  try {
    const response = await axios.post(`${API_BASE_URL}/deposit`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || '입금 중 오류가 발생했습니다.';
  }
};
