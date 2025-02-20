import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getCookie } from '../../../util/cookieUtil';
import '../../../css/estate/fss/MortgageLoanProductDetail.css';
import LoanLimitCalculatorModal from '../../estate/fss/LoanLimitCalculatorModal';

const SubscriptionDetail = () => {
    const { id } = useParams(); // 상품 ID
    const location = useLocation();
    const navigate = useNavigate();

    const [info, setInfo] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const loggedInUser = getCookie('member');
    // URL 쿼리 파라미터에서 loanAmount 읽어오기
    const loanAmount = new URLSearchParams(location.search).get('loanAmount');

    const getAuthHeaders = () => {
        if (!loggedInUser || !loggedInUser.accessToken) return {};
        return {
            Authorization: `Bearer ${loggedInUser.accessToken}`,
            memberId: String(loggedInUser.memberId),
        };
    };

    useEffect(() => {
        // /subscription-details/{id}/info API 호출
        axios
            .get(`http://localhost:8080/api/subscription-details/${id}/info`, {
                headers: getAuthHeaders(),
            })
            .then((res) => {
                setInfo(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('가입 상세 데이터 로딩 오류:', err);
                setError('가입 상세 데이터를 불러오는 중 오류가 발생했습니다.');
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!info) {
        return <div className="no-data">가입 상세 정보를 확인할 수 없습니다.</div>;
    }

    // info.memberId, info.finPrdtNm, info.balance 등 표시
    return (
        <div className="subscription-detail-container">
            <h1>가입 상세 정보</h1>
            <p>
                <strong>{info.memberId}</strong> 님의 부동산 계좌입니다.
            </p>
            <p>
                해당 금융상품: <strong>{info.finPrdtNm}</strong> 가입
            </p>
            <p>
                현재 잔액: <strong>{info.balance.toLocaleString()} 원</strong>
            </p>
            {loanAmount && (
                <p>
                    대출 신청 금액: <strong>{Number(loanAmount).toLocaleString()} 원</strong>
                </p>
            )}
            <button onClick={() => navigate('/')}>메인으로 돌아가기</button>
        </div>
    );
};

// 필터 옵션 (금융회사 이름 기준)
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

// 카테고리 장단점 정보
const categoryInfo = {
    '안정성을 중시하는 사용자 추천 금융상품 (로우리스크, 로우리턴)': {
        pros: [
            '낮은 위험성 : 이 금융상품은 안정성을 우선시하여 상대적으로 낮은 위험성을 가지고 있습니다.',
            '예측 가능성 : 수익률과 대출 조건이 예측 가능하여 사용자에게 안정적인 금융 환경을 제공합니다.',
            '보수적인 조건 : 이 상품은 기본적으로 보수적인 조건을 제공하여, 리스크를 최소화하고 장기적인 안정성을 추구하는 사용자가 선호합니다.',
        ],
        cons: [
            '낮은 대출 한도 : 안정성 우선의 금융상품은 대출 한도가 상대적으로 낮을 수 있습니다.',
            '제한된 선택 : 이와 같은 상품은 옵션이 제한적일 수 있으며, 자금 운용에 있어서 유연성이 부족할 수 있습니다.',
            '유연성 부족 : 고위험/고수익을 추구하는 사용자에게는 유연성이 부족하게 느껴질 수 있습니다.',
        ],
    },
    '높은 대출 한도를 원하는 사용자 추천 금융상품 (하이리스크, 하이리턴)': {
        pros: [
            '높은 자금 조달 가능 : 이 상품은 대출 한도가 높아 대규모 자금을 필요한 사용자에게 유리합니다.',
            '대규모 투자에 유리 : 자금을 대규모로 조달할 수 있어 큰 투자나 사업 확장에 유리합니다.',
            '추가 혜택 가능 : 높은 대출 한도와 더불어 여러 추가 혜택을 제공할 수 있습니다.',
        ],
        cons: [
            '높은 위험성 : 대출 금액이 크고 리스크가 커지므로, 상환 불이행 등 위험이 따를 수 있습니다.',
            '높은 이자율 및 수수료 : 하이리스크 상품은 일반적으로 높은 이자율과 수수료가 부과됩니다.',
            '과도한 부채 위험 : 높은 대출 금액을 상환하기 어려운 경우 과도한 부채 위험이 발생할 수 있습니다.',
        ],
    },
    '조기 상환 가능성을 고려하는 사용자 추천 금융상품 (로우리스크, 하이리턴)': {
        pros: [
            '유연한 상환 옵션 : 조기 상환이 가능하여 금융 부담을 더 빨리 줄일 수 있습니다.',
            '이자 절감 효과 : 조기 상환을 통해 총 이자 부담을 줄일 수 있습니다.',
            '금융 부담 경감 : 상환 기간을 단축시키는 것이 가능하여, 장기적으로 금융 부담을 줄일 수 있습니다.',
        ],
        cons: [
            '상환 수수료 발생 가능 : 일부 금융상품은 조기 상환 시 수수료가 발생할 수 있습니다.',
            '조건 제한 : 조기 상환을 위한 특정 조건이 있을 수 있어, 이 조건을 만족하지 못하면 혜택을 받기 어려울 수 있습니다.',
            '불확실한 혜택 : 상환 조건이 미리 정해져 있지 않거나, 조기 상환 혜택이 예측되지 않아 혜택을 확실히 누리기 어려운 경우가 있을 수 있습니다.',
        ],
    },
    '연체 가능성이 있는 사용자 추천 금융상품 (하이리스크, 로우리턴)': {
        pros: [
            '접근성 높음 : 연체 가능성이 있는 사용자를 대상으로 하므로 신용이 좋지 않은 사용자도 접근할 수 있는 가능성이 높습니다.',
            '유연한 심사 기준 : 심사 기준이 유연하여, 신용이 좋지 않아도 대출 승인이 날 확률이 높습니다.',
        ],
        cons: [
            '높은 이자율 및 수수료 : 연체 가능성이 있는 사용자를 대상으로 하므로 높은 이자율과 수수료가 부과될 수 있습니다.',
            '재무 위험 증가 : 연체가 발생할 경우 추가적인 재무적 위험이 증가할 수 있습니다.',
            '제한된 상품 선택 : 연체 가능성을 고려한 상품은 선택의 폭이 좁고, 금융 상품이 제한적일 수 있습니다.',
        ],
    },
};

const MortgageLoanProductDetail = () => {
    const { id } = useParams(); // 금융상품 ID
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loanOptions, setLoanOptions] = useState([]); // 대출 금액 선택 옵션들
    const [selectedAmount, setSelectedAmount] = useState(0); // 선택된 대출 금액
    const [loanLimit, setLoanLimit] = useState(null); // 대출 한도 계산값
    const [isLoanLimitSet, setIsLoanLimitSet] = useState(false); // 대출 한도 설정 여부
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 관리

    const loggedInUser = getCookie('member');

    const getAuthHeaders = () => {
        if (!loggedInUser || !loggedInUser.accessToken) {
            navigate('/loginpage'); // 로그인 페이지로 리다이렉트
            return {};
        }
        return {
            Authorization: `Bearer ${loggedInUser.accessToken}`,
            memberId: String(loggedInUser.memberId),
        };
    };

    // DB에 업데이트된 최신 상품 정보를 조회하는 함수
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
                // 만약 남은 대출 가능 금액이 최소 한도 미만이면 옵션을 비우고 selectedAmount를 0으로 설정
                if (available < min) {
                    setLoanOptions([]);
                    setSelectedAmount(0);
                } else {
                    const options = [];
                    for (let amt = min; amt <= available; amt += 10000000) {
                        options.push(amt);
                    }
                    setLoanOptions(options);
                    setSelectedAmount(options[0]); // 첫 번째 옵션을 기본값으로 설정
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
        const newAmount = Number(e.target.value);
        setSelectedAmount(newAmount);
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
                { headers },
            )
            .then((response) => {
                // 가입(대출) 성공 알림
                alert(`대출이 ${selectedAmount.toLocaleString()}원 완료되었습니다.`);

                // 1) 상품 정보 다시 불러오기 → 화면 갱신
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
                        // 필요 시 에러 처리
                    });

                // 2) 여기서 navigate를 호출하지 않음 → 같은 페이지에 머무름
                // (원한다면 navigate(`/estate/fss/mortgage-loan-products/${id}`)로 동일 경로를 재호출해도 됨)
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

    const [assets, setAssets] = useState('');
    const [liabilities, setLiabilities] = useState('');
    const [fixedExpenses, setFixedExpenses] = useState('');
    const [fixedIncome, setFixedIncome] = useState('');

    const handleLoanLimitCalculation = (calculationData) => {
        // calculationData = { assets: ..., liabilities: ..., fixedExpenses: ..., fixedIncome: ... }
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
                // 이미 대출 한도가 설정된 경우
                if (response.data.isLoanLimitSet && response.data.firstTimeSet === false) {
                    alert(response.data.message);
                    setIsLoanLimitSet(true);
                    setLoanLimit(response.data.remainingLoanAmount);
                }
                // 최초 계산일 때
                else if (response.data.firstTimeSet === true) {
                    alert(response.data.message);
                    setIsLoanLimitSet(true);
                    setLoanLimit(response.data.remainingLoanAmount);
                }
                setIsModalOpen(false);
            })
            .catch((error) => {
                console.error('대출 한도 계산 오류:', error);
                alert('대출 한도 계산에 실패했습니다.');
            });
    };

    // 해당 상품의 금융회사 이름이 어느 필터에 해당하는지 결정하는 함수
    const getCategoryForProduct = () => {
        if (!product) return null;
        const korCoNm = product.korCoNm;
        for (let category in filterOptions) {
            if (filterOptions[category].includes(korCoNm)) {
                // 카테고리 정보에 리스크/리턴 특성을 포함한 카테고리 이름으로 반환
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
    const pros = category && categoryInfo[category] ? categoryInfo[category].pros : [];
    const cons = category && categoryInfo[category] ? categoryInfo[category].cons : [];

    if (!loggedInUser) {
        return <div className="error">로그인이 필요합니다.</div>;
    }
    if (loading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!product) return <div className="no-data">상품을 찾을 수 없습니다.</div>;

    return (
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
            <div className="detail-item">
                <strong>연체율 정보:</strong> {product.dlyRate}
            </div>
            <div className="detail-item">
                <strong>대출한도 정보:</strong> {product.loanLmt}
            </div>
            <div className="detail-item">
                <strong>현재 대출 가능 금액:</strong> {product.formattedAvailableLoanLimit}
            </div>
            <div className="detail-item">
                <strong>최대 대출 한도:</strong> {product.fixedLoanLimit.toLocaleString()} 원
            </div>

            {/* 대출 한도 계산하기 버튼 */}
            {isLoanLimitSet ? (
                // 이미 대출 한도가 설정된 경우
                <button className="loan-limit-set-button" disabled>
                    이미 대출 한도가 설정되었습니다.
                </button>
            ) : (
                // 대출 한도가 설정되지 않은 경우
                <button onClick={() => setIsModalOpen(true)}>대출한도계산하기</button>
            )}

            {/* 모달 컴포넌트 */}
            <LoanLimitCalculatorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCalculate={(calculationData) => handleLoanLimitCalculation(calculationData)}
            />

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

            {/* 대출 금액 선택 영역 */}
            {loanOptions.length > 0 ? (
                <div className="loan-selection">
                    <label htmlFor="loanAmountSelect">
                        받으실 대출 금액 선택 (최소 5천만원부터 1천만원 단위):
                    </label>
                    <select id="loanAmountSelect" value={selectedAmount} onChange={handleLoanAmountChange}>
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

            <button onClick={handleSubscribe} disabled={loanOptions.length === 0}>
                대출 하기
            </button>
            <button onClick={() => navigate(-1)}>뒤로가기</button>

            {/* 카테고리 장단점 표시 */}
            {category && (
                <div className="category-info">
                    <h3>추천 카테고리: {category}</h3>
                    <div className="pros">
                        <h4>장점</h4>
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
    );
};

export default MortgageLoanProductDetail;
