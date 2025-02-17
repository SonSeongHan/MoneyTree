import axios, { baseURL } from '../util/jwtUtil';

const SAVING_API_BASE_URL = `${baseURL}/api/saving-products`;

const SavingAPI = {

  // 전체 적금 조회
  getAllSavingProducts: async () => {
    try {
      const response = await axios.get(`${SAVING_API_BASE_URL}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all savings:', error);
      throw error;
    }
  },

  // 아이디로 조회
  getSavingProductById: async (savingProductId) => {
    try {
      const response = await axios.get(`${SAVING_API_BASE_URL}/${savingProductId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching saving by ID:', error);
      throw error;
    }
  },

  // 은행명으로 조회
  getSavingProductsByBankName: async (savingBankName) => {
    try {
      const response = await axios.get(`${SAVING_API_BASE_URL}/bank`, {
        params: { savingBankName },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching savings by bank name:', error);
      throw error;
    }
  },

  // 최소 금액으로 조회
  getSavingProductsByMinAmount: async (savingMinAmount) => {
    try {
      const response = await axios.get(`${SAVING_API_BASE_URL}/min-amount`, {
        params: { savingMinAmount },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching savings by min amount:', error);
      throw error;
    }
  },

  // 이율로 조회
  getSavingProductsByInterestRateType: async (savingInterestRateType) => {
    try {
      const response = await axios.get(`${SAVING_API_BASE_URL}/interest-rate-type`, {
        params: { savingInterestRateType },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching savings by interest rate type:', error);
      throw error;
    }
  },

  // 이율 범위로 조회
  getSavingProductsByBaseInterestRateRange: async (minRate, maxRate) => {
    try {
      const response = await axios.get(`${SAVING_API_BASE_URL}/base-interest-rate-range`, {
        params: { minSavingBaseInterestRate: minRate, maxSavingBaseInterestRate: maxRate },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching savings by base interest rate range:', error);
      throw error;
    }
  },

  // 우대 이율로 조회
  getSavingProductsByPrimeInterestRate: async (minPrimeRate) => {
    try {
      const response = await axios.get(`${SAVING_API_BASE_URL}/prime-interest-rate`, {
        params: { minSavingPrimeInterestRate: minPrimeRate },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching savings by prime interest rate:', error);
      throw error;
    }
  },

  // 생성
  createSavingProduct: async (savingProductDTO) => {
    try {
      const response = await axios.post(`${SAVING_API_BASE_URL}`, savingProductDTO);
      return response.data;
    } catch (error) {
      console.error('Error creating saving product:', error);
      throw error;
    }
  },

  // 수정
  updateSavingProduct: async (id, savingProductDTO) => {
    try {
      const response = await axios.put(`${SAVING_API_BASE_URL}/${id}`, savingProductDTO);
      return response.data;
    } catch (error) {
      console.error('Error updating saving product:', error);
      throw error;
    }
  },

  // 삭제
  deleteSavingProduct: async (id) => {
    try {
      await axios.delete(`${SAVING_API_BASE_URL}/${id}`);
    } catch (error) {
      console.error('Error deleting saving product:', error);
      throw error;
    }
  }
};

export default SavingAPI;
