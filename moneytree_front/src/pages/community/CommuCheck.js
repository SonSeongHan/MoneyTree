import React, { useEffect, useState } from "react";
import { fetchGetCommunityById } from "../../api/CommunityApi";
import { useParams, useNavigate } from "react-router-dom";

const CommuCheck = () => {
  const { id } = useParams(); // URL에서 ID를 가져옴
  const [community, setCommunity] = useState(null); // 선택된 커뮤니티 데이터
  const navigate = useNavigate();

  // 커뮤니티 글 가져오기
  useEffect(() => {
    const loadCommunity = async () => {
      try {
        const data = await fetchGetCommunityById(id); // 특정 ID의 글 조회
        setCommunity(data);
      } catch (error) {
        console.error("글을 불러오는 데 실패했습니다:", error);
        alert("글을 불러오는 데 실패했습니다.");
      }
    };

    loadCommunity();
  }, [id]); // id가 변경될 때마다 실행

  if (!community) {
    return <p>로딩 중...</p>;
  }

  return (
    <div>
      <h1>글 상세 보기</h1>
      <h3>{community.title}</h3>
      <p>{community.content}</p>
      {community.imageUrl && (
        <img
          src={community.imageUrl}
          alt={community.title}
          style={{ maxWidth: "100%" }}
        />
      )}
      <button onClick={() => navigate(-1)}>뒤로 가기</button>
    </div>
  );
};

export default CommuCheck;
