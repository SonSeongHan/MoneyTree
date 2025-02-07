import React, { useState } from 'react';
import axios from 'axios';
import { setCookie } from '../../util/cookieUtil'; // 쿠키 관련 유틸리티 임포트

const AdminLogin = () => {
    const [memberId, setMemberId] = useState('');
    const [memberpassword, setMemberpassword] = useState('');
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // POST 요청으로 관리자 로그인 엔드포인트 호출
            const response = await axios.post('http://localhost:8080/api/admin/login', {
                memberId,
                memberpassword
            }, {
                // 필요한 경우 CORS 설정이나 withCredentials 옵션 추가
                withCredentials: true
            });

            // 로그인 성공 시 처리 (예: 토큰 저장, 관리자 페이지로 리다이렉트 등)
            console.log('로그인 성공:', response.data);

            // // setCookie 함수를 사용하여 "member" 이름으로 로그인 응답 데이터를 쿠키에 저장 (1일 동안 유효)
            setCookie('member', response.data, 1);

            // 예: 관리자 메인 페이지로 이동
            window.location.href = '/admin/page';
        } catch (err) {
            console.error('로그인 실패:', err);
            setError('로그인에 실패하였습니다. 아이디와 비밀번호를 확인해주세요.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h2>관리자 로그인</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>아이디:</label>
                    <input
                        type="text"
                        value={memberId}
                        onChange={(e) => setMemberId(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>비밀번호:</label>
                    <input
                        type="password"
                        value={memberpassword}
                        onChange={(e) => setMemberpassword(e.target.value)}
                        required
                    />
                </div>
                {error && <div style={{ color: 'red' }}>{error}</div>}
                <button type="submit">로그인</button>
            </form>
        </div>
    );
};

export default AdminLogin;
