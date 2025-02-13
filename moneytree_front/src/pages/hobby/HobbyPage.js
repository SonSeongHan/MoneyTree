// src/pages/HobbyRecommendationPage.js
import React, { useEffect, useState } from 'react';
import { getAllHobbies } from '../../api/HobbyApi'; // HobbyAPI.js에 정의한 함수 import
import '../../css/hobbypage.css';

const HobbyRecommendationPage = () => {
    // 전체 취미 데이터와 필터링된 데이터 상태
    const [hobbies, setHobbies] = useState([]);
    const [filteredHobbies, setFilteredHobbies] = useState([]);

    // 가격 필터 입력값 (문자열 상태로 관리)
    const [inputMin, setInputMin] = useState("");
    const [inputMax, setInputMax] = useState("");

    // 선택된 카테고리 (초기값 "전체"는 모든 카테고리)
    const [selectedCategory, setSelectedCategory] = useState("전체");

    // 로딩 및 에러 상태
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 미리 정해진 카테고리 목록
    const categories = [
        "전체",
        "프리미엄",
        "수집/명품",
        "문화/예술",
        "취미/건강",
        "여행/레저",
        "모빌리티",
        "라이프스타일",
        "비즈니스/재테크",
        "취미 기타"
    ];

    // 컴포넌트 마운트 시 취미 데이터 불러오기
    useEffect(() => {
        const fetchHobbies = async () => {
            try {
                setLoading(true);
                const data = await getAllHobbies(); // HobbyAPI.js를 통해 데이터 호출
                console.log('받은 데이터:', data);
                setHobbies(data);
                setFilteredHobbies(data);
            } catch (err) {
                console.error('취미 데이터를 불러오는 데 실패:', err);
                setError('취미 데이터를 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchHobbies();
    }, []);

    // 가격 및 카테고리 조건을 적용하여 필터링하는 함수
    const applyFilters = (category, min, max) => {
        const minPrice = min === "" ? 0 : parseFloat(min);
        const maxPrice = max === "" ? 100000000 : parseFloat(max);

        let filtered = hobbies.filter(hobby => {
            const price = parseFloat(hobby.hobbyPrice);
            return price >= minPrice && price <= maxPrice;
        });

        if (category !== "전체") {
            filtered = filtered.filter(hobby => hobby.hobbyCategory === category);
        }
        setFilteredHobbies(filtered);
    };

    // 검색 버튼 클릭 시 필터 적용
    const handleSearch = () => {
        applyFilters(selectedCategory, inputMin, inputMax);
    };

    // 카테고리 버튼 클릭 시 필터 적용
    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        applyFilters(category, inputMin, inputMax);
    };

    return (
        <div className="hobby-recommendation-page">
            <h1>자산 기반 취미 추천</h1>

            {/* 가격 필터 입력 영역 */}
            <div className="price-filter">
                <label>
                    최소 금액 (원):
                    <input
                        type="number"
                        value={inputMin}
                        onChange={e => setInputMin(e.target.value)}
                        placeholder="0"
                    />
                </label>
                <label>
                    최대 금액 (원):
                    <input
                        type="number"
                        value={inputMax}
                        onChange={e => setInputMax(e.target.value)}
                        placeholder="최대 금액"
                    />
                </label>
                <button onClick={handleSearch}>검색</button>
            </div>

            {/* 가로 스크롤 카테고리 바 */}
            <div className="category-bar">
                {categories.map(category => (
                    <button
                        key={category}
                        className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* 로딩 및 에러 표시 */}
            {loading && <p>로딩 중...</p>}
            {error && <p className="error">{error}</p>}

            {/* 필터링된 취미 목록 */}
            <div className="hobby-list">
                {(!loading && filteredHobbies.length === 0) ? (
                    <p>조건에 맞는 취미가 없습니다.</p>
                ) : (
                    filteredHobbies.map(hobby => (
                        <div key={hobby.id} className="hobby-card">
                            <h3>{hobby.hobbyName}</h3>
                            <p>{hobby.hobbyDescription}</p>
                            <p>가격: {hobby.hobbyPrice} 원</p>
                            <p>카테고리: {hobby.hobbyCategory}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HobbyRecommendationPage;
