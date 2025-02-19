// SellerAuthForm.js
import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { getCookie } from '../../util/cookieUtil';

const SellerAuthForm = ({ transactionId, onSuccess }) => {
  const [signature, setSignature] = useState('');
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const memberCookie = useMemo(() => getCookie('member'), []);
  const userId = memberCookie?.memberId || '';

  const getAuthHeaders = () => {
    if (!memberCookie || !memberCookie.accessToken) {
      return {};
    }
    return {
      Authorization: `Bearer ${memberCookie.accessToken}`,
      memberId: userId,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      // 쿼리 파라미터로 보내거나, body로 JSON 전송할 수 있습니다.
      // 여기서는 쿼리 파라미터 방식으로 처리
      const payload = { transactionId, memberId: userId, signature, comments };
      // POST 요청을 보내고, onSuccess 콜백을 호출합니다.
      const response = await axios.post(
        'http://localhost:8080/api/apartment-transactions/submit-seller-auth',
        null, // body는 비워두고
        { params: payload, headers },
      );
      // 제출 후 성공 메시지나, 상위 컴포넌트에서 상태 갱신 등 처리
      if (onSuccess) onSuccess(response.data);
    } catch (err) {
      console.error('서명 제출 오류:', err);
      setError(err.response?.data || '서명 제출 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>매도 인증 문서 제출</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>서명:</label>
        <input
          type="text"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          required
        />
      </div>
      <div>
        <label>비고:</label>
        <textarea value={comments} onChange={(e) => setComments(e.target.value)} />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? '제출 중...' : '제출'}
      </button>
    </form>
  );
};

export default SellerAuthForm;
