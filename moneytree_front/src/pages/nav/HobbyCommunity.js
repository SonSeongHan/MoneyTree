import React, { useState, useEffect } from "react";
import { fetchHobbyCommunity } from "../../api/CommunityApi";
import { useNavigate } from "react-router-dom";

const HobbyCommunity = () => {
  const [communities, setCommunities] = useState([]); // 커뮤니티 글 리스트
  const [page, setPage] = useState(0); // 현재 페이지
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false); // 로딩 상태
  const navigate = useNavigate();

  // 취미 커뮤니티 글 가져오기
  useEffect(() => {
    const loadHobbyCommunity = async () => {
      setLoading(true);
      try {
        const data = await fetchHobbyCommunity(page, 10); // 한 페이지에 10개
        setCommunities(data.content); // 글 리스트
        setTotalPages(data.totalPages); // 총 페이지 수
      } catch (error) {
        console.error("취미 관련 커뮤니티 글을 불러올 수 없습니다:", error);
        alert("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadHobbyCommunity();
  }, [page]); // page가 변경될 때마다 실행

  // 페이지 변경
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      navigate(`?page=${newPage}`);
    }
  };

  return (
    <div>
      <h1>취미 커뮤니티</h1>

      {/* 작성하기 버튼 */}
      <button onClick={() => navigate("/community/hobby/add")}>작성하기</button>

      {/* 커뮤니티 글 리스트 */}
      <div>
        <h2>커뮤니티 글</h2>
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
                <h3>{community.title}</h3>
                <p>{community.content}</p>
                {community.imageUrl && (
                  <img
                    src={community.imageUrl}
                    alt={community.title}
                    style={{ maxWidth: "100%" }}
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

export default HobbyCommunity;
