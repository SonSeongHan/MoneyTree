import React, { useEffect, useState, useRef, useCallback } from 'react';
import StockAPI from '../../api/StockAPI';
import '../../css/recommends/Stock.css';

const Stock = () => {
  const [allStocks, setAllStocks] = useState([]); // 전체 30개 데이터
  const [displayStocks, setDisplayStocks] = useState([]); // 화면에 보여줄 데이터
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [expandedStockId, setExpandedStockId] = useState(null);  // 변경된 부분
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef(null);
  const itemsPerPage = 10;

  // 필터 상태
  const [marketCategory, setMarketCategory] = useState('');
  const [tradingVolume, setTradingVolume] = useState('');
  const [marketCap, setMarketCap] = useState('');
  const [searchName, setSearchName] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);

  // 세부정보 토글
  const toggleExpand = useCallback((stockId) => {
    setExpandedStockId(currentId => currentId === stockId ? null : stockId);
  }, []);

  // 필터 초기화
  const resetFilters = useCallback(() => {
    setMarketCategory('');
    setTradingVolume('');
    setMarketCap('');
    setSearchName('');
    setSortBy('');
    setPage(1);
    setFilteredStocks([]);
    setIsFiltering(false);
    setHasMore(true);
    setExpandedStockId(null);  // 세부정보도 초기화
    fetchInitialStocks();
  }, []);

  // 초기 데이터 불러오기 (30개)
  const fetchInitialStocks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await StockAPI.getStocksByPage(1, 30);
      setAllStocks(data);
      setDisplayStocks(data.slice(0, itemsPerPage));
      setHasMore(true);
    } catch (err) {
      console.error('Error fetching initial stocks:', err);
      setError('주식 데이터를 가져오는 중 문제가 발생하였습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // sortBy 변경 시 데이터 fetching
  const fetchSortedStocks = useCallback(async () => {
    if (!sortBy) return;

    try {
      setLoading(true);
      setExpandedStockId(null);  // 정렬 시 세부정보 닫기
      let data;
      if (sortBy === 'rising') {
        data = await StockAPI.getTopRisingStocks(10);
      } else if (sortBy === 'falling') {
        data = await StockAPI.getTopFallingStocks(10);
      }

      setAllStocks(data);
      setDisplayStocks(data);
      setHasMore(false);
    } catch (err) {
      console.error('Error fetching sorted stocks:', err);
      setError('정렬된 데이터를 가져오는 중 문제가 발생하였습니다.');
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  // 필터링 적용
  const applyFilters = useCallback(async () => {
    if (!marketCategory && !tradingVolume && !marketCap && !searchName) {
      setIsFiltering(false);
      setFilteredStocks([]);
      setDisplayStocks(allStocks.slice(0, page * itemsPerPage));
      return;
    }

    try {
      setLoading(true);
      setIsFiltering(true);
      setExpandedStockId(null);  // 필터 적용 시 세부정보 닫기
      let filteredData = [...allStocks];

      if (marketCategory) {
        const marketData = await StockAPI.getStocksByMarketCategory(marketCategory);
        filteredData = marketData;
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

      if (searchName) {
        const searchData = await StockAPI.searchStockProductsByName(searchName);
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
  }, [marketCategory, tradingVolume, marketCap, searchName, allStocks, page]);

  // 초기 데이터 로드
  useEffect(() => {
    if (!sortBy) {
      fetchInitialStocks();
    }
  }, [fetchInitialStocks, sortBy]);

  // sortBy 변경 시 데이터 로드
  useEffect(() => {
    if (sortBy) {
      fetchSortedStocks();
    }
  }, [sortBy, fetchSortedStocks]);

  // 필터 적용
  useEffect(() => {
    const filterTimer = setTimeout(() => {
      if (!sortBy) {
        applyFilters();
      }
    }, 500);

    return () => clearTimeout(filterTimer);
  }, [applyFilters, sortBy]);

  // 페이지 변경 시 데이터 업데이트
  useEffect(() => {
    if (!isFiltering && !sortBy && allStocks.length > 0) {
      const endIndex = page * itemsPerPage;
      setDisplayStocks(allStocks.slice(0, endIndex));
      setHasMore(endIndex < allStocks.length);
    }
  }, [page, isFiltering, allStocks, sortBy]);

  // Intersection Observer 설정
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

  if (loading && displayStocks.length === 0) return <p className="stock-loading-state">로딩 중입니다...</p>;
  if (error) return <p className="stock-error-state">{error}</p>;
  if (!displayStocks || displayStocks.length === 0) {
    return <p className="stock-empty-state">표시할 주식 상품이 없습니다.</p>;
  }

  const stocks = filteredStocks.length > 0 ? filteredStocks : displayStocks;

  return (
    <div className="stock-container">
      <div className="filter-container">
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
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />

        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
            setFilteredStocks([]);
            setExpandedStockId(null);  // 정렬 변경 시 세부정보 닫기
          }}
        >
          <option value="">정렬 기준</option>
          <option value="rising">상승률 TOP</option>
          <option value="falling">하락률 TOP</option>
        </select>

        <button onClick={resetFilters} className="filter-reset-btn">
          필터 초기화
        </button>
      </div>

      <div className="stock-list">
        {stocks.map((stock, index) => (
          <div
            key={stock.stockProductId}
            className="stock-item-container"
            ref={index === stocks.length - 1 ? lastStockElementRef : null}
          >
            <div className="stock-item">
              <div className="stock-rank">{index + 1}</div>
              <div className="stock-name">{stock.stockProductName}</div>
              <div className="stock-price">{stock.stockClosingPrice.toLocaleString()} 원</div>
              <div className={`stock-change ${stock.stockFluctuationRate >= 0 ? 'stock-positive' : 'stock-negative'}`}>
                {stock.stockFluctuationRate >= 0 ? '+' : ''}{stock.stockFluctuationRate.toFixed(2)}%
              </div>
              <button
                className={`stock-expand-btn ${expandedStockId === stock.stockProductId ? 'expanded' : ''}`}
                onClick={() => toggleExpand(stock.stockProductId)}
              >
                {expandedStockId === stock.stockProductId ? '-' : '+'}
              </button>
            </div>

            {expandedStockId === stock.stockProductId && (
              <div className="stock-details">
                <div className="stock-details-grid">
                  <div className="stock-detail-item">
                    <span className="stock-detail-label">시장</span>
                    <span className="stock-detail-value">{stock.stockMarketCategory}</span>
                  </div>
                  <div className="stock-detail-item">
                    <span className="stock-detail-label">시가</span>
                    <span className="stock-detail-value">{stock.stockOpeningPrice.toLocaleString()} 원</span>
                  </div>
                  <div className="stock-detail-item">
                    <span className="stock-detail-label">고가</span>
                    <span className="stock-detail-value">{stock.stockHighestPrice.toLocaleString()} 원</span>
                  </div>
                  <div className="stock-detail-item">
                    <span className="stock-detail-label">저가</span>
                    <span className="stock-detail-value">{stock.stockLowestPrice.toLocaleString()} 원</span>
                  </div>
                  <div className="stock-detail-item">
                    <span className="stock-detail-label">거래량</span>
                    <span className="stock-detail-value">{stock.stockTradingVolume.toLocaleString()}</span>
                  </div>
                  <div className="stock-detail-item">
                    <span className="stock-detail-label">거래대금</span>
                    <span className="stock-detail-value">{stock.stockTradingValue.toLocaleString()} 원</span>
                  </div>
                  <div className="stock-detail-item">
                    <span className="stock-detail-label">시가총액</span>
                    <span className="stock-detail-value">{(stock.stockMarketCapitalization / 100000000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 억원</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="stock-loading-indicator">
            <p>데이터를 불러오는 중...</p>
          </div>
        )}

        {!hasMore && !loading && stocks.length > 0 && (
          <div className="stock-end-message">
            <p>더 이상 표시할 데이터가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stock;