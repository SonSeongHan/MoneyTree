// TransferForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOwnerName, transferMoney } from '../../api/AccountAPI';

function TransferForm() {
    const [receiverAccountId, setReceiverAccountId] = useState('');
    const [amount, setAmount] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false); // 로딩 상태 추가

    const navigate = useNavigate();

    // 1) 계좌주 확인
    const handleCheckOwner = async () => {
        if (!receiverAccountId) {
            setMessage('계좌 번호를 입력하세요.');
            return;
        }

        try {
            setMessage('');
            setLoading(true);
            const name = await getOwnerName(receiverAccountId);
            setOwnerName(name);
            setMessage('');
        } catch (error) {
            console.error(error);
            setMessage(error?.response?.data || '계좌 정보를 찾을 수 없습니다.');
            setOwnerName('');
        } finally {
            setLoading(false);
        }
    };

    // 2) 송금
    const handleTransfer = async () => {
        if (!ownerName) {
            alert('계좌 확인을 먼저 해주세요.');
            return;
        }

        if (!amount || Number(amount) <= 0) {
            setMessage('유효한 송금 금액을 입력하세요.');
            return;
        }

        const confirmMsg = `${ownerName}님에게 ${Number(amount).toLocaleString()}원 송금하시겠습니까?`;
        if (!window.confirm(confirmMsg)) return;

        const inputPassword = prompt('비밀번호:');
        if (!inputPassword) {
            setMessage('비밀번호를 입력하지 않았습니다.');
            return;
        }

        try {
            setLoading(true);
            await transferMoney(receiverAccountId, inputPassword, Number(amount));
            alert('송금이 성공적으로 완료되었습니다.');
            navigate('/home');
        } catch (error) {
            console.error(error);
            setMessage(error || '송금 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>송금하기</h2>
            <div>
                <label>계좌 번호:</label>
                <input
                    type="text"
                    value={receiverAccountId}
                    onChange={(e) => setReceiverAccountId(e.target.value)}
                    placeholder="계좌 번호를 입력하세요"
                />
                <button type="button" onClick={handleCheckOwner} disabled={loading}>
                    {loading ? '확인 중...' : '계좌주 확인'}
                </button>
            </div>

            {ownerName && <p>계좌 주인: {ownerName}</p>}

            <div>
                <label>송금 금액:</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="송금할 금액을 입력하세요"
                    min="1"
                />
            </div>

            <button type="button" onClick={handleTransfer} disabled={loading}>
                {loading ? '송금 중...' : '송금'}
            </button>

            {message && <p style={{ color: 'red' }}>{message}</p>}
        </div>
    );
}

export default TransferForm;
