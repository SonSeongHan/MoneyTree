import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchFile, fetchHobbyCommunity } from '../../api/CommunityApi';
import '../../css/hobby/HobbyCommunity.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const HobbyCommunityList = () => {
  const query = useQuery();
  const initialPage = parseInt(query.get('page') || '0', 10);
  const initialCategory = query.get('category') || '전체보기';

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
    params.set('commentFilter', commentFilter);

    window.history.replaceState(null, '', `?${params.toString()}`);
  };
  const fetchPostsFromServer = async () => {
    setLoading(true);
    try {
      // 전체보기일 때도 commentFilter를 포함하여 요청
      const data = await fetchHobbyCommunity(0, 999, filterCategory, commentFilter); // 999는 전체 게시글 수
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
        }),
      );

      // 댓글 수 기준으로 필터링
      const finalPosts = sortByComments(postsWithThumbnails);

      // 페이지네이션을 위한 전체 결과 수
      setPosts(finalPosts);
      setTotalPages(Math.ceil(finalPosts.length / 10)); // 10개씩 나누어서 페이지 수 계산
      setTotalResults(finalPosts.length); // 전체 게시글 수

      updateQueryParams(); // 쿼리 파라미터 갱신

      return {
        posts: finalPosts,
        totalPages: Math.ceil(finalPosts.length / 10),
        totalResults: finalPosts.length,
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

  // 검색어로 프론트에서 필터링
  const filterPosts = (allPosts) => {
    if (!searchKeyword.trim()) return allPosts;

    return allPosts.filter((post) => {
      const { title, content, memberId } = post; // 여기서 `memberId`를 가져옵니다.
      const keyword = searchKeyword.toLowerCase();

      switch (searchField) {
        case 'title':
          return title?.toLowerCase().includes(keyword);
        case 'content':
          return content?.toLowerCase().includes(keyword);
        case 'author':
          return memberId?.toLowerCase().includes(keyword); // 작성자 아이디로 검색
        case 'titleContent':
        default:
          return title?.toLowerCase().includes(keyword) || content?.toLowerCase().includes(keyword);
      }
    });
  };

  // 댓글 필터(정렬)
  const sortByComments = (postsData) => {
    if (commentFilter === 'few') {
      return [...postsData].sort((a, b) => (a.commentCount || 0) - (b.commentCount || 0));
    }
    if (commentFilter === 'many') {
      return [...postsData].sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
    }
    return postsData;
  };

  const fetchPosts = async () => {
    // 1. 서버에서 게시글 불러오기
    const { posts: allPosts } = await fetchPostsFromServer();

    // 2. 검색어 필터링 (제목, 내용, 작성자)
    const searchedPosts = filterPosts(allPosts);

    // 3. 댓글 필터링 (댓글 수 기준으로 정렬)
    const sortedPosts = sortByComments(searchedPosts);

    // 4. 페이지네이션 계산: 10개씩 잘라서 표시
    const startIndex = page * 10;
    const endIndex = Math.min(startIndex + 10, sortedPosts.length);
    const pagedPosts = sortedPosts.slice(startIndex, endIndex);

    // 5. 페이지네이션 관련 정보 업데이트
    setPosts(pagedPosts); // 현재 페이지에 해당하는 게시글만 표시
    setTotalPages(Math.ceil(sortedPosts.length / 10)); // 전체 페이지 수
    setTotalResults(sortedPosts.length); // 전체 게시글 개수

    updateQueryParams(); // 쿼리 파라미터 갱신
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, [page, filterCategory, searchField, searchKeyword, commentFilter]);

  // 페이지네이션 계산
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
    fetchPosts();
  };

  // 새 글 작성 버튼
  const handleWrite = () => {
    navigate('/community/hobby/add');
  };
  const searchFieldOptions = [
    { value: 'title', label: '제목' },
    { value: 'content', label: '내용' },
    { value: 'titleContent', label: '제목+내용' },
    { value: 'author', label: '작성자' }, // 작성자 검색 추가
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
              onClick={() => handleCategoryFilter(cat.value)} // 클릭 시 카테고리 변경
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

        {/* 검색 결과 표시 */}
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

                      <div className="hobby-list-flex">
                      <div className="hobby-list-item-category-title">
                        <span className="hobby-post-category">{post.category}</span>
                        <h3 className="hobby-post-title">{post.title}</h3>
                      </div>
                      <div className="hobby-list-item-meta">
                        <p className="hobby-meta-line">
                          <strong>작성자:</strong> {post.memberId} {/* 작성자 아이디 추가 */}
                        </p>
                        <p className="hobby-meta-line">
                          <strong>작성 시간:</strong>{' '}
                          {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'N/A'}
                        </p>
                        {post.updatedAt && post.updatedAt !== post.createdAt && (
                          <p className="hobby-meta-line">
                            <strong>수정 시간:</strong> {new Date(post.updatedAt).toLocaleString()}
                          </p>
                        )}
                        <p className="hobby-meta-line">
                          <strong>댓글 수:</strong> {post.commentCount || 0}
                        </p>
                      </div>
                      </div>
                      {post.thumbnailUrl && (
                        <div className="hobby-thumbnail-container">
                          <img src={post.thumbnailUrl} alt="썸네일" className="hobby-thumbnail" />
                        </div>
                      )}
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
