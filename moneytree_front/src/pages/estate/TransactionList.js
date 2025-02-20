// import React, { useState } from 'react';

// const TransactionList = ({
//   transactions,
//   role,
//   totalPages,
//   currentPage,
//   onPrevPage,
//   onNextPage,
//   userId,
//   handleCompleteTransaction,
//   handleCancelTransaction,
//   handleConsentForTransaction,
// }) => {
//   const [signatureInputs, setSignatureInputs] = useState({});

//   return (
//     <section>
//       <h2>{role === 'buyer' ? '내 거래 내역' : '매도 거래 목록'}</h2>
//       {transactions.length === 0 ? (
//         <p>거래 내역이 없습니다.</p>
//       ) : (
//         <ul>
//           {transactions.map((tx) => (
//             <li key={tx.id}>
//               <p>거래 ID: {tx.id}</p>
//               <p>매수자: {tx.buyerId}</p>
//               <p>매도자: {tx.sellerId}</p>
//               <p>아파트: {tx.apartmentName}</p>
//               <p>거래 가격: {tx.price} 만원</p>
//               <p>거래일자: {new Date(tx.transactionDate).toLocaleString()}</p>
//               <p>비고: {tx.remarks || '없음'}</p>

//               {/* 매도 인증 문서 보기 버튼 (매도자만 확인 가능) */}
//               {tx.status === 'PENDING' && tx.sellerId === userId && (
//                 <div className="consent-buttons">
//                   <button
//                     onClick={() => {
//                       const sellerAuthUrl = `http://localhost:8080/api/apartment-transactions/seller-auth-html/${tx.id}?memberId=${userId}`;
//                       window.open(sellerAuthUrl, '_blank');
//                     }}
//                   >
//                     매도 인증 문서 보기
//                   </button>

//                   {/* 서명 완료 버튼 */}
//                   <input
//                     type="text"
//                     placeholder="매도자 서명 입력"
//                     value={signatureInputs[tx.id] || ''}
//                     onChange={(e) =>
//                       setSignatureInputs((prev) => ({ ...prev, [tx.id]: e.target.value }))
//                     }
//                     className="signature-input"
//                   />
//                   <button
//                     className="consent-complete-btn"
//                     onClick={() => handleConsentForTransaction(tx.id)}
//                   >
//                     서명 완료
//                   </button>
//                 </div>
//               )}

//               {/* 거래 수락 및 취소 버튼 */}
//               {tx.status === 'PENDING' && tx.consentGiven && (
//                 <>
//                   <button className="complete-btn" onClick={() => handleCompleteTransaction(tx.id)}>
//                     거래 수락
//                   </button>
//                   <button className="cancel-btn" onClick={() => handleCancelTransaction(tx.id)}>
//                     거래 취소
//                   </button>
//                 </>
//               )}

//               {/* 거래 취소 버튼 (상태가 'PENDING'이 아닌 경우에도 취소 가능) */}
//               {tx.status !== 'PENDING' && (
//                 <button className="cancel-btn" onClick={() => handleCancelTransaction(tx.id)}>
//                   거래 취소
//                 </button>
//               )}
//             </li>
//           ))}
//         </ul>
//       )}
//       <div className="pagination">
//         <button onClick={onPrevPage} disabled={currentPage === 1}>
//           이전
//         </button>
//         <span>
//           {currentPage} / {totalPages}
//         </span>
//         <button onClick={onNextPage} disabled={currentPage === totalPages}>
//           다음
//         </button>
//       </div>
//     </section>
//   );
// };

// export default TransactionList;
