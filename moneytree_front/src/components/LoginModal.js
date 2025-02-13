import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setCookie } from '../util/cookieUtil';
// 만약 CertificateLogin 컴포넌트를 사용하지 않는다면 아래 줄을 주석 처리하거나 삭제하세요.
import CertificateLogin from '../pages/member/CertificateLogin';
import styles from '../css/estate/LoginModal.module.css';

const LoginModal = ({ isOpen, onClose }) => {
  // 모든 hook은 컴포넌트 최상위에서 호출
  const [userType, setUserType] = useState('SimpleMember');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rrn, setRrn] = useState(''); // 정회원용 주민등록번호
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSimpleSignUp = () => {
    onClose();
    navigate('/member/simple/make');
  };

  const handleFullSignUp = () => {
    onClose();
    navigate('/member/full/make');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const formData = new URLSearchParams();
      formData.append('memberId', userId);
      formData.append('memberpassword', password);
      if (userType === 'FullMember') {
        formData.append('residentRegistrationNumber', rrn);
      }

      const response = await axios.post('http://localhost:8080/api/members/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response && response.data) {
        const { memberId, member_name, membershipType, accessToken, refreshToken } = response.data;
        setCookie(
          'member',
          JSON.stringify({ memberId, member_name, membershipType, accessToken, refreshToken }),
          1,
        );
        setSuccessMessage('로그인 성공!');
        onClose();
        navigate('/home');
      }
    } catch (error) {
      const serverErrorMessage = error.response?.data?.message || '로그인 중 오류가 발생했습니다.';
      setErrorMessage(serverErrorMessage);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.modalTitle}>로그인</h2>
        <div className={styles.userTypeSelection}>
          <label>
            <input
              type="radio"
              value="SimpleMember"
              checked={userType === 'SimpleMember'}
              onChange={() => setUserType('SimpleMember')}
            />
            간편회원
          </label>
          <label>
            <input
              type="radio"
              value="FullMember"
              checked={userType === 'FullMember'}
              onChange={() => setUserType('FullMember')}
            />
            정회원
          </label>
          <label>
            <input
              type="radio"
              value="Certificate"
              checked={userType === 'Certificate'}
              onChange={() => setUserType('Certificate')}
            />
            인증서
          </label>
        </div>
        {userType === 'Certificate' ? (
          <p>인증서 로그인은 준비중입니다.</p>
        ) : (
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label>아이디</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
            {userType === 'FullMember' && (
              <div className={styles.formGroup}>
                <label>주민등록번호 (13자리)</label>
                <input
                  type="text"
                  value={rrn}
                  onChange={(e) => setRrn(e.target.value)}
                  placeholder="예: 1234561234567"
                  pattern="\d{13}"
                  required
                />
              </div>
            )}
            <div className={styles.formGroup}>
              <label>비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.loginButton}>
              로그인
            </button>
          </form>
        )}
        <div className={styles.signupButtons}>
          <button onClick={handleSimpleSignUp}>간편회원가입</button>
          <button onClick={handleFullSignUp}>정회원가입</button>
        </div>
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
      </div>
    </div>
  );
};

export default LoginModal;
