import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPage = () => {
    const [members, setMembers] = useState([]);
    const [error, setError] = useState(null);

    // 컴포넌트 마운트 시 백엔드로부터 회원 목록을 조회합니다.
    useEffect(() => {
        axios.get('http://localhost:8080/api/admin/members', { withCredentials: true })
            .then(response => {
                // 예시: 백엔드가 [{ memberId, membershipType, member_created_day, deleted }, ...] 형식으로 응답한다고 가정합니다.
                setMembers(response.data);
            })
            .catch(err => {
                console.error('회원 정보를 불러오는 중 오류 발생:', err);
                setError('회원 정보를 불러오는 데 실패하였습니다.');
            });
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>회원 관리 페이지</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', textAlign: 'left' }}>
                <thead>
                <tr>
                    <th>회원 ID</th>
                    <th>회원 유형</th>
                    <th>가입일</th>
                    <th>탈퇴 여부</th>
                </tr>
                </thead>
                <tbody>
                {members.length > 0 ? (
                    members.map(member => (
                        <tr key={member.memberId}>
                            <td>{member.memberId}</td>
                            <td>{member.membershipType}</td>
                            <td>{new Date(member.member_created_day).toLocaleString()}</td>
                            <td>{member.deleted ? '탈퇴' : '활동중'}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" style={{ textAlign: 'center' }}>회원 정보가 없습니다.</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPage;
