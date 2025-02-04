import React, { useState, useEffect } from "react";
import { fetchGetCommunityById, fetchUpdateCommunity, fetchFile } from "../../api/CommunityApi";
import { useParams, useNavigate } from "react-router-dom";
import { getCookie } from '../../util/cookieUtil';

const CommuUpdate = () => {
  const { postId } = useParams();
  const [postData,setPostData] = useState(null);
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  const loggedInUser = getCookie("member");
  const loggedInUserId = loggedInUser?.memberId;

  if (!loggedInUserId) {
    console.error("유효한 로그인 유저 정보를 찾을 수 없습니다.");
    throw new Error("멤버 정보가 없습니다.");
  }

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await fetchGetCommunityById(postId);
        setPostData(data);
        } catch (error) {
        console.error("글을 불러오는 데 실패했습니다:", error);
        alert("글을 불러오는 데 실패했습니다.");
      }
    };

    fetchPost();
  }, [postId]);

  // 파일 선택 핸들러
  const handleFileChange = (event) => {
    setFiles([...event.target.files]);
  };

  // 수정 제출 핸들러
  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("communityDTO",JSON.stringify(postData));

    files.forEach((file)=> formData.append("files",file))

    try{
      await fetchUpdateCommunity(postId, formData);
      alert("글이 성공적으로 수정되었습니다.");
      navigate(`/community/check/${postData.postType.toLowerCase()}`); // 상세 보기 페이지로 이동
    } catch (error) {
      console.error("글 수정 중 오류 발생:", error);
      alert("글 수정 중 오류가 발생했습니다.");
    }
  };

  if (!postData) {
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
            value={postData.title}
            onChange={(e) => setPostData({...postData,title: e.target.value})}
            required
          />
        </div>
        <div>
          <label>내용:</label>
          <textarea
            value={postData.content}
            onChange={(e) => setPostData({...postData,content: e.target.value})}
            required
          />
        </div>
        <div>
          <label>기존 이미지:</label>
          <div>
            {postData.imageUrls && postData.imageUrls.length > 0 ? (
              postData.imageUrls.map((url, index) => <img key={index} src={fetchFile(url)} alt="게시글 이미지" width="100" />)
            ) : (
              <p>이미지가 없습니다.</p>
            )}
          </div>
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
