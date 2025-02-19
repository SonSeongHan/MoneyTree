import axios from 'axios';
import jwtAxios, { baseURL } from '../util/jwtUtil';

const FUND_API_BASE_URL = `${baseURL}/api/fund-products`;
const FUND_ACCOUNT_API_BASE_URL = `${baseURL}/api/fund-account`;
const DANDWAC_API_BASE_URL = `${baseURL}/api/accounts`;

const FundAPI = {
  // 기존 펀드 상품 관련 API
  getAllFunds: async () => {
    try {
      const response = await axios.get(`${FUND_API_BASE_URL}/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all funds:', error);
      throw error;
    }
  },

  getFundsByPage: async (page, limit = 10) => {
    try {
      const response = await axios.get(`${FUND_API_BASE_URL}/all`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching funds for page ${page}:`, error);
      throw error;
    }
  },

  getFundById: async (fundProductId) => {
    try {
      const response = await axios.get(`${FUND_API_BASE_URL}/${fundProductId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fund by ID:', error);
      throw error;
    }
  },

  getFundsByYear: async (fundProductYear) => {
    try {
      const response = await axios.get(`${FUND_API_BASE_URL}/year`, {
        params: { fundProductYear },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching funds by year:', error);
      throw error;
    }
  },

  getFundsByTotalAmountRange: async (minAmount, maxAmount) => {
    try {
      const response = await axios.get(`${FUND_API_BASE_URL}/total-amount`, {
        params: { minFundTotalAmount: minAmount, maxFundTotalAmount: maxAmount },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching funds by total amount range:', error);
      throw error;
    }
  },

  getFundsByManagementFee: async (minManagementFee) => {
    try {
      const response = await axios.get(`${FUND_API_BASE_URL}/management-fee`, {
        params: { minFundManagementFee: minManagementFee },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching funds by management fee:', error);
      throw error;
    }
  },

  getFundsByRedemptionFee: async (maxRedemptionFee) => {
    try {
      const response = await axios.get(`${FUND_API_BASE_URL}/redemption-fee`, {
        params: { maxFundRedemptionFee: maxRedemptionFee },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching funds by redemption fee:', error);
      throw error;
    }
  },

  getFilteredFunds: async (filters) => {
    try {
      const validFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== undefined)
      );
      const response = await axios.get(`${FUND_API_BASE_URL}/filter`, { params: validFilters });
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered funds:', error);
      throw error;
    }
  },

  // -------------- 펀드 계좌 관련 API --------------

  // 펀드 계좌 생성
  createFundAccount: async () => {
    try {
      const response = await jwtAxios.post(`${FUND_ACCOUNT_API_BASE_URL}/account-create`);

      // 전체 응답 로그
      console.log('펀드 계좌 생성 API 응답:', response);
      console.log('응답 데이터:', response.data);

      return response.data;
    } catch (error) {
      console.error('펀드 계좌 생성 중 API 에러:', error);
      console.error('에러 응답:', error.response);
      throw error;
    }
  },

  // 해당 회원의 입출금 계좌번호 가져오기
  getDandwacAccountNumber: async (memberId) => {
    try {
      const response = await jwtAxios.get(`${DANDWAC_API_BASE_URL}/account-number/${memberId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching deposit account number:', error);
      return null;
    }
  },

  // 입출금 계좌 잔액 조회
  getDandwacBalance: async (dandwAcId) => {
    try {
      const response = await jwtAxios.get(`${DANDWAC_API_BASE_URL}/balance/${dandwAcId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching deposit account balance:', error);
      return 0;
    }
  },

  // 펀드 계좌 정보 조회
  getFundAccount: async (accountNumber) => {
    try {
      const response = await jwtAxios.get(`${FUND_ACCOUNT_API_BASE_URL}/account/${accountNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fund account details:', error);
      throw error;
    }
  },

  // 펀드 투자
  investInFund: async (dandwAcId, fundProductId, investmentAmount) => {
    try {
      const response = await axios.post(`${FUND_ACCOUNT_API_BASE_URL}/invest`, {
        dandwAcId,
        fundProductId,
        investmentAmount
      });
      return response.data;
    } catch (error) {
      console.error('Error investing in fund:', error);
      throw error;
    }
  },

  // 펀드 환매 가능 여부 확인
  checkRedemptionEligibility: async (fundAccountNumber) => {
    try {
      const response = await axios.get(`${FUND_ACCOUNT_API_BASE_URL}/redeem/check/${fundAccountNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error checking redemption eligibility:', error);
      throw error;
    }
  },

  // 펀드 환매
  redeemFund: async (fundAccountNumber, amount) => {
    try {
      const response = await axios.post(`${FUND_ACCOUNT_API_BASE_URL}/redeem`, {
        fundAccountNumber,
        amount
      });
      return response.data;
    } catch (error) {
      console.error('Error redeeming fund:', error);
      throw error;
    }
  },

  // 예상 수익금 계산
  calculateExpectedProfit: async (fundAccountNumber) => {
    try {
      const response = await jwtAxios.get(`${FUND_ACCOUNT_API_BASE_URL}/expected-profit/${fundAccountNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error calculating expected profit:', error);
      throw error;
    }
  },

  // 환매 금액 계산
  calculateRedemptionAmount: async (fundAccountNumber, amount) => {
    try {
      const response = await jwtAxios.get(`${FUND_ACCOUNT_API_BASE_URL}/redemption-amount`, {
        params: { fundAccountNumber, amount }
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating redemption amount:', error);
      throw error;
    }
  },

  // 만기까지 남은 일수 조회
  getRemainingDays: async (fundAccountNumber) => {
    try {
      const response = await jwtAxios.get(`${FUND_ACCOUNT_API_BASE_URL}/remaining-days/${fundAccountNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error getting remaining days:', error);
      throw error;
    }
  }
};

export default FundAPI;