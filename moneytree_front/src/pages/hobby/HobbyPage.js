import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/hobbypage.css'; // CSS 예시는 별도 파일 참고

const HobbyRecommendationPage = () => {
    // 전체 취미 데이터 (백엔드에서 불러온 값)
    const [hobbies, setHobbies] = useState([]);
    // 가격 필터 입력값
    const [inputMin, setInputMin] = useState(0);
    const [inputMax, setInputMax] = useState(100000000);
    // 선택된 카테고리 (초기값 "전체"는 모든 카테고리)
    const [selectedCategory, setSelectedCategory] = useState("전체");
    // 최종 필터링된 취미 데이터
    const [filteredHobbies, setFilteredHobbies] = useState([]);

    // 미리 정해진 카테고리 목록 (총 10개 옵션)
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

    // 컴포넌트 마운트 시 백엔드 API에서 취미 데이터 불러오기
    useEffect(() => {
        axios.get('http://localhost:8080/api/hobbies')
            .then(response => {
                setHobbies(response.data);
                // 초기에는 전체 데이터가 표시됨
                setFilteredHobbies(response.data);
            })
            .catch(error => {
                console.error('취미 데이터를 불러오는 데 실패:', error);
            });
    }, []);

    // 가격 및 카테고리 조건을 모두 적용하여 필터링하는 함수
    const applyFilters = (category, min, max) => {
        let filtered = hobbies.filter(hobby => {
            const price = parseFloat(hobby.hobbyPrice);
            return price >= min && price <= max;
        });
        if (category !== "전체") {
            filtered = filtered.filter(hobby => hobby.hobbyCategory === category);
        }
        setFilteredHobbies(filtered);
    };

    // 검색 버튼 클릭 시 가격 조건(현재 선택된 카테고리 포함)으로 필터링 적용
    const handleSearch = () => {
        applyFilters(selectedCategory, inputMin, inputMax);
    };

    // 카테고리 버튼 클릭 시 바로 해당 카테고리의 취미로 필터링
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
                        onChange={e => setInputMin(parseFloat(e.target.value))}
                    />
                </label>
                <label>
                    최대 금액 (원):
                    <input
                        type="number"
                        value={inputMax}
                        onChange={e => setInputMax(parseFloat(e.target.value))}
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

            {/* 필터링된 취미 목록 */}
            <div className="hobby-page-list">
                {filteredHobbies.length === 0 ? (
                    <p>조건에 맞는 취미가 없습니다.</p>
                ) : (
                    filteredHobbies.map(hobby => (
                        <div key={hobby.id} className="hobby-card">
                            <a
                                href={hobby.hobbyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hobby-link"
                            >
                                <h3 style={{color:"black"}}>{hobby.hobbyName}</h3>
                            </a>
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
