import axios from 'axios';
import jwtAxios, { baseURL } from '../util/jwtUtil';

const STOCK_API_BASE_URL = `${baseURL}/api/stock-products`;
const STOCK_TRADING_API_BASE_URL = `${baseURL}/api/stock-controller`;
const DANDWAC_API_BASE_URL = `${baseURL}/api/accounts`;

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

  // --------------------------------- 주식 계좌 관련 ---------------------------------

  // 주식 계좌 생성
  // createStockAccount: async (memberId) => {
  //   try {
  //     const response = await axios.post(`${STOCK_TRADING_API_BASE_URL}/account-create`, null, {
  //       params: { dandwAcId: memberId }  // memberId를 직접 사용
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error creating stock account:', error);
  //     throw error;
  //   }
  // },

  createStockAccount: async () => {
    try {
      const response = await jwtAxios.post(`${STOCK_TRADING_API_BASE_URL}/account-create`);
      return response.data;
    } catch (error) {
      console.error('Error creating stock account:', error);
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
      return null; // 계좌가 없을 경우 null 반환
    }
  },

  // 입출금 계좌 잔액 조회
  getDandwacBalance: async (dandwAcId) => {
    try {
      const response = await jwtAxios.get(`${DANDWAC_API_BASE_URL}/balance/${dandwAcId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching deposit account balance:', error);
      return 0; // 잔액이 없거나 오류 발생 시 0 반환
    }
  },

  // 입출금계좌에서 주식계좌로 입금
  depositToStockAccount: async (dandwAcId, stockAccountNumber, amount) => {
    try {
      const response = await axios.post(
        `${STOCK_TRADING_API_BASE_URL}/dandwac-stock/deposit`,
        null,
        {
          params: {
            dandwAcId,
            stockAccountNumber,
            amount,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error depositing to stock account:', error);
      throw error;
    }
  },

  // 주식계좌에서 입출금계좌로 출금
  withdrawFromStockAccount: async (stockAccountNumber, dandwAcId, amount) => {
    try {
      const response = await axios.post(
        `${STOCK_TRADING_API_BASE_URL}/stock-dandwac/withdraw`,
        null,
        {
          params: {
            stockAccountNumber,
            dandwAcId,
            amount,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error withdrawing from stock account:', error);
      throw error;
    }
  },

  // 주식 계좌 정보 조회
  getStockAccount: async (accountNumber) => {
    try {
      // 입출금 계좌번호로 주식계좌 조회
      const response = await jwtAxios.get(`${STOCK_TRADING_API_BASE_URL}/account/${accountNumber}`);
      console.log(accountNumber);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock account details:', error);
      throw error;
    }
  },

  // 주식 매수
  buyStock: async (stockAccountNumber, stockProductId, quantity, price) => {
    try {
      const response = await axios.post(`${STOCK_TRADING_API_BASE_URL}/trade/buy`, null, {
        params: {
          stockAccountNumber,
          stockProductId,
          quantity,
          price,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error buying stock:', error);
      throw error;
    }
  },

  // 주식 매도
  sellStock: async (stockAccountNumber, stockProductId, quantity) => {
    try {
      const response = await axios.post(`${STOCK_TRADING_API_BASE_URL}/trade/sell`, null, {
        params: {
          stockAccountNumber,
          stockProductId,
          quantity,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error selling stock:', error);
      throw error;
    }
  },

  // 보유 주식 목록 조회
  getStockHoldings: async (accountNumber) => {
    try {
      const response = await axios.get(`${STOCK_TRADING_API_BASE_URL}/holdings/${accountNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock holdings:', error);
      throw error;
    }
  },
};
export default StockAPI;
