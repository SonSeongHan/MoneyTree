import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../../util/cookieUtil';
import StockAPI from '../../api/StockAPI';
import '../../css/recommends/Stock.css';
import StockTradeModal from '../StockTradeModal';

const Stock = () => {
  const navigate = useNavigate();
  const [stockAccount, setStockAccount] = useState(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountError, setAccountError] = useState(null);

  const [allStocks, setAllStocks] = useState([]);
  const [displayStocks, setDisplayStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef(null);
  const itemsPerPage = 10;

  // 필터 상태
  const [marketCategory, setMarketCategory] = useState('');
  const [tradingVolume, setTradingVolume] = useState('');
  const [marketCap, setMarketCap] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);

  // 주식 거래
  const [selectedStock, setSelectedStock] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 주식 계좌 확인 함수
  const checkStockAccount = async () => {
    try {
      const memberCookie = getCookie('member');
      if (!memberCookie) {
        navigate('/loginpage');
        return;
      }
      const dandwAcId = await StockAPI.getDandwacAccountNumber(memberCookie.memberId);
      if (!dandwAcId) {
        setStockAccount(null);
      } else {
        const stockAccountInfo = await StockAPI.getStockAccount(dandwAcId);
        setStockAccount(stockAccountInfo);
      }
    } catch (err) {
      console.error('주식 계좌 확인 중 오류:', err);
      setAccountError('주식 계좌 정보를 불러오는 중 문제가 발생했습니다.');
    } finally {
      setAccountLoading(false);
    }
  };

  // 초기 데이터 불러오기 (30개)
  const fetchInitialStocks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await StockAPI.getStocksByPage(1, 30);
      const stocksData = Array.isArray(response) ? response : response?.content || [];
      setAllStocks(stocksData);
      setDisplayStocks(stocksData.slice(0, itemsPerPage));
      setHasMore(true);
    } catch (err) {
      console.error('Error fetching initial stocks:', err);
      setError('주식 데이터를 가져오는 중 문제가 발생하였습니다.');
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  // 필터 초기화: fetchInitialStocks 함수가 이미 선언된 후에 정의합니다.
  const resetFilters = useCallback(() => {
    setMarketCategory('');
    setTradingVolume('');
    setMarketCap('');
    setSearchInput('');
    setSearchQuery('');
    setSortBy('');
    setPage(1);
    setFilteredStocks([]);
    setIsFiltering(false);
    setHasMore(true);
    fetchInitialStocks();
  }, [fetchInitialStocks]);

  // sortBy 변경 시 데이터 fetching
  const fetchSortedStocks = useCallback(async () => {
    if (!sortBy) return;
    try {
      setLoading(true);
      let data;
      if (sortBy === 'rising') {
        data = await StockAPI.getTopRisingStocks(10);
      } else if (sortBy === 'falling') {
        data = await StockAPI.getTopFallingStocks(10);
      }
      const stocksData = Array.isArray(data) ? data : data?.content || [];
      setAllStocks(stocksData);
      setDisplayStocks(stocksData);
      setHasMore(false);
    } catch (err) {
      console.error('Error fetching sorted stocks:', err);
      setError('정렬된 데이터를 가져오는 중 문제가 발생하였습니다.');
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  // 필터링 적용 (검색어는 searchQuery 상태 사용)
  const applyFilters = useCallback(async () => {
    if (!marketCategory && !tradingVolume && !marketCap && !searchQuery) {
      setIsFiltering(false);
      setFilteredStocks([]);
      setDisplayStocks(allStocks.slice(0, page * itemsPerPage));
      return;
    }
    try {
      setLoading(true);
      setIsFiltering(true);
      let filteredData = [...allStocks];
      if (marketCategory) {
        const marketData = await StockAPI.getStocksByMarketCategory(marketCategory);
        filteredData = Array.isArray(marketData) ? marketData : marketData?.content || [];
      }
      if (tradingVolume) {
        const volumeData = await StockAPI.getStocksByTradingVolume(parseInt(tradingVolume));
        filteredData = filteredData.filter(stock =>
            volumeData.some(v => v.stockProductId === stock.stockProductId)
        );
      }
      if (marketCap) {
        const capData = await StockAPI.getStocksByMarketCap(parseInt(marketCap));
        filteredData = filteredData.filter(stock =>
            capData.some(c => c.stockProductId === stock.stockProductId)
        );
      }
      if (searchQuery) {
        const searchData = await StockAPI.searchStockProductsByName(searchQuery);
        filteredData = searchData;
      }
      setFilteredStocks(filteredData);
      setHasMore(false);
    } catch (error) {
      console.error('Error applying filters:', error);
      setError('필터 적용 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [marketCategory, tradingVolume, marketCap, searchQuery, allStocks, page, itemsPerPage]);

  // 검색 버튼 클릭 시 검색어 상태 업데이트
  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  // 엔터키 입력 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    checkStockAccount();
  }, []);

  useEffect(() => {
    if (stockAccount) {
      if (!sortBy) {
        fetchInitialStocks();
      }
    }
  }, [stockAccount, fetchInitialStocks, sortBy]);

  useEffect(() => {
    if (sortBy) {
      fetchSortedStocks();
    }
  }, [sortBy, fetchSortedStocks]);

  useEffect(() => {
    const filterTimer = setTimeout(() => {
      if (!sortBy) {
        applyFilters();
      }
    }, 500);
    return () => clearTimeout(filterTimer);
  }, [applyFilters, sortBy]);

  useEffect(() => {
    if (!isFiltering && !sortBy && allStocks.length > 0) {
      const endIndex = page * itemsPerPage;
      setDisplayStocks(allStocks.slice(0, endIndex));
      setHasMore(endIndex < allStocks.length);
    }
  }, [page, isFiltering, allStocks, sortBy, itemsPerPage]);

  const lastStockElementRef = useCallback((node) => {
    if (loading || !hasMore || isFiltering || sortBy) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, isFiltering, sortBy]);

  if (accountLoading) {
    return <div className="stock-loading">로딩 중...</div>;
  }
  if (accountError) {
    return <div className="stock-error">{accountError}</div>;
  }
  if (!stockAccount) {
    return (
        <div className="no-stock-account-container">
          <h2>주식 계좌가 없습니다</h2>
          <p>투자를 시작하려면 주식 계좌를 개설해주세요.</p>
          <button
              className="create-stock-account-btn"
              onClick={() => navigate('/create-stock-account')}
          >
            주식 계좌 개설하기
          </button>
        </div>
    );
  }
  if (loading && displayStocks.length === 0) return <p className="stock-loading-state">로딩 중입니다...</p>;
  if (error) return <p className="stock-error-state">{error}</p>;
  if (!displayStocks || displayStocks.length === 0) {
    return <p className="stock-empty-state">표시할 주식 상품이 없습니다.</p>;
  }

  const stocks = filteredStocks.length > 0 ? filteredStocks : displayStocks;

  const handleStockClick = (stock) => {
    setSelectedStock(stock);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStock(null);
  };

  return (
      <div className="stock-container">
        <div className="filter-container">
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
                className="filter-select"
                value={marketCategory}
                onChange={(e) => setMarketCategory(e.target.value)}
            >
              <option value="">시장 선택</option>
              <option value="KOSPI">KOSPI</option>
              <option value="KOSDAQ">KOSDAQ</option>
            </select>
            <input
                type="number"
                className="filter-input"
                placeholder="최소 거래량"
                value={tradingVolume}
                onChange={(e) => setTradingVolume(e.target.value)}
            />
            <input
                type="number"
                className="filter-input"
                placeholder="최소 시가총액"
                value={marketCap}
                onChange={(e) => setMarketCap(e.target.value)}
            />
            <input
                type="text"
                className="filter-input"
                placeholder="종목명 검색"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button className="filter-search-btn" onClick={handleSearch}>
              검색
            </button>
            <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                  setFilteredStocks([]);
                }}
            >
              <option value="">정렬 기준</option>
              <option value="rising">상승률 TOP</option>
              <option value="falling">하락률 TOP</option>
            </select>
          </div>
          <button onClick={resetFilters} className="filter-reset-btn">
            필터 초기화
          </button>
        </div>
        <div className="stock-list">
          <div className="stock-header">
            <div className="stock-header-name">종목명</div>
            <div className="stock-header-price">현재가</div>
            <div className="stock-header-changes">
              <span>등락</span>
              <span>등락률</span>
            </div>
          </div>
          {stocks.map((stock, index) => (
              <div
                  key={stock.stockProductId}
                  ref={index === stocks.length - 1 ? lastStockElementRef : null}
                  className="stock-item-container"
                  onClick={() => handleStockClick(stock)}
                  style={{ cursor: 'pointer' }}
              >
                <div className="stock-item">
                  <div className="stock-name-section">
                    <span className="stock-title">{stock.stockProductName}</span>
                    <span className="stock-market">
                  {stock.stockMarketCategory} {stock.stockProductId}
                </span>
                  </div>
                  <div className="stock-price">
                    {stock.stockClosingPrice.toLocaleString()}
                  </div>
                  <div className="stock-changes">
                    <div className="stock-change-values">
                  <span className={stock.stockPriceDifference >= 0 ? 'stock-positive' : 'stock-negative'}>
                    {stock.stockPriceDifference >= 0 ? '▲' : '▼'} {Math.abs(stock.stockPriceDifference).toLocaleString()}
                  </span>
                      <span className={stock.stockFluctuationRate >= 0 ? 'stock-positive' : 'stock-negative'}>
                    {Math.abs(stock.stockFluctuationRate).toFixed(2)}%
                  </span>
                    </div>
                    <span className="stock-volume">{stock.stockTradingVolume.toLocaleString()}</span>
                  </div>
                </div>
              </div>
          ))}
          {loading && (
              <div className="stock-loading-indicator">
                <p>데이터를 불러오는 중...</p>
              </div>
          )}
        </div>
        <StockTradeModal isOpen={isModalOpen} onClose={handleCloseModal} stockProduct={selectedStock} />
      </div>
  );
};

export default Stock;
