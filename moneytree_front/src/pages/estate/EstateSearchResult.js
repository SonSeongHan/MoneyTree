import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // ✅ useLocation 추가
import axios from 'axios';

// Axios 기본 설정
axios.defaults.baseURL = 'http://localhost:8080/api';

const EstateSearchResult = () => {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ 네비게이션 상태 확인
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // ✅ 네비게이션 상태로 받은 검색 결과 처리
  useEffect(() => {
    if (location.state?.results) {
      setSearchResults(location.state.results);
    }
  }, [location.state]);

  // 검색 실행
  const handleSearch = async () => {
    try {
      if (!searchTerm.trim()) {
        alert('검색어를 입력하세요.');
        return;
      }

      setIsSearching(true);
      setSearchResults([]);

      const encodedSearchTerm = encodeURIComponent(searchTerm.trim());
      const response = await axios.get(`/apartments/name/${encodedSearchTerm}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('검색 오류:', error.response?.data || error.message);
      alert(`검색 오류: ${error.response?.data || error.message}`);
    }
  };

  // 검색어 입력 후 Enter 키 누를 시 검색 실행
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 첫 로드 시 데이터 가져오기 (수정된 조건)
  useEffect(() => {
    if (!location.state?.results && !searchTerm.trim() && !isSearching) {
      fetchApartments();
    }
  }, [searchTerm, isSearching, location.state]);

  // 모든 아파트 데이터 가져오기
  const fetchApartments = async () => {
    try {
      const response = await axios.get('/apartments');
      setSearchResults(response.data);
    } catch (error) {
      console.error('데이터를 가져오는 중 오류 발생:', error.message || error);
    }
  };

  // 정렬 로직
  const handleSort = (type) => {
    if (sortType === type) return;

    const sorted = [...searchResults];

    if (type === 'priceHigh') {
      sorted.sort((a, b) => b.currentPrice - a.currentPrice);
    } else if (type === 'priceLow') {
      sorted.sort((a, b) => a.currentPrice - b.currentPrice);
    } else if (type === 'changeHigh') {
      sorted.sort((a, b) => b.changeRate - a.changeRate);
    } else if (type === 'changeLow') {
      sorted.sort((a, b) => a.changeRate - b.changeRate);
    }

    setSearchResults(sorted);
    setSortType(type);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>단지명 검색 결과</h1>
      <p>총 {searchResults.length}개의 결과가 있습니다.</p>

      {/* 검색창 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="단지명을 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ padding: '8px', width: '300px' }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '8px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          검색
        </button>
      </div>

      {/* 정렬 버튼 */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => handleSort('priceHigh')}
          style={{
            marginRight: '10px',
            padding: '8px',
            backgroundColor: sortType === 'priceHigh' ? '#007bff' : '#ddd',
            color: sortType === 'priceHigh' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          가격 높은 순
        </button>
        <button
          onClick={() => handleSort('priceLow')}
          style={{
            marginRight: '10px',
            padding: '8px',
            backgroundColor: sortType === 'priceLow' ? '#007bff' : '#ddd',
            color: sortType === 'priceLow' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          가격 낮은 순
        </button>
        <button
          onClick={() => handleSort('changeHigh')}
          style={{
            marginRight: '10px',
            padding: '8px',
            backgroundColor: sortType === 'changeHigh' ? '#007bff' : '#ddd',
            color: sortType === 'changeHigh' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          변동률 높은 순
        </button>
        <button
          onClick={() => handleSort('changeLow')}
          style={{
            marginRight: '10px',
            padding: '8px',
            backgroundColor: sortType === 'changeLow' ? '#007bff' : '#ddd',
            color: sortType === 'changeLow' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          변동률 낮은 순
        </button>
      </div>

      {/* 검색 결과 */}
      <ul style={{ listStyle: 'none', padding: '0' }}>
        {searchResults.map((item) => (
          <li
            key={item.id}
            onClick={() => navigate(`/realestate/details/${encodeURIComponent(item.name)}`)}
            style={{
              cursor: 'pointer',
              marginBottom: '10px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
            }}
          >
            <strong>{item.name}</strong>
            <p>도로명: {item.roadAddress}</p>
            <p>전용 면적: {item.area}㎡</p>
            <p>최신 거래가: {(item.currentPrice / 10000).toFixed(2)}억</p>
            <p>
              변동률:{' '}
              {item.changeRate !== null ? (
                <span style={{ color: item.changeRate > 0 ? 'green' : 'red' }}>
                  {item.changeRate}%
                </span>
              ) : (
                '정보 없음'
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EstateSearchResult;
