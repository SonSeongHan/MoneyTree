import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Link 임포트 추가
import { getCookie } from '../../../util/cookieUtil';
import '../../../css/estate/fss/MortgageLoanProducts.css';

// 필터 옵션 정의 추가
const filterOptions = {
    '안정성을 중시하는 사용자 추천 상품': [
        '한화생명보험주식회사',
        '에이비엘생명보험주식회사',
        '삼성생명보험주식회사',
        '흥국생명보험주식회사',
    ],
    '높은 대출 한도를 원하는 사용자 추천 상품': [
        '교보생명보험주식회사',
        '하나생명보험주식회사',
        '동양생명보험주식회사',
        '삼성화재해상보험주식회사',
    ],
    '조기 상환 가능성을 고려하는 사용자 추천 상품': ['현대해상화재보험주식회사'],
    '연체 가능성이 있는 사용자 추천 상품': [
        '주식회사KB손해보험',
        '푸본현대생명보험주식회사',
        '농협생명보험주식회사',
        '농협손해보험주식회사',
    ],
};

const MortgageLoanProducts = () => {
    const navigate = useNavigate();
    const loggedInUser = useMemo(() => getCookie('member'), []);

    const [products, setProducts] = useState([]);
    const [selectedLoanAmounts, setSelectedLoanAmounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('안정성을 중시하는 사용자 추천 상품');

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

    useEffect(() => {
        if (!loggedInUser) {
            setLoading(false);
            return;
        }

        axios
            .get('http://localhost:8080/api/fss/mortgage-loan-products', { headers: getAuthHeaders() })
            .then((response) => {
                let fetchedProducts = [];
                if (Array.isArray(response.data)) {
                    fetchedProducts = response.data;
                } else if (response.data && Array.isArray(response.data.content)) {
                    fetchedProducts = response.data.content;
                } else {
                    console.error('예상치 못한 응답 구조:', response.data);
                    setError('예상치 못한 응답 구조입니다.');
                    setLoading(false);
                    return;
                }
                setProducts(fetchedProducts);
                const initialSelections = {};
                fetchedProducts.forEach((product) => {
                    initialSelections[product.id] = 50000000;
                });
                setSelectedLoanAmounts(initialSelections);
                setLoading(false);
            })
            .catch((err) => {
                console.error('모기지론 상품 데이터 로딩 오류:', err);
                if (err.response?.data?.error === 'ERROR_ACCESS_TOKEN') {
                    navigate('/loginpage');
                } else {
                    setError('추천 상품 데이터를 불러오는 중 오류가 발생했습니다.');
                }
                setLoading(false);
            });
    }, [loggedInUser, navigate]);

    const handleLoanAmountChange = (productId, value) => {
        setSelectedLoanAmounts((prev) => ({
            ...prev,
            [productId]: Number(value),
        }));
    };

    const handleFilterChange = (filterKey) => {
        setSelectedFilter(filterKey);
    };

    const handleSubscribe = (productId) => {
        const loanAmount = selectedLoanAmounts[productId];
        const headers = {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        };

        axios
            .post(
                `http://localhost:8080/api/fss/mortgage-loan-products/${productId}/subscribe`,
                { loanAmount },
                { headers },
            )
            .then((response) => {
                // 가입 성공 알림
                alert(`대출이 ${loanAmount.toLocaleString()}원 완료되었습니다.`);

                // 1) 상품 목록 다시 불러오기
                axios
                    .get('http://localhost:8080/api/fss/mortgage-loan-products', {
                        headers: getAuthHeaders(),
                    })
                    .then((res) => {
                        let fetchedProducts = [];
                        if (Array.isArray(res.data)) {
                            fetchedProducts = res.data;
                        } else if (res.data && Array.isArray(res.data.content)) {
                            fetchedProducts = res.data.content;
                        }

                        // 2) 상태 업데이트 → 화면 리렌더링
                        setProducts(fetchedProducts);

                        // 3) 상품 목록 페이지로 이동
                        navigate('/estate/fss/mortgage-loan-products');
                    })
                    .catch((err) => {
                        console.error('상품 목록 재로딩 오류:', err);
                        // 에러가 나더라도 가입은 이미 성공했으므로
                        // 일단 목록 페이지로 이동할지, 에러 처리할지 결정
                        navigate('/estate/fss/mortgage-loan-products');
                    });
            })
            .catch((err) => {
                if (err.response?.data?.error === 'ERROR_ACCESS_TOKEN') {
                    navigate('/loginpage');
                } else {
                    console.error('구독(가입) 오류:', err);
                    alert('구독(가입) 처리 중 오류가 발생했습니다.');
                }
            });
    };

    if (!loggedInUser) {
        return <div className="error">로그인이 필요합니다.</div>;
    }
    if (loading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!products || products.length === 0)
        return <div className="no-data">추천 상품이 없습니다.</div>;

    const filteredProducts = products.filter((product) => {
        const allowedCompanies = filterOptions[selectedFilter] || [];
        return allowedCompanies.includes(product.korCoNm);
    });

    return (
        <div className="products-container">
            <h1>모기지론 상품 목록</h1>
            <div className="filter-bar">
                {Object.keys(filterOptions).map((filterKey) => (
                    <button
                        key={filterKey}
                        className={selectedFilter === filterKey ? 'active' : ''}
                        onClick={() => handleFilterChange(filterKey)}
                    >
                        {filterKey}
                    </button>
                ))}
            </div>
            <div className="products-list">
                {filteredProducts.length === 0 ? (
                    <div className="no-data">선택하신 조건에 맞는 금융 상품이 없습니다.</div>
                ) : (
                    filteredProducts.map((product) => {
                        const options = [];
                        const min = 10000000;
                        const max = product.availableLoanLimit;
                        for (let amount = min; amount <= max; amount += 10000000) {
                            options.push(amount);
                        }
                        return (
                            <div key={product.id} className="product-card">
                                <Link
                                    to={`/estate/fss/mortgage-loan-products/${product.id}`}
                                    className="product-link"
                                >
                                    <h2>{product.finPrdtNm}</h2>
                                    <p>
                                        <strong>금융회사 이름:</strong> {product.korCoNm}
                                    </p>
                                    <p>
                                        <strong>중도상환수수료:</strong> {product.erlyRpayFee}
                                    </p>
                                    <p>
                                        <strong>연체율 정보:</strong> {product.dlyRate}
                                    </p>
                                    <p>
                                        <strong>대출한도 정보:</strong> {product.loanLmt}
                                    </p>
                                    <p>
                                        <strong>현재 대출 가능 금액:</strong> {product.formattedAvailableLoanLimit}
                                    </p>
                                    <p>
                                        <strong>최대 대출 한도:</strong> {product.formattedFixedLoanLimit}
                                    </p>
                                </Link>
                                <div className="loan-selection">
                                    <label htmlFor={`loanAmountSelect-${product.id}`}>대출 금액 선택:</label>
                                    {options.length > 0 ? (
                                        <select
                                            id={`loanAmountSelect-${product.id}`}
                                            value={selectedLoanAmounts[product.id] || min}
                                            onChange={(e) => handleLoanAmountChange(product.id, e.target.value)}
                                        >
                                            {options.map((option) => (
                                                <option key={option} value={option}>
                                                    {option.toLocaleString()} 원
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p>더이상 대출 가능한 금액이 없습니다.</p>
                                    )}
                                </div>
                                <button onClick={() => handleSubscribe(product.id)} disabled={options.length === 0}>
                                    가입하기
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default MortgageLoanProducts;
