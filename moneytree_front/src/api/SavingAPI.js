import axios from 'axios'; // 일반 axios
import jwtAxios, { baseURL } from '../util/jwtUtil'; // JWT 인증 포함된 axios

const SAVING_PRODUCT_API_URL = `${baseURL}/api/saving-products`;
const SAVING_ACCOUNT_API_URL = `${baseURL}/api/saving-accounts`;
const SAVING_TERMINATION_API_URL = `${baseURL}/api/saving-terminations`;

const SavingAPI = {
  // 모든 적금 상품 가져오기
  getAllSavingProducts: async () => {
    try {
      const response = await axios.get(SAVING_PRODUCT_API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching all savings:', error);
      throw error;
    }
  },

  // 특정 적금 상품 가져오기
  getSavingProductById: async (savingProductId) => {
    try {
      const response = await axios.get(`${SAVING_PRODUCT_API_URL}/${savingProductId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching saving by ID:', error);
      throw error;
    }
  },

  // 은행별 적금 상품 가져오기
  getSavingProductsByBankName: async (bankName) => {
    try {
      const response = await axios.get(`${SAVING_PRODUCT_API_URL}/bank`, {
        params: { savingBankName: bankName },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching savings by bank name:', error);
      throw error;
    }
  },

  // 최소 금액 이상 적금 상품 가져오기
  getSavingProductsByMinAmount: async (minAmount) => {
    try {
      const response = await axios.get(`${SAVING_PRODUCT_API_URL}/min-amount`, {
        params: { savingMinAmount: minAmount },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching savings by min amount:', error);
      throw error;
    }
  },

  // 이율 유형별 적금 상품 가져오기
  getSavingProductsByInterestRateType: async (interestRateType) => {
    try {
      const response = await axios.get(`${SAVING_PRODUCT_API_URL}/interest-rate-type`, {
        params: { savingInterestRateType: interestRateType },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching savings by interest rate type:', error);
      throw error;
    }
  },

  // 기본 이자율 범위 내 적금 상품 가져오기
  getSavingProductsByBaseInterestRateRange: async (minRate, maxRate) => {
    try {
      const response = await axios.get(`${SAVING_PRODUCT_API_URL}/base-interest-rate-range`, {
        params: {
          minSavingBaseInterestRate: minRate,
          maxSavingBaseInterestRate: maxRate,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching savings by base interest rate range:', error);
      throw error;
    }
  },

  // 우대 이자율 이상 적금 상품 가져오기
  getSavingProductsByPrimeInterestRate: async (minPrimeRate) => {
    try {
      const response = await axios.get(`${SAVING_PRODUCT_API_URL}/prime-interest-rate`, {
        params: { minSavingPrimeInterestRate: minPrimeRate },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching savings by prime interest rate:', error);
      throw error;
    }
  },

  // 전체 필터링 검색
  searchSavings: async (searchParams) => {
    try {
      const response = await axios.get(`${SAVING_PRODUCT_API_URL}/search`, {
        params: {
          bankName: searchParams.bankName,
          savingMinAmount: searchParams.minAmount,
          savingInterestRateType:
            searchParams.savingType === 'simple'
              ? '단리'
              : searchParams.savingType === 'compound'
                ? '복리'
                : undefined,
          minSavingBaseInterestRate: searchParams.minInterestRate,
          maxSavingBaseInterestRate: searchParams.maxInterestRate,
          minSavingPrimeInterestRate: searchParams.primeRate,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching savings:', error);
      throw error;
    }
  },

  // 적금 계좌 생성 (상품 가입)
  createSavingAccount: async (accountData) => {
    try {
      const response = await jwtAxios.post(`${SAVING_ACCOUNT_API_URL}/create`, accountData);
      return response.data;
    } catch (error) {
      console.error('Error creating saving account:', error);
      throw error;
    }
  },

  // 내 적금 계좌 목록 조회
  getMySavingAccounts: async () => {
    try {
      const response = await jwtAxios.get(`${SAVING_ACCOUNT_API_URL}/my-accounts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my saving accounts:', error);
      throw error;
    }
  },

  // 적금 계좌 해지
  terminateSavingAccount: async (accountNumber, reason) => {
    try {
      const response = await jwtAxios.post(`${SAVING_ACCOUNT_API_URL}/${accountNumber}/terminate`, {
        reason,
      });
      return response.data;
    } catch (error) {
      console.error('Error terminating saving account:', error);
      throw error;
    }
  },

  // 해지된 적금 계좌 내역 조회
  getMyTerminations: async () => {
    try {
      const response = await jwtAxios.get(`${SAVING_TERMINATION_API_URL}/my-terminations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching saving terminations:', error);
      throw error;
    }
  },

  // 특정 계좌의 해지 내역 조회
  getTerminationByAccountNumber: async (accountNumber) => {
    try {
      const response = await jwtAxios.get(`${SAVING_TERMINATION_API_URL}/${accountNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching termination by account number:', error);
      throw error;
    }
  },
};

export default SavingAPI;
