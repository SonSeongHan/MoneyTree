// MemberDetailPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const MemberDetailPage = () => {
    const { memberId } = useParams();
    const [memberDetail, setMemberDetail] = useState(null);
    const [error, setError] = useState(null);

    // memberId 기반으로 회원 상세 정보(송금 내역 포함) 조회
    useEffect(() => {
        axios
            .get(`http://localhost:8080/api/admin/members/${memberId}`, { withCredentials: true })
            .then(response => {
                setMemberDetail(response.data);
            })
            .catch(err => {
                console.error('회원 상세 정보를 불러오는 중 오류 발생:', err);
                setError('회원 상세 정보를 불러오는 데 실패하였습니다.');
            });
    }, [memberId]);

    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!memberDetail) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>{memberDetail.memberId}님의 상세 정보</h1>
            <p>
                <strong>잔액:</strong> {memberDetail.balance} 원
            </p>
            <p>
                <strong>가입 상품:</strong>{' '}
                {memberDetail.subscribedProducts && memberDetail.subscribedProducts.length > 0
                    ? memberDetail.subscribedProducts.join(', ')
                    : '없음'}
            </p>
            <p>
                <strong>취미:</strong>{' '}
                {memberDetail.hobbies && memberDetail.hobbies.length > 0
                    ? memberDetail.hobbies.join(', ')
                    : '없음'}
            </p>

            <h2>송금 내역</h2>
            {memberDetail.transferHistory && memberDetail.transferHistory.length > 0 ? (
                <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', textAlign: 'left' }}>
                    <thead>
                    <tr>
                        <th>거래 ID</th>
                        <th>거래 유형</th>
                        <th>금액</th>
                        <th>날짜</th>
                        <th>보낸 사람</th>
                        <th>받은 사람</th>
                    </tr>
                    </thead>
                    <tbody>
                    {memberDetail.transferHistory.map(tx => (
                        <tr key={tx.id}>
                            <td>{tx.id}</td>
                            <td>{tx.transactionType}</td>
                            <td>{tx.amount}</td>
                            <td>{new Date(tx.createdAt).toLocaleString()}</td>
                            <td>{tx.fromMemberName}</td>
                            <td>{tx.toMemberName}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>송금 내역이 없습니다.</p>
            )}

            <div style={{ marginTop: '20px' }}>
                <Link to="/admin/page">회원 목록으로 돌아가기</Link>
            </div>
        </div>
    );
};

export default MemberDetailPage;
