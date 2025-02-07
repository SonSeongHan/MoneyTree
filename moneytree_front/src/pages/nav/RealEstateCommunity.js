import React, { useState, useEffect } from "react";
import { fetchFile, fetchRealEstateCommunity } from '../../api/CommunityApi';
import { useNavigate } from "react-router-dom";
import jwtAxios from '../../util/jwtUtil';

const RealEstateCommunity = () => {
  const [communities, setCommunities] = useState([]); // 커뮤니티 글 리스트
  const [page, setPage] = useState(0); // 현재 페이지
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false); // 로딩 상태
  const navigate = useNavigate();


  // 취미 커뮤니티 글 가져오기
  useEffect(() => {
    const loadRealEstateCommunity = async () => {
      setLoading(true);

      try {
        console.log('Authorization 헤더:', jwtAxios.defaults.headers)

        const data = await fetchRealEstateCommunity(page, 10); // 한 페이지에 10개

        const communitiesWithThumbnails = await Promise.all(
          data.content.map(async (community) => {
            if (community.imageUrls && community.imageUrls.length > 0) {
              try {
                const thumbnailUrl = await fetchFile(`s_${community.imageUrls[0]}`);
                return { ...community, thumbnailUrl };
              } catch (fileError) {
                console.error("썸네일을 가져오는 중에 오류 발생:", fileError);
                return community;
              }
            }
            return community;
          })
        );

        setCommunities(communitiesWithThumbnails);
        setTotalPages(data.totalPages);
      }catch(error){
      console.error("취미 관련 커뮤니티 그을 불러올 수 없습니다:",error);
      alert("데이터를 불러오는 중 오류가 발생했습니다.");
      }finally{
      setLoading(false);
      }
    };

    loadRealEstateCommunity();
    },[page]);

  // 페이지 변경
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      navigate(`?page=${newPage}`);
    }
  };

  return (
    <div>
      <h1>부동산 커뮤니티</h1>

      {/* 작성하기 버튼 */}
      <button onClick={() => navigate("/community/real_estate/add")}>작성하기</button>

      {/* 커뮤니티 글 리스트 */}
      <div>
        <h2>부동산 커뮤니티</h2>
        {loading ? (
          <p>로딩 중...</p>
        ) : communities.length > 0 ? (
          <ul>
            {communities.map((community) => (
              <li
                key={community.postId}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/community/check/${community.postId}`)} // 클릭 시 상세 보기로 이동
              >
                <h3>{community.memberId}: {community.title}</h3>
                <p>{community.content}</p>
                {community.imageUrls && community.imageUrls.length > 0 && (
                  <img
                    src={community.thumbnailUrl}
                    alt={community.title}
                    style={{
                      maxWidth: "100px",
                      maxHeight: "100px",
                      objectFit: "cover", // 썸네일 스타일
                      borderRadius: "5px",
                    }}
                  />
                )}
              </li>
            ))}
          </ul>
        ):(
          <p>현재 해당 커뮤니티에 게시글이 없습니다.</p>
        )}
      </div>

      {/* 페이지 네비게이션 */}
      <div>
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 0}>
          이전
        </button>
        <span>
          {page + 1} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page + 1 >= totalPages}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default RealEstateCommunity;
