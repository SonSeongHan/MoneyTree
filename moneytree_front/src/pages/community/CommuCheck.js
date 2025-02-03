import React, { useEffect, useState } from "react";
import { fetchGetCommunityById, fetchFile, fetchDeleteCommunity } from '../../api/CommunityApi';
import CommuReply from './CommuReply';
import { useParams, useNavigate } from "react-router-dom";
import {getCookie} from '../../util/cookieUtil';

const CommuCheck = () => {
  const { postId } = useParams(); // URL에서 ID를 가져옴
  const [community, setCommunity] = useState(null); // 선택된 커뮤니티 데이터
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  const loggedInUser = getCookie("member");
  const loggedInUserId = loggedInUser?.memberId;
  const userRole = loggedInUser?.membershipType;

  // 커뮤니티 글 가져오기
  useEffect(() => {
    const loadCommunity = async () => {
      try {
        const data = await fetchGetCommunityById(postId); // 특정 ID의 글 조회
        setCommunity(data);
        if(data.imageUrl){
          const orginalImageUrl = await fetchFile(data.imageUrl.replace("s_",""));
          setImageUrl(orginalImageUrl);
        }
      } catch (error) {
        console.error("글을 불러오는 데 실패했습니다:", error);
        alert("글을 불러오는 데 실패했습니다.");
      }
    };

    loadCommunity();
  }, [postId]); // id가 변경될 때마다 실행

  const handleDelete = async () => {
    const confirmDelete = window.confirm("정말로 해당 글을 삭제하시겠습니까?");
    if(!confirmDelete) return;

    try {
      const data = await fetchDeleteCommunity(postId);

      if(data.memberId !==loggedInUserId){
        alert("권한이 없습니다.");
        navigate(-1);
        return;
      }


      alert("게시글이 삭제되었습니다.");
      navigate(-1);
    }catch (error){
      if(error.response && error.response.status === 403){
        alert("권한이 없습니다.");
      }else{
      console.error("게시글이 삭제중 오류 발생:",error);
      alert("게시글 삭제에 실패했습니다.");
    }
    }
  };

  if (!community) {
    return <p>로딩 중...</p>;
  }

  return (
    <div>
      <h4>작성자: {loggedInUserId}({userRole})</h4>
      <h3>제목: {community.title}</h3>
      <p>내용: {community.content}</p>
      {imageUrl && <img src={imageUrl} alt={community.title}/>}
      <div>
      <button onClick={() => navigate(-1)}>목록</button>
        {loggedInUserId.memberId === community.memberId && (
      <button onClick={()=>navigate(`/community/update/${postId}`)}>수정</button>
        )}
        {loggedInUserId.memberId === community.memberId && (
      <button onClick={handleDelete}>
        삭제
      </button>
        )}
      </div>

      <CommuReply post={postId}/>
    </div>
  );
};

export default CommuCheck;
