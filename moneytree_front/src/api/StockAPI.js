import axios, { baseURL } from '../util/jwtUtil';

const STOCK_API_BASE_URL = `${baseURL}/api/stock-products`;

const StockAPI = {
  // 최신 주식 데이터를 페이지별로 가져오기 (무한 스크롤 지원)
  getStocksByPage: async (page, limit = 10) => {
    try {
      const response = await axios.get(`${STOCK_API_BASE_URL}/latest`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching stocks for page ${page}:`, error);
      throw error;
    }
  },

  // 상승률 TOP N 조회
  getTopRisingStocks: async (limit = 10) => {
    try {
      const response = await axios.get(`${STOCK_API_BASE_URL}/top-rising`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top rising stocks:', error);
      throw error;
    }
  },

  // 하락률 TOP N 조회
  getTopFallingStocks: async (limit = 10) => {
    try {
      const response = await axios.get(`${STOCK_API_BASE_URL}/top-falling`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top falling stocks:', error);
      throw error;
    }
  },

  // 최소 거래량 필터 적용
  getStocksByTradingVolume: async (minTradingVolume) => {
    try {
      const response = await axios.get(`${STOCK_API_BASE_URL}/by-trading-volume`, {
        params: { minTradingVolume },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stocks by trading volume:', error);
      throw error;
    }
  },

  // 시가총액 필터 적용
  getStocksByMarketCap: async (minMarketCap) => {
    try {
      const response = await axios.get(`${STOCK_API_BASE_URL}/by-market-cap`, {
        params: { minMarketCap },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stocks by market cap:', error);
      throw error;
    }
  },

  // 특정 시장(KOSPI, KOSDAQ) 조회
  getStocksByMarketCategory: async (stockProductMarketCategory) => {
    try {
      const response = await axios.get(`${STOCK_API_BASE_URL}/by-market`, {
        params: { stockProductMarketCategory },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stocks by market category:', error);
      throw error;
    }
  },

  // 종목명 검색 (부분 검색 포함)
  searchStockProductsByName: async (stockProductName) => {
    try {
      const response = await axios.get(`${STOCK_API_BASE_URL}/search`, {
        params: { stockProductName },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching stock products by name:', error);
      throw error;
    }
  },
};

export default StockAPI;
