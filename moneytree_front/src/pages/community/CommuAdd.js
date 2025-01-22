import React, { useState } from "react";
import { fetchSaveCommunity } from "../../api/CommunityApi";
import { useNavigate } from "react-router-dom";

const CommuAdd = () => {
  const [form, setForm] = useState({ title: "", content: "", imageUrl: "" }); // 글 생성 폼
  const navigate = useNavigate();

  // 폼 데이터 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // API 호출: 글 생성
  const handleCreate = async () => {
    if (!form.title || !form.content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      await fetchSaveCommunity({ ...form, postType: "HOBBY" }); // postType을 HOBBY로 설정
      alert("글이 성공적으로 생성되었습니다.");
      setForm({ title: "", content: "", imageUrl: "" }); // 폼 초기화
      navigate("/hobby"); // 글 생성 후 HobbyCommunity로 이동
    } catch (error) {
      console.error("글 생성에 실패했습니다:", error);
      alert("글 생성에 실패했습니다.");
    }
  };

  return (
    <div>
      <h2>새 글 작성</h2>
      <input
        type="text"
        name="title"
        placeholder="제목"
        value={form.title}
        onChange={handleChange}
      />
      <textarea
        name="content"
        placeholder="내용"
        value={form.content}
        onChange={handleChange}
      ></textarea>
      <input
        type="text"
        name="imageUrl"
        placeholder="이미지 URL (선택)"
        value={form.imageUrl}
        onChange={handleChange}
      />
      <button onClick={handleCreate}>작성</button>
      <button onClick={() => navigate("/hobby")}>취소</button> {/* 취소 버튼 */}
    </div>
  );
};

export default CommuAdd;
