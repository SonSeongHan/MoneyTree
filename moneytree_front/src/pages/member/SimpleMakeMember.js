import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMember } from "../../api/MemberAPI"; // MemberAPI.js에서 함수 임포트

const SimpleMakeMember = () => {
  const [memberId, setMemberId] = useState(""); // 아이디 상태 추가
  const [memberName, setMemberName] = useState("");
  const [residentRegistrationNumber, setResidentRegistrationNumber] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberAddress, setMemberAddress] = useState("");
  const [memberJob, setMemberJob] = useState("");
  const [memberAccountNumber, setMemberAccountNumber] = useState("");
  const [memberAge, setMemberAge] = useState(""); // 나이 상태 추가

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const memberData = {
        memberId: memberId, // 필드명 일치시킴
        member_name: memberName,
        residentRegistrationNumber: residentRegistrationNumber,
        memberpassword: memberPassword,
        member_phoneNumber: memberPhone,
        member_address: memberAddress,
        member_job: memberJob,
        accountNumber: memberAccountNumber || null,
        member_age: memberAge,
        member_creditScore: null,
      };

      // API 호출
      await createMember(memberData);

      setSuccessMessage("회원가입이 완료되었습니다!");
      alert("회원가입이 완료되었습니다!"); // 얼럿 추가
      navigate("/"); // 회원가입 성공 시 리다이렉트
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h2>심플 회원가입</h2>
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
          {errorMessage && <p style={{ color: 'red', marginTop: '1rem' }}>{errorMessage}</p>}
          {successMessage && <p style={{ color: 'green', marginTop: '1rem' }}>{successMessage}</p>}
        </div>
      </div>
  );
};

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

export default SimpleMakeMember;
