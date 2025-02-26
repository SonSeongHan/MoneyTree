import React, { useState, useEffect } from "react";
import StockAPI from "../api/StockAPI";
import { getCookie } from "../util/cookieUtil";
import "../css/StockTransferModal.css";

const StockTransferModal = ({ isOpen, onClose }) => {
  const [transferType, setTransferType] = useState("deposit"); // 입금 or 출금
  const [amount, setAmount] = useState(""); // 송금 금액
  const [stockBalance, setStockBalance] = useState(0); // 주식 계좌 잔액
  const [dandwAcId, setDandwAcId] = useState(""); // 입출금 계좌 ID
  const [dandwBalance, setDandwBalance] = useState(0); // 입출금 계좌 잔액
  const [stockAccountNumber, setStockAccountNumber] = useState("");

  useEffect(() => {
    const memberCookie = getCookie("member");

    if (memberCookie && memberCookie.memberId) {
      fetchDandwacAccountNumber(memberCookie.memberId);
    }

    if (stockAccountNumber) {
      fetchStockBalance(stockAccountNumber);
    }
  }, [stockAccountNumber]);

  const fetchDandwacAccountNumber = async (memberId) => {
    try {
      const accountNumber = await StockAPI.getDandwacAccountNumber(memberId);

      if (!accountNumber) {
        return;
      }

      setDandwAcId(accountNumber);
      await fetchDandwacBalance(accountNumber);

      // 입출금계좌로 주식계좌 조회 추가
      const stockAccount = await StockAPI.getStockAccount(accountNumber);
      setStockAccountNumber(stockAccount.stockAccountNumber);
      setStockBalance(stockAccount.stockAccountBalance);

    } catch (error) {
    }
  };

  const fetchDandwacBalance = async (accountId) => {
    try {
      const balance = await StockAPI.getDandwacBalance(accountId);
      setDandwBalance(balance);
    } catch (error) {
    }
  };

  const fetchStockBalance = async (accountNumber) => {
    try {
      // 입출금계좌번호로 주식계좌 조회
      const stockAccount = await StockAPI.getStockAccount(dandwAcId);  // stockAccountNumber 대신 dandwAcId 사용
      if (stockAccount) {
        setStockBalance(stockAccount.stockAccountBalance);
      }
    } catch (error) {
    }
  };

  const handleTransfer = async () => {

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("올바른 금액을 입력하세요.");
      return;
    }

    if (!dandwAcId) {
      alert("입출금 계좌 정보를 가져오는데 실패했습니다.");
      return;
    }

    if (!stockAccountNumber) {
      alert("주식 계좌 정보를 가져오는데 실패했습니다.");
      return;
    }
    try {
      if (transferType === "deposit") {
        await StockAPI.depositToStockAccount(
          dandwAcId,
          Number(stockAccountNumber),
          Number(amount)
        );
      } else {
        await StockAPI.withdrawFromStockAccount(
          Number(stockAccountNumber),
          dandwAcId,
          Number(amount)
        );
      }
      alert("송금이 완료되었습니다!");
      setAmount("");
      await fetchStockBalance(dandwAcId);  // stockAccountNumber 대신 dandwAcId 전달
      await fetchDandwacBalance(dandwAcId);
    } catch (error) {
      console.error("송금 중 에러 발생:", error);
      alert("송금 중 오류가 발생했습니다.");
    }
  };

  // 원화 표시 포맷 함수
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
  };

  // 송금방향 화살표 표시를 위한 함수
  const renderTransferArrow = () => {
    if (transferType === "deposit") {
      return (
        <div className="transfer-direction-arrow">
          <div className="arrow-text">입출금</div>
          <div className="arrow">→</div>
          <div className="arrow-text">주식</div>
        </div>
      );
    } else {
      return (
        <div className="transfer-direction-arrow">
          <div className="arrow-text">주식</div>
          <div className="arrow">→</div>
          <div className="arrow-text">입출금</div>
        </div>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="stock-transfer-modal-overlay" onClick={onClose}>
      <div className="stock-transfer-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="stock-transfer-modal-header">
          <h2>주식 계좌 송금</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="stock-transfer-modal-body">
          <div className="transfer-type-container">
            <label className="transfer-select-label">송금 방향:</label>
            <select
              className="transfer-select"
              value={transferType}
              onChange={(e) => setTransferType(e.target.value)}
            >
              <option value="deposit">입출금 → 주식</option>
              <option value="withdraw">주식 → 입출금</option>
            </select>
          </div>

          {renderTransferArrow()}

          <div className="account-info-container">
            <div className="account-card">
              <div className="account-title">입출금 계좌</div>
              <div className="account-number">{dandwAcId || "-"}</div>
              <div className="account-balance">{formatCurrency(dandwBalance)}</div>
            </div>

            <div className="account-card">
              <div className="account-title">주식 계좌</div>
              <div className="account-number">{stockAccountNumber || "-"}</div>
              <div className="account-balance">{formatCurrency(stockBalance)}</div>
            </div>
          </div>

          <div className="transfer-amount-container">
            <label className="amount-label">송금 금액:</label>
            <div className="amount-input-wrapper">
              <input
                type="number"
                className="amount-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
              <div className="amount-currency">원</div>
            </div>
          </div>
        </div>

        <div className="stock-transfer-modal-footer">
          <button className="transfer-button" onClick={handleTransfer}>송금하기</button>
          <button className="cancel-button" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default StockTransferModal;