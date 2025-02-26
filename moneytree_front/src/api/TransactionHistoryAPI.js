// src/api/TransactionHistoryAPI.js
import axios from "axios";

const BASE_URL = "http://localhost:8080/api/transactions";

/**
 * 회원의 거래 내역을 가져옵니다.
 * @param {string} memberId - 회원 식별자
 * @param {number} [months=1] - 조회할 기간(개월 수, 기본값: 1)
 * @returns {Promise<Array>} 거래 내역 리스트를 포함하는 Promise
 */
const getTransactionsForMember = (memberId, months = 1, membershipType) => {
  return axios
    .get(`${BASE_URL}/member/${memberId}`, {
      params: { months, membershipType },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("거래 내역 조회에 실패했습니다.", error);
      throw error;
    });
};


export default {
  getTransactionsForMember,
};
