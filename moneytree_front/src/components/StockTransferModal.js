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

  // const fetchStockBalance = async (accountNumber) => {
  //   try {
  //     const stockAccount = await StockAPI.getStockAccount(accountNumber);
  //     setStockBalance(stockAccount.stockAccountBalance);
  //   } catch (error) {
  //   }
  // };
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

  return (
    <div className={`stock-transfer-modal ${isOpen ? 'open' : ''}`} style={{ display: isOpen ? 'block' : 'none' }}>
      <div className="stock-transfer-modal-content">
        <h2>주식 계좌 송금</h2>
        <label>
          송금 방향:
          <select value={transferType} onChange={(e) => setTransferType(e.target.value)}>
            <option value="deposit">입출금 → 주식</option>
            <option value="withdraw">주식 → 입출금</option>
          </select>
        </label>
        <p>입출금 계좌번호: {dandwAcId}</p>
        <p>입출금 계좌 잔액: {dandwBalance} 원</p>
        <p>주식 계좌 잔액: {stockBalance} 원</p>
        <label>
          송금 금액:
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <button onClick={handleTransfer}>송금하기</button>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default StockTransferModal;