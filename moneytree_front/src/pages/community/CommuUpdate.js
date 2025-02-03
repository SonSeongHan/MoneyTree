import React, { useState, useEffect } from "react";
import { fetchGetCommunityById, fetchUpdateCommunity, fetchFile } from "../../api/CommunityApi";
import { useParams, useNavigate } from "react-router-dom";
import { getCookie } from '../../util/cookieUtil';

const CommuUpdate = () => {
  const { postId } = useParams();
  const [community, setCommunity] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [currentImage, setCurrentImage] = useState(null); // 기존 이미지 URL
  const [newImage, setNewImage] = useState(null); // 새로 첨부한 이미지
  const navigate = useNavigate();

  const loggedInUser = getCookie("member");
  const loggedInUserId = loggedInUser?.memberId;

  // 초기 데이터 로드
  useEffect(() => {
    const loadCommunity = async () => {
      try {
        const data = await fetchGetCommunityById(postId);
        setCommunity(data);
        setTitle(data.title);
        setContent(data.content);

        if (data.imageUrl) {
          const imageUrl = await fetchFile(data.imageUrl);
          setCurrentImage(imageUrl);
        }

        if(data.memberId !== loggedInUserId){
          alert("권한이 없습니다.");
          navigate(-1);
        }
      } catch (error) {
        console.error("글을 불러오는 데 실패했습니다:", error);
        alert("글을 불러오는 데 실패했습니다.");
      }
    };

    loadCommunity();
  }, [postId,loggedInUserId,navigate]);

  // 파일 선택 핸들러
  const handleFileChange = (event) => {
    setNewImage(event.target.files[0]);
  };

  // 수정 제출 핸들러
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append(
        "communityDTO",
        JSON.stringify({
          postId,
          title,
          content,
          imageUrl: community.imageUrl, // 기존 이미지 유지
        })
      );

      if (newImage) {
        formData.append("files", newImage); // 새로운 이미지 첨부
      }

      await fetchUpdateCommunity(postId, formData);

      alert("글이 성공적으로 수정되었습니다.");
      navigate(`/community/check/${postId}`); // 상세 보기 페이지로 이동
    } catch (error) {
      console.error("글 수정 중 오류 발생:", error);
      alert("글 수정 중 오류가 발생했습니다.");
    }
  };

  if (!community) {
    return <p>로딩 중...</p>;
  }

  return (
    <div>
      <h1>글 수정</h1>
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
          <label>기존 이미지:</label>
          {currentImage ? (
            <img
              src={currentImage}
              alt="기존 이미지"
              style={{
                maxWidth: "100px",
                maxHeight: "100px",
                objectFit: "cover",
                borderRadius: "5px",
              }}
            />
          ) : (
            <p>이미지가 없습니다.</p>
          )}
        </div>
        <div>
          <label>새로운 이미지:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <button type="submit">수정</button>
      </form>
      <button onClick={() => navigate(-1)}>뒤로 가기</button>
    </div>
  );
};

export default CommuUpdate;
