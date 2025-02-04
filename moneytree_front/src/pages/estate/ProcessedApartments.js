import React, { useEffect, useState } from 'react';
import rawData from '../../data/one_priced_apartment_data.json'; // JSON 파일 로드

const ProcessedApartments = () => {
  const [apartments, setApartments] = useState([]);

  useEffect(() => {
    const processApartments = () => {
      const processedData = rawData.map((apt) => {
        const prices = apt.prices;
        const validPrices = prices.filter(
          (p) => p.year && !isNaN(parseInt(p.year, 10)) && p.price !== undefined,
        );
        const years = validPrices.map((p) => parseInt(p.year, 10));

        if (years.length === 0) {
          return {
            ...apt,
            최신거래가: null,
            최고가: null,
            변동률: '정보 없음',
          };
        }

        const latestYear = Math.max(...years);
        const initialYear = Math.min(...years);
        const latestPrice = prices.find((p) => parseInt(p.year, 10) === latestYear)?.price || null;
        const initialPrice =
          prices.find((p) => parseInt(p.year, 10) === initialYear)?.price || null;
        const maxPrice = Math.max(...prices.map((p) => p.price));

        const changeRate = initialPrice
          ? ((latestPrice - initialPrice) / initialPrice) * 100
          : null;

        return {
          ...apt,
          최신거래가: latestPrice,
          최고가: maxPrice,
          변동률: changeRate !== null ? changeRate.toFixed(2) : '정보 없음',
        };
      });

      setApartments(processedData);
    };
    processApartments();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>아파트 데이터</h1>
      <ul style={{ listStyle: 'none', padding: '0' }}>
        {apartments.map((apt, index) => (
          <li
            key={index}
            style={{
              marginBottom: '20px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
            }}
          >
            <strong>{apt['단지명']}</strong>
            <p>도로명: {apt['도로명']}</p>
            <p>전용 면적: {apt['전용면적(㎡)']}㎡</p>
            <p>
              최신 거래가:{' '}
              {apt.최신거래가 !== null ? `${(apt.최신거래가 / 10000).toFixed(2)}억` : '정보 없음'}
            </p>
            <p>
              최고가: {apt.최고가 !== null ? `${(apt.최고가 / 10000).toFixed(2)}억` : '정보 없음'}
            </p>
            <p>
              변동률:{' '}
              <span style={{ color: apt.변동률 > 0 ? 'green' : 'red' }}>
                {apt.변동률 !== '정보 없음' ? `${apt.변동률}%` : apt.변동률}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProcessedApartments;
