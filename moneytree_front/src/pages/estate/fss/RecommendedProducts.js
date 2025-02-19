// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const RecommendedProducts = ({ currentPrice, inputPrice }) => {
//   const [recommendations, setRecommendations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (inputPrice >= currentPrice) {
//       setRecommendations([]);
//       setLoading(false);
//       return;
//     }
//     axios
//       .get('http://localhost:8080/api/recommendations/price-gap', {
//         params: { currentPrice, inputPrice },
//       })
//       .then((response) => {
//         setRecommendations(response.data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error('추천 상품 조회 오류:', err);
//         setError('추천 상품 조회 중 오류가 발생했습니다.');
//         setLoading(false);
//       });
//   }, [currentPrice, inputPrice]);

//   if (loading) return <div>Loading recommendations...</div>;
//   if (error) return <div>Error: {error}</div>;
//   if (recommendations.length === 0) return <div>추천 상품이 없습니다.</div>;

//   return (
//     <div>
//       <h2>추천 상품</h2>
//       <ul>
//         {recommendations.map((product) => (
//           <li key={product.id}>
//             <strong>{product.finPrdtNm}</strong> ({product.korCoNm}) - 추천 가격:{' '}
//             {product.recommendedPrice}만원
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default RecommendedProducts;
