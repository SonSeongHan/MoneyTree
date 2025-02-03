import React, { useState, useEffect } from 'react';
import { changePassword } from '../api/MemberAPI'; // API 호출 함수 import
import { getMemberIdFromCookie } from '../util/cookieUtil'; // ✅ 쿠키에서 memberId 가져오기

const AccountManagement = () => {
    const [memberId, setMemberId] = useState(""); // ✅ 쿠키에서 가져온 아이디
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [message, setMessage] = useState('');

    // ✅ 컴포넌트 마운트 시 쿠키에서 memberId 가져오기
    useEffect(() => {
        const storedMemberId = getMemberIdFromCookie();
        if (storedMemberId) {
            setMemberId(storedMemberId); // 상태값 업데이트
        }
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!memberId || !currentPassword || !newPassword || !confirmNewPassword) {
            setMessage('모든 필드를 입력해주세요.');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setMessage('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const response = await changePassword({
                memberId,  // ✅ 쿠키에서 가져온 아이디 (수정 불가)
                memberpassword: currentPassword, // 현재 비밀번호
                accountNumber: newPassword, // 새 비밀번호
            });

            if (response.status === 200) {
                alert('비밀번호가 성공적으로 변경되었습니다.');
                window.location.href = "/home"; // ✅ 새로고침하며 홈으로 이동
            } else if (response.status === 401) {
                setMessage("현재 비밀번호가 일치하지 않습니다."); // ✅ 비밀번호 오류 메시지 표시
            } else {
                setMessage("비밀번호 변경 실패: 알 수 없는 오류가 발생했습니다.");
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setMessage("현재 비밀번호가 일치하지 않습니다."); // ✅ API 응답이 401이면 오류 메시지 표시
            } else {
                setMessage("비밀번호 변경 실패: 서버 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h2>비밀번호 변경</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="memberId">회원 아이디: </label>
                    <input
                        type="text"
                        id="memberId"
                        value={memberId}
                        disabled // ✅ 수정 불가능하도록 설정
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="currentPassword">현재 비밀번호: </label>
                    <input
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="newPassword">새 비밀번호: </label>
                    <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="confirmNewPassword">새 비밀번호 확인: </label>
                    <input
                        type="password"
                        id="confirmNewPassword"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">비밀번호 변경</button>
            </form>
            {message && <div style={{ marginTop: '20px', color: 'red' }}>{message}</div>}
        </div>
    );
};

export default AccountManagement;
