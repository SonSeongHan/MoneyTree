import axios, { baseURL } from '../util/jwtUtil';

const DEPOSIT_API_BASE_URL = `${baseURL}/api/deposit-products`;

const DepositAPI = {
  // 모든 예금 상품 가져오기
  getAllDeposits: async () => {
    try {
      const response = await axios.get(`${DEPOSIT_API_BASE_URL}/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all deposits : ', error);
      throw error;
    }
  },

  // 특정 예금 상품 가져오기
  getDepositById: async (depositProductId) => {
    try {
      const response = await axios.get(`${DEPOSIT_API_BASE_URL}/${depositProductId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching deposit by ID:', error);
      throw error;
    }
  },

  // 최소 금액 이상 예금 상품 가져오기
  getDepositsByMinAmount: async (minAmount) => {
    try {
      const response = await axios.get(`${DEPOSIT_API_BASE_URL}/min-amount`, {
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
      const response = await axios.get(`${DEPOSIT_API_BASE_URL}/interest-rate-type`, {
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
      const response = await axios.get(`${DEPOSIT_API_BASE_URL}/base-interest-rate`, {
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
      const response = await axios.get(`${DEPOSIT_API_BASE_URL}/prime-interest-rate`, {
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
      const response = await axios.get(`${DEPOSIT_API_BASE_URL}/maturity-period`, {
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
      const response = await axios.get(`${DEPOSIT_API_BASE_URL}/search`, {
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

};

export default DepositAPI;
