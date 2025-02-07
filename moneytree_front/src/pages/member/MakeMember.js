// src/pages/MakeMember.js
import React, { useState } from "react";
import { createMember } from "../../api/MemberAPI"; // 회원가입 API 호출
import { sendVerificationEmail, verifyCode } from "../../api/MailAPI"; // 인증번호 발송 및 검증 API 호출
import { useNavigate } from "react-router-dom";

const MakeMember = () => {
  // 이메일 및 인증 관련 상태
  const [email, setEmail] = useState(""); // 이메일 입력값
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationInput, setVerificationInput] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // 추가 회원가입 입력 필드 상태 (인증 완료 후 작성)
  const [memberName, setMemberName] = useState("");
  const [residentRegistrationNumber, setResidentRegistrationNumber] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberAddress, setMemberAddress] = useState("");
  const [memberJob, setMemberJob] = useState("");
  const [memberAccountNumber, setMemberAccountNumber] = useState("");
  const [memberAge, setMemberAge] = useState("");

  // 알림 메시지 상태
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  // "인증번호 발송" 버튼 클릭 핸들러
  const handleSendVerificationEmail = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    if (!email) {
      setErrorMessage("이메일을 먼저 입력해주세요.");
      return;
    }
    try {
      await sendVerificationEmail(email);
      setVerificationSent(true);
      setSuccessMessage("인증번호가 발송되었습니다. 이메일을 확인해주세요.");
    } catch (error) {
      console.error(error);
      setErrorMessage("인증번호 발송 중 문제가 발생했습니다.");
    }
  };

  // "인증번호 확인" 버튼 클릭 핸들러 (백엔드에서 검증)
  const handleVerifyCode = async () => {
    setErrorMessage("");
    try {
      // verifyCode 함수는 백엔드의 /api/mail/verify 엔드포인트를 호출하여 인증번호를 검증합니다.
      const res = await verifyCode(email, verificationInput);
      if (res.data === "인증 성공") {
        setIsVerified(true);
        setSuccessMessage("이메일 인증이 완료되었습니다.");
      } else {
        setErrorMessage("인증번호가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("인증번호 검증 중 문제가 발생했습니다.");
    }
  };

  // 회원가입 폼 제출 핸들러 (인증 완료 후)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // 회원가입 데이터 객체 생성 (이메일은 memberId로 사용)
    const memberData = {
      memberId: email,
      member_name: memberName,
      residentRegistrationNumber: residentRegistrationNumber,
      memberpassword: memberPassword,
      member_phoneNumber: memberPhone,
      member_address: memberAddress,
      member_job: memberJob,
      accountNumber: memberAccountNumber || null,
      member_age: memberAge,
      member_creditScore: null,
      // 인증번호는 이미 검증되었으므로 더 이상 전송하지 않아도 됩니다.
    };

    try {
      await createMember(memberData);
      setSuccessMessage("회원가입이 완료되었습니다!");
      // 회원가입 성공 후 계좌 개설 페이지 등으로 이동 (필요시)
      navigate("/make-account", { state: { memberId: email } });
    } catch (error) {
      console.error(error);
      setErrorMessage("회원가입 중 문제가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h2>회원가입</h2>
          {!isVerified ? (
              // 1단계: 이메일 입력 및 인증번호 발송/검증 영역
              <div>
                <div style={styles.formGroup}>
                  <label>이메일</label>
                  <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="이메일을 입력하세요"
                      required
                  />
                </div>
                <button
                    type="button"
                    style={styles.verifyButton}
                    onClick={handleSendVerificationEmail}
                >
                  인증번호 발송
                </button>
                {verificationSent && (
                    <div style={styles.formGroup}>
                      <label>인증번호 입력</label>
                      <input
                          type="text"
                          value={verificationInput}
                          onChange={(e) => setVerificationInput(e.target.value)}
                          placeholder="이메일로 받은 인증번호를 입력하세요"
                          required
                      />
                      <button
                          type="button"
                          style={styles.verifyButton}
                          onClick={handleVerifyCode}
                      >
                        인증번호 확인
                      </button>
                    </div>
                )}
              </div>
          ) : (
              // 2단계: 이메일 인증 완료 후 나머지 회원가입 입력 폼
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label>이메일 (확인됨)</label>
                  <input type="email" value={email} readOnly />
                </div>
                <div style={styles.formGroup}>
                  <label>이름</label>
                  <input
                      type="text"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      placeholder="이름을 입력하세요"
                      required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>나이</label>
                  <input
                      type="number"
                      value={memberAge}
                      onChange={(e) => setMemberAge(e.target.value)}
                      placeholder="나이를 입력하세요"
                      required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>주민등록번호</label>
                  <input
                      type="text"
                      value={residentRegistrationNumber}
                      onChange={(e) => setResidentRegistrationNumber(e.target.value)}
                      placeholder="주민등록번호를 입력하세요"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>비밀번호</label>
                  <input
                      type="password"
                      value={memberPassword}
                      onChange={(e) => setMemberPassword(e.target.value)}
                      placeholder="비밀번호를 입력하세요"
                      required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>핸드폰 번호</label>
                  <input
                      type="text"
                      value={memberPhone}
                      onChange={(e) => setMemberPhone(e.target.value)}
                      placeholder="핸드폰 번호를 입력하세요"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>주소</label>
                  <input
                      type="text"
                      value={memberAddress}
                      onChange={(e) => setMemberAddress(e.target.value)}
                      placeholder="주소를 입력하세요"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>직업</label>
                  <input
                      type="text"
                      value={memberJob}
                      onChange={(e) => setMemberJob(e.target.value)}
                      placeholder="직업을 입력하세요"
                  />
                </div>
                <button type="submit" style={styles.submitButton}>
                  회원가입
                </button>
              </form>
          )}

          {errorMessage && (
              <p style={{ color: "red", marginTop: "1rem" }}>{errorMessage}</p>
          )}
          {successMessage && (
              <p style={{ color: "green", marginTop: "1rem" }}>{successMessage}</p>
          )}
        </div>
      </div>
  );
};

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f5f5f5",
  },
  container: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    width: "400px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "1rem",
  },
  submitButton: {
    padding: "0.75rem",
    fontSize: "1rem",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  verifyButton: {
    padding: "0.5rem",
    fontSize: "0.9rem",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
};

export default MakeMember;
