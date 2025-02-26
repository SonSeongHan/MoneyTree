import React, { useEffect, useState, useCallback } from 'react';
import { getCookie } from '../util/cookieUtil';
import FundAPI from '../api/FundAPI';
import FundTradeModal from './FundTradeModal';
import '../css/recommends/Fund.css';

const FundPreview = ({ searchQuery }) => {
    const [funds, setFunds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [investedFunds, setInvestedFunds] = useState(new Set());
    const [selectedFund, setSelectedFund] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const previewLimit = 10;

    // 가입한 펀드 정보 가져오기
    const fetchInvestedFunds = async () => {
        try {
            const memberCookie = getCookie('member');
            if (!memberCookie) return;
            const accountNumber = await FundAPI.getDandwacAccountNumber(memberCookie.memberId);
            if (!accountNumber) return;
            const fundAccounts = await FundAPI.getFundAccount(accountNumber);
            const investedFundIds = new Set(fundAccounts.map(account => account.fundProductId));
            setInvestedFunds(investedFundIds);
        } catch (err) {
            console.error('Error fetching invested funds:', err);
        }
    };

    // 미리보기용 데이터 초기 호출: limit을 10으로 고정
    // 예시: FundPreview 컴포넌트 내에서
    useEffect(() => {
        const fetchPreviewFunds = async () => {
            try {
                setLoading(true);
                const response = await FundAPI.getFundsByPage(1, previewLimit);
                const fundsData = Array.isArray(response)
                    ? response
                    : response?.content || [];
                // 미리보기용으로 10개만 저장
                setFunds(fundsData.slice(0, previewLimit));
                await fetchInvestedFunds();
            } catch (err) {
                console.error('Error fetching preview funds:', err);
                setError('펀드 데이터를 가져오는 중 문제가 발생하였습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchPreviewFunds();
    }, [previewLimit]);


    // 검색어 적용: 검색어가 있다면 펀드명에 포함된 항목만 필터링
    const fundsToDisplay = searchQuery
        ? funds.filter(fund => fund.fundProductName.includes(searchQuery))
        : funds;

    const handleFundClick = (fund) => {
        setSelectedFund(fund);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedFund(null);
        fetchInvestedFunds();
    };

    const formatAmount = (amount) => {
        return `${Math.floor((amount * 100) / 10000).toLocaleString()}`;
    };

    if (loading) return <p className="fund-loading-state">로딩 중입니다...</p>;
    if (error) return <p className="fund-error-state">{error}</p>;
    if (!fundsToDisplay || fundsToDisplay.length === 0) {
        return <p className="fund-empty-state">표시할 펀드 상품이 없습니다.</p>;
    }

    return (
        <div className="fund-container">
            <div className="fund-list">
                <div className="fund-header">
                    <div className="fund-header-name">펀드명</div>
                    <div className="fund-header-manager">운용사</div>
                    <div className="fund-header-amount">펀드 규모</div>
                </div>
                {fundsToDisplay.map((fund) => (
                    <div
                        key={fund.fundProductId}
                        className="fund-item-container"
                        onClick={() => handleFundClick(fund)}
                    >
                        <div className="fund-item">
                            <div className="fund-name-section">
                <span className="fund-title">
                  {fund.fundProductName}
                    {investedFunds.has(fund.fundProductId) && (
                        <span className="fund-invested-badge">가입중</span>
                    )}
                </span>
                                <span className="fund-type">{fund.fundProductType}</span>
                            </div>
                            <div className="fund-manager">{fund.fundProductManager}</div>
                            <div className="fund-amount">
                                {formatAmount(fund.fundProductTotalAmount)}억원
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <FundTradeModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                fundProduct={selectedFund}
            />
        </div>
    );
};

export default FundPreview;
