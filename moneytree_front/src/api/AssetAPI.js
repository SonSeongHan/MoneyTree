// src/api/AssetAPI.js
import jwtAxios, { baseURL } from '../util/jwtUtil';
import DepositAPI from './DepositAPI';
import SavingAPI from './SavingAPI';
import FundAPI from './FundAPI';
import StockAPI from './StockAPI';

const DANDWAC_API_BASE_URL = `${baseURL}/api/accounts`;

const AssetAPI = {
  /**
   * 사용자의 전체 자산 정보를 가져오는 함수
   * 1. 입출금 계좌 정보
   * 2. 예금 계좌 정보
   * 3. 적금 계좌 정보
   * 4. 펀드 계좌 정보
   * 5. 주식 계좌 정보
   * @returns {Promise<Object>} 총 자산과 각 상품별 자산 비율 정보
   */
  getUserAssets: async () => {
    try {
      // 1. 입출금 계좌 정보 가져오기
      const dandwAcId = await getDandwAcId();
      const dandwacBalance = await getDandwAcBalance(dandwAcId);

      // 2. 예금 계좌 정보 가져오기
      const depositAccounts = await getDepositAccounts();
      const depositBalance = calculateTotalBalance(depositAccounts, 'depositAmount');

      // 3. 적금 계좌 정보 가져오기
      const savingAccounts = await getSavingAccounts();
      const savingBalance = calculateTotalBalance(savingAccounts, 'savingDepositAmount');

      // 4. 펀드 계좌 정보 가져오기
      const fundAccounts = await getFundAccounts(dandwAcId);
      const fundBalance = calculateTotalBalance(fundAccounts, 'fundInvestmentAmount');

      // 5. 주식 계좌 정보 가져오기
      const stockAccount = await getStockAccount(dandwAcId);
      const stockHoldings = await getStockHoldings(stockAccount?.stockAccountNumber);
      const stockBalance = calculateStockBalance(stockAccount, stockHoldings);

      // 6. 대출 정보 (현재는 더미 데이터, 실제 구현 시 API 호출 필요)
      const loanBalance = -5000000; // 음수로 표시 (부채)

      // 종합 자산 정보 생성
      const totalAssets = dandwacBalance + depositBalance + savingBalance + fundBalance + stockBalance;
      const netAssets = totalAssets + loanBalance; // 대출은 이미 음수

      // 자산 분포 데이터 생성
      const assetDistribution = [
        {
          name: '입출금',
          value: dandwacBalance,
          ratio: calculatePercentage(dandwacBalance, totalAssets),
          color: '#FF6384'
        },
        {
          name: '예금',
          value: depositBalance,
          ratio: calculatePercentage(depositBalance, totalAssets),
          color: '#36A2EB'
        },
        {
          name: '적금',
          value: savingBalance,
          ratio: calculatePercentage(savingBalance, totalAssets),
          color: '#FFCE56'
        },
        {
          name: '펀드',
          value: fundBalance,
          ratio: calculatePercentage(fundBalance, totalAssets),
          color: '#4BC0C0'
        },
        {
          name: '주식',
          value: stockBalance,
          ratio: calculatePercentage(stockBalance, totalAssets),
          color: '#9966FF'
        },
        {
          name: '대출',
          value: loanBalance,
          ratio: calculatePercentage(loanBalance, totalAssets) * -1, // 대출은 음수 비율로 표시
          color: '#FF9F40'
        }
      ];

      return {
        totalAssets,
        netAssets,
        assetDistribution
      };
    } catch (error) {
      console.error('자산 정보 조회 실패:', error);
      throw error;
    }
  }
};

// 입출금 계좌 ID 가져오기
const getDandwAcId = async () => {
  try {
    const memberId = localStorage.getItem('memberId');
    if (!memberId) throw new Error('로그인 정보가 없습니다.');

    const response = await jwtAxios.get(`${DANDWAC_API_BASE_URL}/account-number/${memberId}`);
    return response.data;
  } catch (error) {
    console.error('입출금 계좌 조회 실패:', error);
    throw error;
  }
};

// 입출금 계좌 잔액 가져오기
const getDandwAcBalance = async (dandwAcId) => {
  try {
    if (!dandwAcId) return 0;

    const response = await jwtAxios.get(`${DANDWAC_API_BASE_URL}/balance/${dandwAcId}`);
    return parseFloat(response.data) || 0;
  } catch (error) {
    console.error('입출금 계좌 잔액 조회 실패:', error);
    return 0;
  }
};

// 예금 계좌 정보 가져오기
const getDepositAccounts = async () => {
  try {
    const response = await DepositAPI.getMyDepositAccounts();
    return response?.accounts || [];
  } catch (error) {
    console.error('예금 계좌 조회 실패:', error);
    return [];
  }
};

// 적금 계좌 정보 가져오기
const getSavingAccounts = async () => {
  try {
    const response = await SavingAPI.getMySavingAccounts();
    return response?.accounts || [];
  } catch (error) {
    console.error('적금 계좌 조회 실패:', error);
    return [];
  }
};

// 펀드 계좌 정보 가져오기
const getFundAccounts = async (dandwAcId) => {
  try {
    if (!dandwAcId) return [];

    const response = await FundAPI.getFundAccount(dandwAcId);
    return Array.isArray(response) ? response : [response].filter(Boolean);
  } catch (error) {
    console.error('펀드 계좌 조회 실패:', error);
    return [];
  }
};

// 주식 계좌 정보 가져오기
const getStockAccount = async (dandwAcId) => {
  try {
    if (!dandwAcId) return null;

    const response = await StockAPI.getStockAccount(dandwAcId);
    return response;
  } catch (error) {
    console.error('주식 계좌 조회 실패:', error);
    return null;
  }
};

// 주식 보유 내역 가져오기
const getStockHoldings = async (stockAccountNumber) => {
  try {
    if (!stockAccountNumber) return [];

    const response = await StockAPI.getStockHoldings(stockAccountNumber);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('주식 보유내역 조회 실패:', error);
    return [];
  }
};

// 계좌 목록에서 총 잔액 계산 (예금, 적금, 펀드)
const calculateTotalBalance = (accounts, balanceKey) => {
  if (!accounts || !Array.isArray(accounts) || accounts.length === 0) return 0;

  return accounts.reduce((total, account) => {
    const balance = parseFloat(account[balanceKey] || 0);
    return total + (isNaN(balance) ? 0 : balance);
  }, 0);
};

// 주식 총 가치 계산 (계좌 잔액 + 주식 보유 가치)
const calculateStockBalance = (stockAccount, stockHoldings) => {
  let balance = 0;

  // 주식 계좌 잔액
  if (stockAccount && stockAccount.stockAccountBalance) {
    balance += parseFloat(stockAccount.stockAccountBalance);
  }

  // 보유 주식 가치
  if (stockHoldings && Array.isArray(stockHoldings) && stockHoldings.length > 0) {
    const holdingsValue = stockHoldings.reduce((total, holding) => {
      const quantity = holding.stockHoldingQuantity || 0;
      const price = holding.stockClosingPrice || 0; // 현재가로 계산
      return total + (quantity * price);
    }, 0);

    balance += holdingsValue;
  }

  return balance;
};

// 백분율 계산
const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return parseFloat(((value / total) * 100).toFixed(1));
};

export default AssetAPI;