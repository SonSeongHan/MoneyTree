import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getCookie } from '../../../util/cookieUtil';
import '../../../css/estate/fss/MortgageLoanProductDetail.css';
import LoanLimitCalculatorModal from '../../estate/fss/LoanLimitCalculatorModal';

const MortgageLoanProductDetail = () => {
    const { id } = useParams(); // 금융상품 ID
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loanOptions, setLoanOptions] = useState([]);
    const [selectedAmount, setSelectedAmount] = useState(0);
    const [loanLimit, setLoanLimit] = useState(null);
    const [isLoanLimitSet, setIsLoanLimitSet] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loggedInUser = getCookie('member');

    const getAuthHeaders = () => {
        if (!loggedInUser || !loggedInUser.accessToken) {
            navigate('/loginpage');
            return {};
        }
        return {
            Authorization: `Bearer ${loggedInUser.accessToken}`,
            memberId: String(loggedInUser.memberId),
        };
    };

    const fetchProduct = () => {
        axios
            .get(`http://localhost:8080/api/fss/mortgage-loan-products/${id}`, {
                headers: getAuthHeaders(),
            })
            .then((response) => {
                setProduct(response.data);
                setIsLoanLimitSet(response.data.loanLimitSet);
                const available = response.data.availableLoanLimit;
                const min = 10000000;
                if (available < min) {
                    setLoanOptions([]);
                    setSelectedAmount(0);
                } else {
                    const options = [];
                    for (let amt = min; amt <= available; amt += 10000000) {
                        options.push(amt);
                    }
                    setLoanOptions(options);
                    setSelectedAmount(options[0]);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('상품 상세 데이터 로딩 오류:', err);
                setError('상품 데이터를 불러오는 중 오류가 발생했습니다.');
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const handleLoanAmountChange = (e) => {
        setSelectedAmount(Number(e.target.value));
    };

    const handleSubscribe = () => {
        if (!loggedInUser) {
            alert('로그인이 필요합니다.');
            navigate('/loginpage');
            return;
        }
        if (selectedAmount <= 0) {
            alert('대출 가능한 금액이 없습니다.');
            return;
        }
        if (!isLoanLimitSet) {
            alert('대출 한도를 먼저 계산해주세요.');
            return;
        }
        const headers = {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        };

        axios
            .post(
                `http://localhost:8080/api/fss/mortgage-loan-products/${id}/subscribe`,
                { loanAmount: selectedAmount },
                { headers }
            )
            .then(() => {
                alert(`대출이 ${selectedAmount.toLocaleString()}원 완료되었습니다.`);
                axios
                    .get(`http://localhost:8080/api/fss/mortgage-loan-products/${id}`, {
                        headers: getAuthHeaders(),
                    })
                    .then((res) => {
                        setProduct(res.data);
                        updateLoanOptions(res.data.availableLoanLimit);
                    })
                    .catch((err) => {
                        console.error('상품 정보 재로딩 오류:', err);
                    });
            })
            .catch((err) => {
                if (err.response?.data?.error === 'ERROR_ACCESS_TOKEN') {
                    alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
                    navigate('/loginpage');
                } else {
                    console.error('구독(가입) 오류:', err);
                    alert('구독(가입) 처리 중 오류가 발생했습니다.');
                }
            });
    };

    const updateLoanOptions = (availableLimit) => {
        const min = 10000000;
        if (availableLimit < min) {
            setLoanOptions([]);
            setSelectedAmount(0);
        } else {
            const options = [];
            for (let amt = min; amt <= availableLimit; amt += 10000000) {
                options.push(amt);
            }
            setLoanOptions(options);
            setSelectedAmount(options[0]);
        }
    };

    const handleLoanLimitCalculation = (calculationData) => {
        axios
            .get(`http://localhost:8080/api/subscription-details/${id}`, {
                headers: getAuthHeaders(),
                params: {
                    assets: calculationData.assets,
                    liabilities: calculationData.liabilities,
                    fixedExpenses: calculationData.fixedExpenses,
                    fixedIncome: calculationData.fixedIncome,
                },
            })
            .then((response) => {
                alert(response.data.message);
                setIsLoanLimitSet(true);
                setLoanLimit(response.data.remainingLoanAmount);
                setIsModalOpen(false);
            })
            .catch((error) => {
                console.error('대출 한도 계산 오류:', error);
                alert('대출 한도 계산에 실패했습니다.');
            });
    };

    const getCategoryForProduct = () => {
        if (!product) return null;
        const korCoNm = product.korCoNm;
        const filterOptions = {
            '안정성을 중시하는 사용자 추천 금융상품': [
                '한화생명보험주식회사',
                '에이비엘생명보험주식회사',
                '삼성생명보험주식회사',
                '흥국생명보험주식회사',
            ],
            '높은 대출 한도를 원하는 사용자 추천 금융상품': [
                '교보생명보험주식회사',
                '하나생명보험주식회사',
                '동양생명보험주식회사',
                '삼성화재해상보험주식회사',
            ],
            '조기 상환 가능성을 고려하는 사용자 추천 금융상품': ['현대해상화재보험주식회사'],
            '연체 가능성이 있는 사용자 추천 금융상품': [
                '주식회사KB손해보험',
                '푸본현대생명보험주식회사',
                '농협생명보험주식회사',
                '농협손해보험주식회사',
            ],
        };

        for (let category in filterOptions) {
            if (filterOptions[category].includes(korCoNm)) {
                switch (category) {
                    case '안정성을 중시하는 사용자 추천 금융상품':
                        return '안정성을 중시하는 사용자 추천 금융상품 (로우리스크, 로우리턴)';
                    case '높은 대출 한도를 원하는 사용자 추천 금융상품':
                        return '높은 대출 한도를 원하는 사용자 추천 금융상품 (하이리스크, 하이리턴)';
                    case '조기 상환 가능성을 고려하는 사용자 추천 금융상품':
                        return '조기 상환 가능성을 고려하는 사용자 추천 금융상품 (로우리스크, 하이리턴)';
                    case '연체 가능성이 있는 사용자 추천 금융상품':
                        return '연체 가능성이 있는 사용자 추천 금융상품 (하이리스크, 로우리턴)';
                    default:
                        return category;
                }
            }
        }
        return null;
    };

    const category = getCategoryForProduct();
    const categoryInfo = {
        '안정성을 중시하는 사용자 추천 금융상품 (로우리스크, 로우리턴)': {
            pros: [
                '낮은 위험성 : 이 금융상품은 안정성을 우선시하여 상대적으로 낮은 위험성을 가지고 있습니다.',
                '예측 가능성 : 수익률과 대출 조건이 예측 가능하여 사용자에게 안정적인 금융 환경을 제공합니다.',
                '보수적인 조건 : 이 상품은 기본적으로 보수적인 조건을 제공하여, 리스크를 최소화합니다.',
            ],
            cons: [
                '낮은 대출 한도 : 안정성 우선의 금융상품은 대출 한도가 상대적으로 낮을 수 있습니다.',
                '제한된 선택 : 옵션이 제한적일 수 있으며, 자금 운용에 유연성이 부족할 수 있습니다.',
                '유연성 부족 : 고위험/고수익을 추구하는 사용자에게는 유연성이 부족할 수 있습니다.',
            ],
        },
        // ... (다른 카테고리 정보)
    };
    const pros = category && categoryInfo[category] ? categoryInfo[category].pros : [];
    const cons = category && categoryInfo[category] ? categoryInfo[category].cons : [];

    if (!loggedInUser) {
        return <div className="error">로그인이 필요합니다.</div>;
    }
    if (loading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!product) return <div className="no-data">상품을 찾을 수 없습니다.</div>;

    return (
        <div style={{ backgroundColor: 'rgb(248, 249, 250)', padding: '40px' }}>
            <div className="detail-container">
                <h1>{product.finPrdtNm}</h1>
                <div className="detail-item">
                    <strong>신고월:</strong> {product.dclsMonth}
                </div>
                <div className="detail-item">
                    <strong>금융회사 번호:</strong> {product.finCoNo}
                </div>
                <div className="detail-item">
                    <strong>금융상품 코드:</strong> {product.finPrdtCd}
                </div>
                <div className="detail-item">
                    <strong>금융회사 이름:</strong> {product.korCoNm}
                </div>
                <div className="detail-item">
                    <strong>가입 방식:</strong> {product.joinWay}
                </div>
                <div className="detail-item">
                    <strong>인지세 정보:</strong> {product.loanInciExpn}
                </div>
                <div className="detail-item">
                    <strong>중도상환수수료:</strong> {product.erlyRpayFee}
                </div>
                <div className="detail-item" style={{ display: 'flex', gap: '26px' }}>
                    <strong>연체율 정보:</strong> <p>{product.dlyRate}</p>
                </div>
                <div className="detail-item" style={{ display: 'flex', gap: '26px' }}>
                    <strong>대출한도 정보:</strong>
                    <p>{product.loanLmt}</p>
                </div>
                <div className="detail-item">
                    <strong>현재 대출 가능 금액:</strong> {product.formattedAvailableLoanLimit}
                </div>
                <div className="detail-item">
                    <strong>최대 대출 한도:</strong> {product.fixedLoanLimit.toLocaleString()} 원
                </div>

                {loanLimit !== null && (
                    <div>
                        <p>계산된 대출 한도: {loanLimit.toLocaleString()} 원</p>
                        {isLoanLimitSet ? (
                            <p>대출 한도가 설정되었습니다.</p>
                        ) : (
                            <p>대출 한도가 설정되지 않았습니다.</p>
                        )}
                    </div>
                )}

                {loanOptions.length > 0 ? (
                    <div className="loan-selection">
                        <label htmlFor="loanAmountSelect">
                            받으실 대출 금액 선택 (최소 5천만원부터 1천만원 단위):
                        </label>
                        <select
                            id="loanAmountSelect"
                            value={selectedAmount}
                            onChange={handleLoanAmountChange}
                        >
                            {loanOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option.toLocaleString()} 원
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div className="loan-selection">
                        <p>더이상 대출 가능한 금액이 없습니다.</p>
                    </div>
                )}

                <div className="button-container" style={{ display: 'flex', gap: '10px' , justifyContent: 'space-between'}}>
                    {isLoanLimitSet ? (                        <button className="custom-button loan-limit-set-button" disabled>
                            이미 대출 한도가 설정되었습니다.
                        </button>
                    ) : (
                        <button className="custom-button" onClick={() => setIsModalOpen(true)}>
                            대출한도계산하기
                        </button>
                    )}
                    <div>
                    <button
                        className="custom-button"
                        onClick={handleSubscribe}
                        disabled={loanOptions.length === 0}
                    >
                        대출 하기
                    </button>
                    <button className="custom-button" onClick={() => navigate(-1)}>
                        뒤로가기
                    </button>
                </div>
                </div>
                <LoanLimitCalculatorModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onCalculate={(calculationData) => handleLoanLimitCalculation(calculationData)}
                />

                {category && (
                    <div className="category-info">
                        <h3>추천 카테고리: {category}</h3>
                        <div className="pros" style={{marginBottom:'20px'}}>
                            <h4 >장점</h4>
                            <ul>
                                {pros.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="cons">
                            <h4>단점</h4>
                            <ul>
                                {cons.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MortgageLoanProductDetail;
