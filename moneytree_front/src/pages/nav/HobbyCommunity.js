import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchFile, fetchHobbyCommunity } from '../../api/CommunityApi';
import jwtAxios from '../../util/jwtUtil';
import '../../css/hobby/HobbyCommunity.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const HobbyCommunityList = () => {
  // 쿼리 파라미터
  const query = useQuery();
  const initialPage = parseInt(query.get('page') || '0', 10);
  const initialCategory = query.get('category') || '전체보기';

  // 만약 서버에서 검색 지원 안한다면, searchField와 searchKeyword는
  // 단순 클라이언트 필터링용 상태로만 사용
  const initialSearchField = 'titleContent';
  const initialSearchKeyword = '';

  const initialCommentFilter = query.get('commentFilter') || '';

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);

  const [filterCategory, setFilterCategory] = useState(initialCategory);
  const [searchField, setSearchField] = useState(initialSearchField);
  const [searchKeyword, setSearchKeyword] = useState(initialSearchKeyword);
  const [commentFilter, setCommentFilter] = useState(initialCommentFilter);

  const navigate = useNavigate();

  // 쿼리 파라미터 업데이트
  const updateQueryParams = () => {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('category', filterCategory);
    // 프론트에서만 필터링할거라면 이 둘은 굳이 파라미터로 넘기지 않아도 됨
    params.set('commentFilter', commentFilter);

    window.history.replaceState(null, '', `?${params.toString()}`);
  };

  // 전체 글 또는 전체+카테고리 글만 받아오는 함수 (검색 제외)
  const fetchPostsFromServer = async () => {
    setLoading(true);
    try {
      const data = await fetchHobbyCommunity(page, 10, filterCategory);
      // 썸네일 로딩
      const postsWithThumbnails = await Promise.all(
          data.content.map(async (post) => {
            if (post.imageUrls && post.imageUrls.length > 0) {
              try {
                const thumbnailUrl = await fetchFile(`s_${post.imageUrls[0]}`);
                return { ...post, thumbnailUrl };
              } catch (fileError) {
                console.error('썸네일 로딩 오류:', fileError);
                return post;
              }
            }
            return post;
          })
      );

      return {
        posts: postsWithThumbnails,
        totalPages: data.totalPages,
        totalResults: data.totalElements,
      };
    } catch (error) {
      console.error('게시글 로딩 오류:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
      return {
        posts: [],
        totalPages: 0,
        totalResults: 0,
      };
    } finally {
      setLoading(false);
    }
  };

  // 검색어를 기반으로 프론트에서 필터링
  const filterPosts = (allPosts) => {
    if (!searchKeyword.trim()) return allPosts;

    // 필터링 기준
    // searchField가 'title', 'content', 'titleContent', 'author' 등에 따라 조건 분기
    return allPosts.filter((post) => {
      const { title, content, author } = post;
      const keyword = searchKeyword.toLowerCase();

      switch (searchField) {
        case 'title':
          return title?.toLowerCase().includes(keyword);
        case 'content':
          return content?.toLowerCase().includes(keyword);
        case 'author':
          return author?.toLowerCase().includes(keyword);
        case 'titleContent':
        default:
          return (
              title?.toLowerCase().includes(keyword) ||
              content?.toLowerCase().includes(keyword)
          );
      }
    });
  };

  // 댓글 필터(front-end 예시) - 간단히 정렬만 하는 예시
  const sortByComments = (postsData) => {
    if (commentFilter === 'few') {
      // 댓글 적은 순
      return [...postsData].sort(
          (a, b) => (a.comments?.length || 0) - (b.comments?.length || 0)
      );
    }
    if (commentFilter === 'many') {
      // 댓글 많은 순
      return [...postsData].sort(
          (a, b) => (b.comments?.length || 0) - (a.comments?.length || 0)
      );
    }
    return postsData;
  };

  // 게시글 불러오기
  const fetchPosts = async () => {
    const { posts: allPosts, totalPages, totalResults } = await fetchPostsFromServer();

    // 1) 검색어 필터
    const searchedPosts = filterPosts(allPosts);

    // 2) 댓글 필터(정렬)
    const finalPosts = sortByComments(searchedPosts);

    setPosts(finalPosts);
    setTotalPages(totalPages);
    // 주의: 검색 후 실제 totalPages, totalResults가 달라질 수 있으므로
    // 프론트 필터링일 경우 페이지네이션 로직을 직접 재구성해야 함
    setTotalResults(finalPosts.length);

    updateQueryParams();
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, [page, filterCategory, searchField, searchKeyword, commentFilter]);

  // 페이지네이션 계산
  // (주의) 프론트에서 필터링 시, 전체 게시글 개수가 달라지면 페이지네이션 로직도 직접 수정해야 함
  const blockSize = 10;
  const currentBlock = Math.floor(page / blockSize);
  const startPage = currentBlock * blockSize;
  const endPage = Math.min(startPage + blockSize - 1, totalPages - 1);

  // 페이지 이동
  const handlePageClick = (pageNum) => setPage(pageNum);
  const handlePrevBlock = () => setPage(Math.max(currentBlock * blockSize - blockSize, 0));
  const handleNextBlock = () => setPage(Math.min((currentBlock + 1) * blockSize, totalPages - 1));
  const goFirst = () => setPage(0);
  const goLast = () => setPage(totalPages - 1);

  // 카테고리 필터
  const categoryOptions = [
    { label: '전체보기', value: '전체보기' },
    { label: '공예', value: '공예' },
    { label: '캘리그라피', value: '캘리그라피' },
    { label: '운동', value: '운동' },
    { label: '기타', value: '기타' },
  ];

  const handleCategoryFilter = (value) => {
    setFilterCategory(value);
    setPage(0);
  };

  // 댓글 정렬 필터
  const handleCommentFilter = (filter) => {
    setCommentFilter(filter);
    setPage(0);
  };

  // 검색
  const handleSearch = () => {
    setPage(0);
    fetchPosts(); // 프론트 필터링도 실행
  };

  // 새 글 작성 버튼
  const handleWrite = () => {
    navigate('/community/hobby/add');
  };

  const searchFieldOptions = [
    { value: 'title', label: '제목' },
    { value: 'content', label: '내용' },
    { value: 'titleContent', label: '제목+내용' },
    { value: 'author', label: '작성자' },
  ];

  return (
      <div className="hobby-list-container">
        <div className="hobby-banner">
          <h2>🎨 취미 커뮤니티</h2>
          <p>함께 즐기고 공유하는 공간</p>
        </div>

        <div className="hobby-content">
          <h2 className="hobby-comment-header">취미 커뮤니티</h2>

          {/* 카테고리 필터 */}
          <div className="hobby-category-filter">
            {categoryOptions.map((cat) => (
                <button
                    key={cat.value}
                    className={filterCategory === cat.value ? 'active' : ''}
                    onClick={() => handleCategoryFilter(cat.value)}
                >
                  {cat.label}
                </button>
            ))}
          </div>

          {/* 댓글 정렬 필터 */}
          <div className="hobby-comment-filter">
            <button
                className={commentFilter === '' ? 'active' : ''}
                onClick={() => handleCommentFilter('')}
            >
              전체
            </button>
            <button
                className={commentFilter === 'few' ? 'active' : ''}
                onClick={() => handleCommentFilter('few')}
            >
              댓글 적은 순
            </button>
            <button
                className={commentFilter === 'many' ? 'active' : ''}
                onClick={() => handleCommentFilter('many')}
            >
              댓글 많은 순
            </button>
          </div>

          {/* 검색 영역 */}
          <div className="hobby-search-area">
            <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="hobby-search-field"
            >
              {searchFieldOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
              ))}
            </select>
            <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="검색어 입력"
                className="hobby-search-input"
            />
            <button onClick={handleSearch} className="hobby-search-button">
              검색
            </button>
          </div>

          <div className="hobby-result-count">검색 결과: {totalResults}건</div>

          <div className="hobby-new-post-button-container">
            <button className="hobby-new-post-button" onClick={handleWrite}>
              ✏️ 새 게시글 작성
            </button>
          </div>

          {/* 게시글 목록 */}
          {loading ? (
              <p>로딩 중...</p>
          ) : (
              <ul className="hobby-list-community">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <li key={post.postId} className="hobby-list-item">
                          <Link to={`/community/check/${post.postId}`} className="hobby-list-link">
                            <div className="hobby-list-item-header">
                              <div className="hobby-list-item-category-title">
                                <span className="hobby-post-category">{post.category}</span>
                                <h3 className="hobby-post-title">{post.title}</h3>
                              </div>
                              <div className="hobby-list-item-meta">
                                <p className="hobby-meta-line">
                                  <strong>작성자:</strong> {post.author}
                                </p>
                                <p className="hobby-meta-line">
                                  <strong>작성 시간:</strong>{' '}
                                  {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'N/A'}
                                </p>
                                {post.updatedAt && post.updatedAt !== post.createdAt && (
                                    <p className="hobby-meta-line">
                                      <strong>수정 시간:</strong>{' '}
                                      {new Date(post.updatedAt).toLocaleString()}
                                    </p>
                                )}
                                <p className="hobby-meta-line">
                                  <strong>댓글 수:</strong> {post.comments ? post.comments.length : 0}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </li>
                    ))
                ) : (
                    <p>게시글이 없습니다.</p>
                )}
              </ul>
          )}

          {/* 페이지네이션 */}
          <div className="hobby-pagination">
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
                      className={`page-button ${pageNum === page ? 'active' : ''}`}
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
      </div>
  );
};

export default HobbyCommunityList;
