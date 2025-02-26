import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCookie } from "../../util/cookieUtil";
import { withdrawMember } from "../../api/MemberAPI";
import StockAPI from '../../api/StockAPI';
import StockTransferModal from "../../components/StockTransferModal";
import "../../css/AllManagement.css";

function AccountManagement() {
    const [memberInfo, setMemberInfo] = useState({
        memberId: "",
        memberName: "",
        membershipType: "",
    });

    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [stockAccountNumber, setStockAccountNumber] = useState(null);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [encryptData, setEncryptData] = useState(false);
    const [locationServices, setLocationServices] = useState(false);
    const [privateNotes, setPrivateNotes] = useState(true);

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
      <div className="member-account-layout">
          {/* Sidebar */}
          <div className="member-sidebar">
              <div className="member-project-header">
                  <h2>회원정보</h2>
              </div>

              <div className="member-user-profile">
                  <div className="member-profile-image">

                  </div>
                  <p className="member-user-name">{memberInfo.memberName}</p>
              </div>

              <nav className="member-sidebar-menu">
                  <ul>
                      <li>
                          <i className="member-icon member-account-icon"></i>
                          <span>Account</span>
                      </li>
                  </ul>
              </nav>

              <div className="member-sidebar-footer">
                  <button className="member-logout-button">

                      <Link to="/">
                          X
                      </Link>

                  </button>
              </div>
          </div>

          {/* Main Content */}
          <div className="member-main-content">
              <div className="member-content-header">
                  <h1>Account</h1>
                  <button className="member-connect-button">Connect with Money Tree</button>
              </div>

              <div className="member-google-drive-sync">

                  <span>Member</span>
              </div>

              <div className="member-settings-form">
                  <div className="member-form-group">
                      <label>Email address:</label>
                      <input type="email" value={memberInfo.memberId} readOnly/>
                  </div>

                  <div className="member-toggle-setting">
                      <div className="member-setting-info">
                          <Link to="/change-password" className="member-action-button">
                              비밀번호 변경
                          </Link>

                      </div>
                      <label className="member-toggle">
                          <input
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={() => setEmailNotifications(!emailNotifications)}
                          />
                          <span className="member-slider"></span>
                      </label>
                  </div>

                  <div className="member-toggle-setting">
                      <div className="member-setting-info">
                          <Link to="/change-name" className="member-action-button">
                              이름 변경
                          </Link>
                      </div>
                      <label className="member-toggle">
                          <input
                            type="checkbox"
                            checked={encryptData}
                            onChange={() => setEncryptData(!encryptData)}
                          />
                          <span className="member-slider"></span>
                      </label>
                  </div>

                  <div className="member-toggle-setting">
                      <Link to="/make-account" className="member-action-button">
                          계좌생성
                      </Link>
                      <label className="member-toggle">

                          <span className="member-slider"></span>
                      </label>
                  </div>

                  <div className="member-toggle-setting">
                      <div className="member-setting-info">
                          <Link to="/create-stock-account" className="member-action-button">
                              주식 계좌 생성
                          </Link>
                      </div>
                      <label className="member-toggle">
                          <input
                            type="checkbox"
                            checked={privateNotes}
                            onChange={() => setPrivateNotes(!privateNotes)}
                          />
                          <span className="member-slider"></span>
                      </label>
                  </div>

                  <div className="member-manage-users-setting">
                      <button onClick={handleOpenStockTransferModal} className="member-action-button">
                          주식 송금하기
                      </button>
                      <button className="member-manage-users-button">주식 송금을 위해서 필수입니다.</button>
                  </div>

                  <div className="member-manage-users-setting">
                      <Link to="/reissue-certificate" className="member-action-button">
                          인증서 발급
                      </Link>
                      <button className="member-manage-users-button">쉽고 빠르고 안전하게 로그인해보세요.</button>
                  </div>

                  <div className="member-manage-users-setting">
                      <button onClick={handleWithdraw} className="member-action-button member-withdraw-button">
                          회원 탈퇴
                      </button>
                      <button className="member-manage-users-button">정말 탈퇴하시겠습니까?</button>
                  </div>
              </div>
          </div>

          <StockTransferModal
            isOpen={isStockModalOpen}
            onClose={() => setIsStockModalOpen(false)}
            stockAccountNumber={stockAccountNumber}
          />
      </div>
    );
}

export default AccountManagement;