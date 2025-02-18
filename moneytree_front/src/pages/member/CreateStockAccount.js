import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StockAPI from '../../api/StockAPI';
import { getCookie } from '../../util/cookieUtil';

const CreateStockAccount = () => {
  const [memberInfo, setMemberInfo] = useState({
    memberId: '',
    memberName: '',
    accountNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const memberCookie = getCookie('member');
    if (memberCookie) {
      setMemberInfo((prevInfo) => ({
        ...prevInfo,
        memberId: memberCookie.memberId || '',
        memberName: memberCookie.member_name || '',
      }));

      // 입출금 계좌번호 가져오는 API 호출
      if (memberCookie.memberId) {
        StockAPI.getDandwacAccountNumber(memberCookie.memberId).then((accountNumber) => {
          setMemberInfo((prevInfo) => ({
            ...prevInfo,
            accountNumber: accountNumber || '없음' // 계좌가 없으면 '없음'으로 표시
          }));
        });
      }
    }
  }, []);

  // const handleCreateStockAccount = async () => {
  //   if (!memberInfo.accountNumber) {
  //     alert('입출금 계좌가 없습니다. 먼저 입출금 계좌를 개설해주세요.');
  //     return;
  //   }
  //
  //   setIsLoading(true);
  //   try {
  //     const stockAccount = await StockAPI.createStockAccount(memberInfo.accountNumber);
  //
  //     alert(`주식 계좌가 성공적으로 생성되었습니다.\n계좌번호: ${stockAccount.stockAccountNumber}`);
  //
  //     // 계좌 생성 후 상세 페이지나 메인 페이지로 이동
  //     navigate('/stock-account-detail', {
  //       state: {
  //         stockAccount: stockAccount
  //       }
  //     });
  //   } catch (error) {
  //     console.error('주식 계좌 생성 중 오류:', error);
  //     alert(error.response?.data?.message || '주식 계좌 생성 중 오류가 발생했습니다.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleCreateStockAccount = async () => {
    try {
      const stockAccount = await StockAPI.createStockAccount();
      alert(`주식 계좌가 성공적으로 생성되었습니다.\n계좌번호: ${stockAccount.stockAccountNumber}`);
      navigate('/allmanagement', {
        state: { stockAccount: stockAccount }
      });
    } catch (error) {
      console.error('주식 계좌 생성 중 오류:', error);
      alert(error.response?.data?.message || '주식 계좌 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>주식 계좌 개설</h1>

      <div style={styles.infoContainer}>
        <p><strong>이름:</strong> {memberInfo.memberName}</p>
        <p><strong>아이디:</strong> {memberInfo.memberId}</p>
        <p><strong>연결 계좌:</strong> {memberInfo.accountNumber || '없음'}</p>
      </div>

      <div style={styles.warningContainer}>
        <h3>주식 계좌 개설 안내</h3>
        <ul style={styles.warningList}>
          <li>주식 계좌는 입출금 계좌와 연결됩니다.</li>
          <li>계좌 개설 후 자금 이체가 가능합니다.</li>
          <li>계좌당 1개의 주식 계좌만 개설 가능합니다.</li>
        </ul>
      </div>

      <button
        onClick={handleCreateStockAccount}
        style={styles.createButton}
        disabled={isLoading}  // accountNumber 체크 제거
      >
        {isLoading ? '생성 중...' : '주식 계좌 개설'}
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '40px 20px',
    textAlign: 'center',
  },
  title: {
    marginBottom: '30px',
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#f4f4f4',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  warningContainer: {
    backgroundColor: '#fff3e0',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  warningList: {
    listStyleType: 'none',
    padding: 0,
    textAlign: 'left',
  },
  createButton: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#1890ff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  }
};

export default CreateStockAccount;