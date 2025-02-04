import axios, { baseURL } from '../util/jwtUtil';

const FUND_API_BASE_URL = `${baseURL}/api/fund-products`;

const FundAPI = {

  // 모든 펀드 상품 가져오기
  getAllFunds: async () => {
    try {
      const response = await axios.get(`${FUND_API_BASE_URL}/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all funds:', error);
      throw error;
    }
  },

  // 페이지별 펀드 데이터 가져오기 -> 10개씩
  getFundsByPage: async (page, limit = 10) => {
    try {
      const response = await axios.get(`${FUND_API_BASE_URL}/all`, {
        params: { page, limit },  // 페이지 & 개수 제한 추가
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching funds for page ${page}:`, error);
      throw error;
    }
  },

  // 특정 펀드 상품 가져오기
  getFundById: async (fundProductId) => {
    try {
      const response = await axios.get(`${FUND_API_BASE_URL}/${fundProductId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fund by ID:', error);
      throw error;
    }
  },

  // 특정 연도의 펀드 조회
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

  // 펀드 총 규모 범위 내 조회
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

  // 운용 보수가 특정 값 이상인 펀드 조회
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

  // 환매 수수료가 특정 값 이하인 펀드 조회
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
};

export default FundAPI;
