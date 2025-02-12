import axios from 'axios'; // 일반 axios
import jwtAxios, { baseURL } from '../util/jwtUtil'; // JWT 인증 포함된 axios

const DEPOSIT_PRODUCT_API_URL = `${baseURL}/api/deposit-products`;
const DEPOSIT_ACCOUNT_API_URL = `${baseURL}/api/deposit-accounts`;

const DepositAPI = {
  // 모든 예금 상품 가져오기
  getAllDeposits: async () => {
    try {
      const response = await axios.get(`${DEPOSIT_PRODUCT_API_URL}/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all deposits : ', error);
      throw error;
    }
  },

  // 특정 예금 상품 가져오기
  getDepositById: async (depositProductId) => {
    try {
      const response = await axios.get(`${DEPOSIT_PRODUCT_API_URL}/${depositProductId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching deposit by ID:', error);
      throw error;
    }
  },

  // 최소 금액 이상 예금 상품 가져오기
  getDepositsByMinAmount: async (minAmount) => {
    try {
      const response = await axios.get(`${DEPOSIT_PRODUCT_API_URL}/min-amount`, {
        params: { depositMinAmount: minAmount },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching deposits by min amount : ', error);
      throw error;
    }
  },

  // 이율 유형별 예금 상품 가져오기
  getDepositsByInterestRateType: async (interestRateType) => {
    try {
      const response = await axios.get(`${DEPOSIT_PRODUCT_API_URL}/interest-rate-type`, {
        params: { depositInterestRateType: interestRateType },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching deposits by interest rate type:', error);
      throw error;
    }
  },

  // 기본 이자율 범위 내 예금 상품 가져오기
  getDepositsByBaseInterestRateRange: async (minRate, maxRate) => {
    try {
      const response = await axios.get(`${DEPOSIT_PRODUCT_API_URL}/base-interest-rate`, {
        params: { minDepositBaseInterestRate: minRate, maxDepositBaseInterestRate: maxRate },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching deposits by base interest rate range:', error);
      throw error;
    }
  },

  // 최고 우대 이자율 이상 예금 상품 가져오기
  getDepositsByPrimeInterestRate: async (minPrimeRate) => {
    try {
      const response = await axios.get(`${DEPOSIT_PRODUCT_API_URL}/prime-interest-rate`, {
        params: { minDepositPrimeInterestRate: minPrimeRate },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching deposits by prime interest rate:', error);
      throw error;
    }
  },

  // 예치 기간 예금 상품 가져오기
  getDepositsByMaturityPeriod: async (maturityPeriod) => {
    try {
      const response = await axios.get(`${DEPOSIT_PRODUCT_API_URL}/maturity-period`, {
        params: { depositMaturityPeriod: maturityPeriod },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching deposits by maturity period:', error);
      throw error;
    }
  },

  // 전체 필터링
  searchDeposits: async (searchParams) => {
    try {
      const response = await axios.get(`${DEPOSIT_PRODUCT_API_URL}/search`, {
        params: {
          bankName: searchParams.bankName,
          depositMinAmount: searchParams.minAmount,
          depositInterestRateType: searchParams.depositType === 'simple' ? '단리' :
            searchParams.depositType === 'compound' ? '복리' : undefined,
          minDepositBaseInterestRate: searchParams.minInterestRate,
          maxDepositBaseInterestRate: searchParams.maxInterestRate,
          minDepositPrimeInterestRate: searchParams.primeRate,
          depositMaturityPeriod: searchParams.maturityPeriod
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching deposits:', error);
      throw error;
    }
  },

  // 예금 계좌 생성 (상품 가입)
  createDepositAccount: async (accountData) => {
    try {
      const response = await jwtAxios.post(`${DEPOSIT_ACCOUNT_API_URL}/create`, accountData);
      return response.data;
    } catch (error) {
      console.error('Error creating deposit account:', error);
      throw error;
    }
  },

  // 내 예금 계좌 목록 조회
  getMyDepositAccounts: async () => {
    try {
      const response = await jwtAxios.get(`${DEPOSIT_ACCOUNT_API_URL}/my-accounts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my deposit accounts:', error);
      throw error;
    }
  },

  // 예금 계좌 해지
  terminateDepositAccount: async (accountNumber, reason) => {
    try {
      const response = await jwtAxios.post(
        `${DEPOSIT_ACCOUNT_API_URL}/${accountNumber}/terminate`,
        { reason }
      );
      return response.data;
    } catch (error) {
      console.error('Error terminating deposit account:', error);
      throw error;
    }
  },

  // 정기 납입 설정
  setRegularPayment: async (accountNumber, regularAmount, paymentDay) => {
    try {
      const response = await jwtAxios.post(
        `${DEPOSIT_ACCOUNT_API_URL}/${accountNumber}/regular-payment`,
        { regularAmount, paymentDay }
      );
      return response.data;
    } catch (error) {
      console.error('Error setting regular payment:', error);
      throw error;
    }
  },

  // 정기 납입 해제
  cancelRegularPayment: async (accountNumber) => {
    try {
      const response = await jwtAxios.delete(
        `${DEPOSIT_ACCOUNT_API_URL}/${accountNumber}/regular-payment`
      );
      return response.data;
    } catch (error) {
      console.error('Error canceling regular payment:', error);
      throw error;
    }
  }
};

export default DepositAPI;