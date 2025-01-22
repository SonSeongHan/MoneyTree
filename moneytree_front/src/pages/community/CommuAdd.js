import React, { useState } from "react";
import { fetchSaveCommunity } from "../../api/CommunityApi";

const CommuAdd = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null); // 이미지 파일 상태

  const handleFileChange = (event) => {
    setFile(event.target.files[0]); // 선택된 파일 설정
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // FormData를 사용하여 텍스트와 파일 데이터 전송
    const formData = new FormData();
    formData.append(
      "communityDTO",
      JSON.stringify({title,content})
    );
    if (file) {
      formData.append("file", file);
    }

    try {
      const response = await fetchSaveCommunity(formData);
      alert("게시글이 성공적으로 등록되었습니다.");
      console.log("응답 데이터:", response);
    } catch (error) {
      console.error("게시글 등록 실패:", error);
      alert("게시글 등록 중 문제가 발생했습니다.");
    }
  };

  return (
    <div>
      <h1>커뮤니티 글 작성</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>제목:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>내용:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div>
          <label>이미지 업로드:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <button type="submit">등록하기</button>
      </form>
    </div>
  );
};

export default CommuAdd;
