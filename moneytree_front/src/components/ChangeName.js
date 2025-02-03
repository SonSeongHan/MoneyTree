import React, { useState, useEffect } from "react";
import { changeName } from "../api/MemberAPI"; // 이름 변경 API 호출
import { getMemberIdFromCookie, getCookie, setCookie } from "../util/cookieUtil"; // 쿠키 관련 함수

const ChangeName = () => {
    const [memberId, setMemberId] = useState(""); // 현재 아이디 (쿠키에서 가져옴)
    const [newName, setNewName] = useState(""); // 변경할 이름
    const [password, setPassword] = useState(""); // 비밀번호
    const [message, setMessage] = useState(""); // 결과 메시지

    // ✅ 컴포넌트가 마운트될 때 쿠키에서 memberId 가져오기
    useEffect(() => {
        const storedMemberId = getMemberIdFromCookie(); // 쿠키에서 memberId 가져오기
        if (storedMemberId) {
            setMemberId(storedMemberId); // 상태값 업데이트
        }
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!memberId || !newName || !password) {
            setMessage("모든 필드를 입력해주세요.");
            return;
        }

        try {
            const response = await changeName({
                memberId,        // 쿠키에서 가져온 기존 아이디 (수정 불가능)
                member_name: newName, // 변경할 이름
                memberpassword: password, // 비밀번호
            });

            if (response.status === 200) {
                // ✅ 성공 시 쿠키 값도 업데이트
                const currentMember = getCookie("member"); // 기존 쿠키 값 가져오기
                if (currentMember) {
                    const updatedMember = JSON.stringify({ ...currentMember, member_name: newName });
                    setCookie("member", updatedMember, 7);

                }

                // ✅ 알럿 띄우기
                alert("이름이 성공적으로 변경되었습니다.");

                // ✅ 새로고침하면서 /home 으로 이동
                window.location.href = "/home";
            } else {
                setMessage("이름 변경 실패: 알 수 없는 오류가 발생했습니다.");
            }
        } catch (error) {
            setMessage("이름 변경 실패: 비밀번호가 틀리거나 오류가 발생했습니다.");
        }
    };

    return (
      <div style={{ maxWidth: "400px", margin: "0 auto" }}>
          <h2>이름 변경</h2>
          <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "10px" }}>
                  <label htmlFor="memberId">현재 아이디:</label>
                  <input
                    type="text"
                    id="memberId"
                    value={memberId}
                    disabled // 사용자가 수정하지 못하도록 설정
                  />
              </div>
              <div style={{ marginBottom: "10px" }}>
                  <label htmlFor="newName">새 이름:</label>
                  <input
                    type="text"
                    id="newName"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
              </div>
              <div style={{ marginBottom: "10px" }}>
                  <label htmlFor="password">비밀번호:</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
              </div>
              <button type="submit">이름 변경</button>
          </form>
          {message && <div style={{ marginTop: "20px", color: "red" }}>{message}</div>}
      </div>
    );
};

export default ChangeName;
