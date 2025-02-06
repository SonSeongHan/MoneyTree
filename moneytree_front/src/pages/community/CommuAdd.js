import React, { useState } from "react";
import { fetchSaveCommunity } from "../../api/CommunityApi";
import { useNavigate, useParams } from "react-router-dom";
import { getCookie } from "../../util/cookieUtil";

const CommuAdd = () => {
  const { type } = useParams();
  const [postType, setPostType] = useState(type || "HOBBY");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]); // 이미지 파일 상태
  const navigate = useNavigate();

  // 쿠키에서 accessToken 가져오기
  const loggedInUser = getCookie("member");
  let loggedInUserId = loggedInUser.memberId;

  if (!loggedInUserId) {
    console.error("유효한 로그인 유저 정보를 찾을 수 없습니다.");
    throw new Error("멤버 정보가 없습니다.");
  }

  const handleFileChange = (event) => {
    setFiles([...event.target.files]); // 선택된 파일 설정
  };

  const handleSubmit = async (event) => {
    event.preventDefault();


    const communityData = {
      title,
      content,
      postType,
      memberId: loggedInUserId,  // ✅ memberId가 null인지 확인 필요
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("보내는 데이터:",communityData);

    try {
      const response = await fetchSaveCommunity(communityData,files);
      console.log("응답 데이터:", response);
      alert("게시글이 성공적으로 등록되었습니다.");
      navigate(`/community/${postType.toLowerCase()}`);
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
