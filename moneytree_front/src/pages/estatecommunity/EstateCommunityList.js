import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const EstateCommunityList = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0); // 현재 페이지 (0부터 시작)
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수

  // 한 블록에 표시할 페이지 개수
  const blockSize = 10;

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/estate-community?page=${page}&size=10`)
      .then((response) => {
        console.log('전체 응답 데이터:', response.data);
        if (response.data && response.data.content !== undefined) {
          setPosts(response.data.content);
          setTotalPages(response.data.totalPages);
        } else if (Array.isArray(response.data)) {
          setPosts(response.data);
          setTotalPages(1);
        } else {
          console.error('알 수 없는 응답 구조:', response.data);
        }
      })
      .catch((error) => console.error('게시글을 불러오는 중 오류 발생:', error));
  }, [page]);

  // 현재 블록 계산
  const currentBlock = Math.floor(page / blockSize);
  const startPage = currentBlock * blockSize;
  const endPage = Math.min(startPage + blockSize - 1, totalPages - 1);

  const handlePageClick = (pageNum) => {
    setPage(pageNum);
  };

  const handlePrevBlock = () => {
    const newPage = Math.max(startPage - blockSize, 0);
    setPage(newPage);
  };

  const handleNextBlock = () => {
    const newPage = Math.min(startPage + blockSize, totalPages - 1);
    setPage(newPage);
  };

  const goFirst = () => setPage(0);
  const goLast = () => setPage(totalPages - 1);

  return (
    <div style={{ padding: '20px' }}>
      <h2>🏡 부동산 커뮤니티</h2>
      <Link to="/community/real-estate/new">
        <button
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '15px',
          }}
        >
          ✏️ 새 게시글 작성
        </button>
      </Link>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts.length > 0 ? (
          posts.map((post) => (
            <li
              key={post.id}
              style={{
                border: '1px solid #ddd',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '5px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <Link
                to={`/community/real-estate/${post.id}`}
                style={{ textDecoration: 'none', color: '#333' }}
              >
                <h3>{post.title}</h3>
                <p>
                  <strong>작성 시간:</strong>{' '}
                  {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'N/A'}
                </p>
              </Link>
            </li>
          ))
        ) : (
          <p>게시글이 없습니다.</p>
        )}
      </ul>
      {/* 페이지 네비게이션 */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button onClick={goFirst} disabled={page === 0}>
          처음
        </button>
        <button onClick={handlePrevBlock} disabled={startPage === 0}>
          이전 구간
        </button>
        {Array.from({ length: endPage - startPage + 1 }, (_, idx) => {
          const pageNum = startPage + idx;
          return (
            <button
              key={pageNum}
              onClick={() => handlePageClick(pageNum)}
              style={{
                margin: '0 5px',
                padding: '5px 10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                cursor: 'pointer',
                backgroundColor: pageNum === page ? '#007bff' : 'white',
                color: pageNum === page ? 'white' : 'black',
                fontWeight: pageNum === page ? 'bold' : 'normal',
              }}
            >
              {pageNum + 1}
            </button>
          );
        })}
        <button onClick={handleNextBlock} disabled={endPage === totalPages - 1}>
          다음 구간
        </button>
        <button onClick={goLast} disabled={page === totalPages - 1}>
          끝
        </button>
      </div>
    </div>
  );
};

export default EstateCommunityList;
