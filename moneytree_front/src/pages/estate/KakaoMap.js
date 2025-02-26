import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import data from '../../data/processed_apartments_real.json';

const KakaoMap = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const [searchType, setSearchType] = useState('도로명');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState(data);
    const [priceRange, setPriceRange] = useState([0, 100]);
    const [modalMessage, setModalMessage] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [markers, setMarkers] = useState([]);
    // 모바일 필터 메뉴 토글 상태 추가
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    useEffect(() => {
        let map = null;

        if (!document.getElementById('kakao-map-script')) {
            const script = document.createElement('script');
            script.id = 'kakao-map-script';
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=08530429910e2c10eaf1b6288c3b7f1c&autoload=false`;
            document.head.appendChild(script);

            script.onload = () => {
                window.kakao.maps.load(() => {
                    const container = document.getElementById('map');
                    const options = {
                        center: new window.kakao.maps.LatLng(37.517331925853, 127.047377408384),
                        level: 6,
                    };

                    map = new window.kakao.maps.Map(container, options);
                    setMapInstance(map);

                    const categorizedData = categorizeData(searchResults);
                    const markersObj = {};
                    const infoWindows = [];

                    Object.keys(categorizedData).forEach((category) => {
                        markersObj[category] = categorizedData[category].map((item) => {
                            const markerPosition = new window.kakao.maps.LatLng(item.latitude, item.longitude);

                            const marker = new window.kakao.maps.Marker({
                                position: markerPosition,
                                map: filter === 'all' || filter === category ? map : null,
                            });

                            const content = `
                <div style="padding:8px; background:#ffffff; border:1px solid #000000; font-family:Arial, sans-serif; font-size:12px; line-height:1.5; color:#000; width:200px; text-align:left;">
                  <div style="font-weight:bold; font-size:14px; margin-bottom:5px;">
                    <a href="/realestate/details/${encodeURIComponent(item['단지명'])}" style="text-decoration:none; color:#007bff;">
                      ${item['단지명']}
                    </a>
                  </div>
                  <div><strong>도로명:</strong> ${item['도로명']}</div>
                  <div><strong>전용 면적:</strong> ${item['전용면적(㎡)']}㎡</div>
                  <div>
                    <strong>최신 거래가:</strong> 
                    <span style="color:#d9534f;">${(item['거래금액(만원)'] / 10000).toFixed(2)}억</span>
                  </div>
                  <div>
                    <strong>변동률:</strong> 
                    <span style="color:${item['변동률(%)'] > 0 ? 'green' : 'red'};">
                      ${item['변동률(%)'] !== null ? item['변동률(%)'] + '%' : '정보 없음'}
                    </span>
                  </div>
                </div>
              `;

                            const infoWindow = new window.kakao.maps.InfoWindow({
                                content: content,
                                removable: true,
                            });

                            window.kakao.maps.event.addListener(marker, 'click', () => {
                                infoWindows.forEach((iw) => iw.close());
                                infoWindow.open(map, marker);
                            });

                            window.kakao.maps.event.addListener(map, 'click', () => {
                                infoWindow.close();
                            });

                            infoWindows.push(infoWindow);
                            return marker;
                        });
                    });

                    // 필터 적용 함수
                    const applyFilter = (selectedFilter) => {
                        Object.keys(markersObj).forEach((category) => {
                            markersObj[category].forEach((marker) => {
                                marker.setMap(selectedFilter === 'all' || selectedFilter === category ? map : null);
                            });
                        });
                    };

                    applyFilter(filter);
                });
            };
        }

        return () => {
            const script = document.getElementById('kakao-map-script');
            if (script) script.remove();
            if (map) {
                // 필요한 경우 마커 정리
            }
        };
    }, [filter, searchResults]);

    const categorizeData = (data) => {
        const validData = data.filter((item) => item['변동률(%)'] !== null);
        const sortedData = [...validData].sort((a, b) => a['변동률(%)'] - b['변동률(%)']);
        const total = validData.length;
        const p30 = Math.floor(total * 0.3);
        const p50 = Math.floor(total * 0.5);
        const p80 = Math.floor(total * 0.8);
        const p100 = total;

        return {
            highFall: sortedData.slice(0, p30),
            fall: sortedData.slice(p30, p50),
            noChange: data.filter((item) => item['변동률(%)'] === null),
            rise: sortedData.slice(p50, p80),
            highRise: sortedData.slice(p80, p100),
        };
    };

    const handlePriceRangeChange = (min, max) => {
        if (min > max) {
            setModalMessage('최소 금액은 최대 금액을 초과할 수 없습니다.');
            setPriceRange([0, max]);
            return;
        }
        const filteredResults = data.filter((item) => {
            const price = item['거래금액(만원)'] / 10000;
            return price >= min && price <= max;
        });
        setSearchResults(filteredResults);
        setPriceRange([min, max]);
    };

    const closeModal = () => {
        setModalMessage(null);
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            alert('검색어를 입력하세요.');
            return;
        }

        const encodedSearchTerm = encodeURIComponent(searchTerm.trim());

        if (searchType === '단지명') {
            const response = await fetch(
                `http://localhost:8080/api/apartments/name/${encodedSearchTerm}`
            );
            const results = await response.json();
            navigate('/realestate/search', { state: { results } });
        } else if (searchType === '도로명') {
            const filteredResults = data.filter((item) =>
                item['도로명'].replace(/\s+/g, '').toLowerCase().includes(searchTerm.trim().toLowerCase())
            );

            setSearchResults(filteredResults);
            updateMarkers(filteredResults);
        }
    };

    const handleShowAll = () => {
        setSearchResults(data); // 모든 아파트 데이터로 다시 설정
        updateMarkers(data); // 모든 아파트의 마커를 다시 갱신
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const updateMarkers = (filteredResults) => {
        if (!mapInstance) return;

        // 기존 마커 제거
        markers.forEach((marker) => marker.setMap(null));

        // 새로운 마커 생성
        const newMarkers = filteredResults.map((item) => {
            const markerPosition = new window.kakao.maps.LatLng(item.latitude, item.longitude);
            const marker = new window.kakao.maps.Marker({
                position: markerPosition,
                map: mapInstance,
            });

            return marker;
        });

        setMarkers(newMarkers);
    };

    // 모바일 필터 메뉴 토글 핸들러
    const toggleMobileFilter = () => {
        setIsMobileFilterOpen(!isMobileFilterOpen);
    };

    return (
        <div>
            <div className="kakaomap-serch">
                <div>
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        style={{ marginRight: '10px', padding: '8px' }}
                    >
                        <option value="단지명">단지명 검색</option>
                        <option value="도로명">도로명 검색</option>
                    </select>
                    <input
                        type="text"
                        placeholder={`검색할 ${searchType}을 입력하세요`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{ marginBottom: '10px', padding: '8px', width: '300px' }}
                    />
                </div>
                <button onClick={handleSearch} style={{ padding: '6px 12px' }}>
                    검색
                </button>
            </div>

            {/* 모바일 및 데스크탑 공용 필터 버튼 영역 */}
            {/* 모바일에서는 토글 메뉴로, 데스크탑에서는 항상 보이도록 CSS 미디어 쿼리로 처리 */}
            <div className="filter-containerrs">
                <div className="mobile-filter-toggle" onClick={toggleMobileFilter}>
                    필터 메뉴 {isMobileFilterOpen ? '▲' : '▼'}
                </div>
                <div className={`filter-buttons ${isMobileFilterOpen ? 'active' : ''}`}>
                    <button
                        onClick={() => {
                            setFilter('all');
                            handleShowAll();
                        }}
                        style={{
                            marginTop:"10px",
                            padding: '9px 17px',
                            marginRight: '5px',
                            backgroundColor: filter === 'all' ? '#498AE6' : '#64B5F6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                    >
                        모두 보기(초기화)
                    </button>
                    <button
                        onClick={() => setFilter('highRise')}
                        style={{
                            padding: '9px 17px',
                            marginRight: '5px',
                            backgroundColor: filter === 'highRise' ? '#498AE6' : '#64B5F6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            marginTop:"10px"
                        }}
                    >
                        급격히 상승 (81~100%)
                    </button>
                    <button
                        onClick={() => setFilter('rise')}
                        style={{
                            padding: '9px 17px',
                            marginRight: '5px',
                            backgroundColor: filter === 'rise' ? '#498AE6' : '#64B5F6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            marginTop:"10px"
                        }}
                    >
                        변동률 상위 (51~80%)
                    </button>
                    <button
                        onClick={() => setFilter('noChange')}
                        style={{
                            padding: '9px 17px',
                            marginRight: '5px',
                            backgroundColor: filter === 'noChange' ? '#498AE6' : '#64B5F6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            marginTop:"10px"
                        }}
                    >
                        변동 없음 (0%)
                    </button>
                    <button
                        onClick={() => setFilter('fall')}
                        style={{
                            padding: '9px 17px',
                            marginRight: '5px',
                            backgroundColor: filter === 'fall' ? '#498AE6' : '#64B5F6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            marginTop:"10px"
                        }}
                    >
                        변동률 하위 (30~50%)
                    </button>
                    <button
                        onClick={() => setFilter('highFall')}
                        style={{
                            padding: '9px 17px',
                            marginRight: '5px',
                            backgroundColor: filter === 'highFall' ? '#498AE6' : '#64B5F6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            marginTop:"10px"
                        }}
                    >
                        급격히 하락 (0~29%)
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', marginTop:"16px"  }}>
                <label style={{ marginRight: '10px'}}>가격 범위 (억):</label>
                <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(Number(e.target.value), priceRange[1])}
                    style={{ width: '80px', marginRight: '10px', padding: '5px' }}
                />
                ~
                <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(priceRange[0], Number(e.target.value))}
                    style={{ width: '80px', marginLeft: '10px', padding: '5px' }}
                />
            </div>
            {modalMessage && (
                <div
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        padding: '20px',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                    }}
                >
                    <p>{modalMessage}</p>
                    <button onClick={closeModal} style={{ marginTop: '10px', padding: '8px 16px' }}>
                        확인
                    </button>
                </div>
            )}
            <div id="map" style={{ width: '100%', height: '700px' }}></div>
        </div>
    );
};

export default KakaoMap;
