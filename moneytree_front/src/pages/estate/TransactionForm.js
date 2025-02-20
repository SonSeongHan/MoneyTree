// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const TransactionForm = ({ apartments, userId, accountBalance, navigate }) => {
//   const [sellerId, setSellerId] = useState('');
//   const [apartmentName, setApartmentName] = useState('');
//   const [price, setPrice] = useState('');
//   const [remarks, setRemarks] = useState('');
//   const [sellerExists, setSellerExists] = useState(null);
//   const [latestPrice, setLatestPrice] = useState(null);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (apartmentName) {
//       const apt = apartments.find((a) => a.name === apartmentName);
//       if (apt) {
//         setLatestPrice(apt.currentPrice);
//       }
//     }
//   }, [apartmentName, apartments]);

//   const checkSellerExists = () => {
//     if (!sellerId || sellerId.trim() === '') {
//       setSellerExists('empty');
//       return;
//     }
//     axios
//       .get(`http://localhost:8080/api/members/${encodeURIComponent(sellerId)}`)
//       .then((res) => {
//         if (res.data.exists) {
//           setSellerExists('exists');
//         } else {
//           setSellerExists('not_exists');
//         }
//       })
//       .catch((err) => {
//         setError('매도자 ID 확인 오류');
//         console.error(err);
//         setSellerExists('error');
//       });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setError('');
//     if (!userId) {
//       setError('로그인이 필요합니다.');
//       return;
//     }
//     if (sellerExists !== 'exists') {
//       alert('매도자 ID를 확인해 주세요.');
//       return;
//     }
//     if (parseInt(price, 10) < parseInt(latestPrice, 10)) {
//       const confirmResult = window.confirm(
//         '거래가격이 현재 가격보다 부족합니다. 대출 상품 페이지로 이동하시겠습니까?',
//       );
//       if (confirmResult) {
//         navigate('/estate/fss/mortgage-loan-products');
//       }
//       return;
//     }
//     if (accountBalance !== null && accountBalance < parseInt(price, 10) * 10000) {
//       alert('계좌 잔액이 부족하여 거래를 진행할 수 없습니다.');
//       const loanConfirm = window.confirm('대출 상품 추천 페이지로 이동하시겠습니까?');
//       if (loanConfirm) {
//         navigate('/estate/fss/mortgage-loan-products');
//       }
//       return;
//     }

//     // 거래 생성 로직 (API 호출)
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <div className="form-group">
//         <label>매도자 ID:</label>
//         <input
//           type="text"
//           value={sellerId}
//           onChange={(e) => setSellerId(e.target.value)}
//           required
//         />
//         <button type="button" onClick={checkSellerExists}>
//           매도자 ID 확인
//         </button>
//         {sellerExists === 'empty' && <p>아이디를 입력해주세요.</p>}
//         {sellerExists === 'exists' && <p>해당 회원이 존재합니다.</p>}
//         {sellerExists === 'not_exists' && <p>해당 회원이 존재하지 않습니다.</p>}
//         {sellerExists === 'error' && <p>매도자 ID 확인 중 오류가 발생했습니다.</p>}
//       </div>

//       <div className="form-group">
//         <label>아파트 단지명:</label>
//         <select value={apartmentName} onChange={(e) => setApartmentName(e.target.value)} required>
//           <option value="">선택하세요</option>
//           {apartments.map((apt) => (
//             <option key={apt.id} value={apt.name}>
//               {apt.name}
//             </option>
//           ))}
//         </select>
//         {latestPrice !== null && <p>현재 가격: {latestPrice} 만원</p>}
//       </div>

//       <div className="form-group">
//         <label>가격:</label>
//         <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
//       </div>

//       <div className="form-group">
//         <label>비고:</label>
//         <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
//       </div>

//       <button type="submit">거래 요청 생성</button>
//       {error && <p className="error">{error}</p>}
//     </form>
//   );
// };

// export default TransactionForm;
