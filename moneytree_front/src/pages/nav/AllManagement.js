import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCookie } from "../../util/cookieUtil";
import { withdrawMember } from "../../api/MemberAPI";
import StockAPI from '../../api/StockAPI';
import StockTransferModal from "../../components/StockTransferModal";

function AllManagement() {
    const [memberInfo, setMemberInfo] = useState({
        memberId: "",
        memberName: "",
        membershipType: "",
    });

    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [stockAccountNumber, setStockAccountNumber] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const memberCookie = getCookie("member");
        if (memberCookie) {
            setMemberInfo({
                memberId: memberCookie.memberId || "알 수 없음",
                memberName: memberCookie.member_name || "알 수 없음",
                membershipType: memberCookie.membershipType || "알 수 없음",
            });
        }
    }, []);

    const deleteCookie = (name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    };

    const handleWithdraw = async () => {
        if (!window.confirm("정말로 회원 탈퇴하시겠습니까?")) {
            return;
        }
        try {
            await withdrawMember(memberInfo.memberId);
            deleteCookie("member");
            alert("회원 탈퇴가 완료되었습니다.");
            navigate("/");
        } catch (error) {
            console.error("회원 탈퇴 중 오류 발생:", error);
            alert("회원 탈퇴 중 오류가 발생했습니다.");
        }
    };

    const handleOpenStockTransferModal = async () => {
        try {
            const dandwAcId = await StockAPI.getDandwacAccountNumber(memberInfo.memberId);
            if (!dandwAcId) {
                throw new Error("입출금 계좌를 찾을 수 없습니다.");
            }

            const stockAccount = await StockAPI.getStockAccount(dandwAcId);
            setStockAccountNumber(stockAccount.stockAccountNumber);
            setIsStockModalOpen(true);
        } catch (error) {
            console.error("주식 계좌 조회 중 오류 발생:", error);
            alert(error.message || "주식 계좌 정보를 불러올 수 없습니다.");
        }
    };

    return (
      <div style={styles.container}>
          <div style={styles.memberInfo}>
              <h1>회원 정보</h1>
              <p>
                  <strong>아이디:</strong> {memberInfo.memberId}
              </p>
              <p>
                  <strong>이름:</strong> {memberInfo.memberName}
              </p>
              <p>
                  <strong>회원 유형:</strong> {memberInfo.membershipType}
              </p>
          </div>

          <div style={styles.menuContainer}>
              <Link to="/change-password" style={styles.linkButton}>
                  비밀번호 변경
              </Link>
              <Link to="/change-name" style={styles.linkButton}>
                  이름 변경
              </Link>
              <Link to="/make-account" style={styles.linkButton}>
                  계좌생성
              </Link>
              <Link to="/create-stock-account" style={styles.linkButton}>
                  주식 계좌 생성
              </Link>
              <button onClick={handleOpenStockTransferModal} style={styles.linkButton}>
                  주식 송금하기
              </button>
              <Link to="/reissue-certificate" style={styles.linkButton}>
                  인증서 발급
              </Link>
              <button onClick={handleWithdraw} style={styles.withdrawButton}>
                  회원 탈퇴
              </button>
          </div>

          <StockTransferModal
            isOpen={isStockModalOpen}
            onClose={() => setIsStockModalOpen(false)}
            stockAccountNumber={stockAccountNumber}
          />
      </div>
    );
}

const styles = {
    container: {
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    memberInfo: {
        marginBottom: "40px",
        textAlign: "center",
    },
    menuContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "20px",
    },
    linkButton: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "180px",
        height: "60px",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "4px",
        textDecoration: "none",
        color: "#000",
        fontSize: "16px",
        fontWeight: "bold",
    },
    withdrawButton: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "180px",
        height: "60px",
        backgroundColor: "#ff4d4f",
        border: "none",
        borderRadius: "4px",
        color: "#fff",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
    },
};

export default AllManagement;