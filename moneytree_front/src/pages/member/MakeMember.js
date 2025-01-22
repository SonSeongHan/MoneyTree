// src/pages/MakeMember.js
import React, { useState } from "react";
import { createMember } from "../../api/MemberAPI"; // 실제 API 호출 함수 (예시)
import { useNavigate } from "react-router-dom";

const MakeMember = () => {
  // 폼 입력값 상태
  const [memberId, setMemberId] = useState(""); // 아이디 상태
  const [memberName, setMemberName] = useState("");
  const [residentRegistrationNumber, setResidentRegistrationNumber] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberAddress, setMemberAddress] = useState("");
  const [memberJob, setMemberJob] = useState("");
  const [memberAccountNumber, setMemberAccountNumber] = useState("");
  const [memberAge, setMemberAge] = useState(""); // 나이 상태

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // 회원가입에 필요한 데이터 객체
      const memberData = {
        member_id: memberId,
        member_name: memberName,
        residentRegistrationNumber: residentRegistrationNumber,
        member_password: memberPassword,
        member_phoneNumber: memberPhone,
        member_address: memberAddress,
        member_job: memberJob,
        member_accountNumber: memberAccountNumber || null,
        member_age: memberAge,
        member_creditScore: null,
      };

      // 실제 API 호출 (예시)
      await createMember(memberData);

      setSuccessMessage("회원가입이 완료되었습니다!");
      // 회원가입 성공 시 계좌 개설 페이지로 이동하며, 입력한 memberId도 함께 전달
      navigate("/make-account", {
        state: {
          memberId: memberId
        }
      });
    } catch (error) {
      setErrorMessage("회원가입 중 문제가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit} style={styles.form}>

          <div style={styles.formGroup}>
            <label>아이디</label>
            <input
              type="text"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="아이디를 입력하세요"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label>이름</label>
            <input
              type="text"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
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
              placeholder="7자리 또는 13자리"
            />
          </div>

          <div style={styles.formGroup}>
            <label>비밀번호</label>
            <input
              type="password"
              value={memberPassword}
              onChange={(e) => setMemberPassword(e.target.value)}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label>핸드폰 번호</label>
            <input
              type="text"
              value={memberPhone}
              onChange={(e) => setMemberPhone(e.target.value)}
            />
          </div>

          <div style={styles.formGroup}>
            <label>주소</label>
            <input
              type="text"
              value={memberAddress}
              onChange={(e) => setMemberAddress(e.target.value)}
            />
          </div>

          <div style={styles.formGroup}>
            <label>직업</label>
            <input
              type="text"
              value={memberJob}
              onChange={(e) => setMemberJob(e.target.value)}
            />
          </div>

          {/* 가입 버튼 */}
          <button type="submit" style={styles.submitButton}>
            계좌 개설하러 가기
          </button>
        </form>

        {errorMessage && <p style={{ color: 'red', marginTop: '1rem' }}>{errorMessage}</p>}
        {successMessage && <p style={{ color: 'green', marginTop: '1rem' }}>{successMessage}</p>}
      </div>
    </div>
  );
};

// 간단한 스타일 정의
const styles = {
  page: {
    display: 'flex',
    justifyContent: 'center',
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
};

export default MakeMember;
