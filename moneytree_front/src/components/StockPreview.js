import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../util/cookieUtil';
import StockAPI from '../api/StockAPI';
import '../css/recommends/Stock.css';
import StockTradeModal from './StockTradeModal';

const StockPreview = ({ searchQuery }) => {
    const navigate = useNavigate();
    const [stockAccount, setStockAccount] = useState(null);
    const [accountLoading, setAccountLoading] = useState(true);
    const [accountError, setAccountError] = useState(null);

    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 미리보기용 한 번에 불러올 개수
    const previewLimit = 10;

    // 주식 거래 관련 상태
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

    // 미리보기용 데이터 초기 불러오기 (전체 데이터를 받아온 후 10개만 slice)
    const fetchPreviewStocks = useCallback(async () => {
        try {
            setLoading(true);
            const response = await StockAPI.getStocksByPage(1, previewLimit);
            const stocksData = Array.isArray(response) ? response : response?.content || [];
            // 전체 데이터를 받아오더라도 미리보기 용으로 10개만 저장
            setStocks(stocksData.slice(0, previewLimit));
        } catch (err) {
            console.error('Error fetching preview stocks:', err);
            setError('주식 데이터를 가져오는 중 문제가 발생하였습니다.');
        } finally {
            setLoading(false);
        }
    }, [previewLimit]);

    useEffect(() => {
        checkStockAccount();
    }, []);

    useEffect(() => {
        if (stockAccount) {
            fetchPreviewStocks();
        }
    }, [stockAccount, fetchPreviewStocks]);

    // 검색어가 있을 경우 필터링 (주식명에 searchQuery가 포함된 항목만)
    const stocksToDisplay = searchQuery
        ? stocks.filter((stock) => stock.stockProductName.includes(searchQuery))
        : stocks;

    const handleStockClick = (stock) => {
        setSelectedStock(stock);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedStock(null);
    };

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
    if (loading && stocks.length === 0) return <p className="stock-loading-state">로딩 중입니다...</p>;
    if (error) return <p className="stock-error-state">{error}</p>;
    if (!stocksToDisplay || stocksToDisplay.length === 0) {
        return <p className="stock-empty-state">표시할 주식 상품이 없습니다.</p>;
    }

    return (
        <div className="stock-container">
            <div className="stock-list">
                <div className="stock-header">
                    <div className="stock-header-name">종목명</div>
                    <div className="stock-header-price">현재가</div>
                    <div className="stock-header-changes">
                        <span>등락</span>
                        <span>등락률</span>
                    </div>
                </div>
                {stocksToDisplay.map((stock) => (
                    <div
                        key={stock.stockProductId}
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
                    {stock.stockPriceDifference >= 0 ? '▲' : '▼'}{' '}
                      {Math.abs(stock.stockPriceDifference).toLocaleString()}
                  </span>
                                    <span className={stock.stockFluctuationRate >= 0 ? 'stock-positive' : 'stock-negative'}>
                    {Math.abs(stock.stockFluctuationRate).toFixed(2)}%
                  </span>
                                </div>
                                <span className="stock-volume">
                  {stock.stockTradingVolume.toLocaleString()}
                </span>
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
            <StockTradeModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                stockProduct={selectedStock}
            />
        </div>
    );
};

export default StockPreview;
