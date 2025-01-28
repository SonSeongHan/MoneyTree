import axios, { baseURL } from '../util/jwtUtil';

const DEPOSIT_API_BASE_URL = `${baseURL}/api/deposit-products`;

// 모든 예금 상품 가져오기
export const fetchAllDeposits = async () => {
  try {
    const response = await axios.get(`${DEPOSIT_API_BASE_URL}/all`); // 일반 axios 사용
    return response.data;
  } catch (error) {
    console.error('Error fetching all deposits : ', error);
    throw error;
  }
};

// 특정 예금 상품 가져오기
export const fetchDepositById = async (id) => {
  try {
    const response = await axios.get(`${DEPOSIT_API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching deposit by ID:', error);
    throw error;
  }
};

// 최소 금액 이상 예금 상품 가져오기
export const fetchDepositsByMinAmount = async (minAmount) => {
  try {
    const response = await axios.get(`${DEPOSIT_API_BASE_URL}/filter-by-min-amount`, {
      params: { depositMinAmount: minAmount },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching deposits by min amount : ', error);
    throw error;
  }
};

// 이율 유형별 예금 상품 가져오기
export const fetchDepositsByInterestRateType = async (interestRateType) => {
  try {
    const response = await axios.get(`${DEPOSIT_API_BASE_URL}/filter-by-interest-rate-type`, {
      params: { depositInterestRateType: interestRateType },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching deposits by interest rate type:', error);
    throw error;
  }
};

// 기본 이자율 범위 내 예금 상품 가져오기
export const fetchDepositsByBaseInterestRateRange = async (minRate, maxRate) => {
  try {
    const response = await axios.get(`${DEPOSIT_API_BASE_URL}/filter-by-base-interest-rate`, {
      params: { minDepositBaseInterestRate: minRate, maxDepositBaseInterestRate: maxRate },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching deposits by base interest rate range:', error);
    throw error;
  }
};

// 최고 우대 이자율 이상 예금 상품 가져오기
export const fetchDepositsByPrimeInterestRate = async (minPrimeRate) => {
  try {
    const response = await axios.get(`${DEPOSIT_API_BASE_URL}/filter-by-prime-interest-rate`, {
      params: { minDepositPrimeInterestRate: minPrimeRate },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching deposits by prime interest rate:', error);
    throw error;
  }
};
