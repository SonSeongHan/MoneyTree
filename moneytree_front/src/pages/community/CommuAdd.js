import React, { useState } from "react";
import { fetchSaveCommunity } from "../../api/CommunityApi";
import { useNavigate, useParams } from "react-router-dom";
import { getCookie } from "../../util/cookieUtil";

const CommuAdd = () => {
  const { type } = useParams();
  const [postType, setPostType] = useState(type || "HOBBY");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null); // 이미지 파일 상태
  const navigate = useNavigate();

  // 쿠키에서 accessToken 가져오기
  const loggedInUser = getCookie("member");
  // let accessToken = null;
  let loggedInUserId = loggedInUser.memberId;

  if (!loggedInUserId) {
    console.error("유효한 로그인 유저 정보를 찾을 수 없습니다.");
    throw new Error("멤버 정보가 없습니다.");
  }

  const handleFileChange = (event) => {
    setFile(Array.from(event.target.files)); // 선택된 파일 설정
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // FormData를 사용하여 텍스트와 파일 데이터 전송
    const formData = new FormData();
    formData.append(
      "communityDTO",
      JSON.stringify({
        title,
        content,
        postType,
        memberId: loggedInUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
    if (file.length > 0) {
      file.forEach((fileItem) => {
      formData.append("files", fileItem);
      });
    }

    try {
      const response = await fetchSaveCommunity(formData);
      alert("게시글이 성공적으로 등록되었습니다.");
      navigate(`/community/${postType.toLowerCase()}`);
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
          <label>카테고리:</label>
          <select value={postType} onChange={(e) => setPostType(e.target.value)}>
            <option value="hobby">취미 커뮤니티</option>
            <option value="real-estate">부동산 커뮤니티</option>
          </select>
        </div>
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
          <input type="file" accept="image/*" multiple onChange={handleFileChange} />
        </div>
        <button type="submit">등록하기</button>
      </form>
    </div>
  );
};

export default CommuAdd;
