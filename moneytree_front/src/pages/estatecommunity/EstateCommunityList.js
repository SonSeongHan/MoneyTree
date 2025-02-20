import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/estate/EstateCommunityList.css'; // 아래 CSS 파일

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const EstateCommunityList = () => {
    const query = useQuery();
    const initialPage = parseInt(query.get('page') || '0', 10);
    const initialCategory = query.get('category') || '전체보기';
    const initialSearchField = query.get('searchField') || 'title';
    const initialSearchKeyword = query.get('search') || '';
    const initialCommentFilter = query.get('commentFilter') || '';

    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(0);
    const [totalResults, setTotalResults] = useState(0);

    // 페이지네이션 블록 크기
    const blockSize = 10;

    // 필터 상태
    const [filterCategory, setFilterCategory] = useState(initialCategory);
    const [searchField, setSearchField] = useState(initialSearchField);
    const [searchKeyword, setSearchKeyword] = useState(initialSearchKeyword);
    const [commentFilter, setCommentFilter] = useState(initialCommentFilter);

    const navigate = useNavigate();

    // 페이지 이동 함수
    const handlePageClick = (pageNum) => setPage(pageNum);
    const handlePrevBlock = () => setPage(Math.max(currentBlock * blockSize - blockSize, 0));
    const handleNextBlock = () => setPage(Math.min((currentBlock + 1) * blockSize, totalPages - 1));
    const goFirst = () => setPage(0);
    const goLast = () => setPage(totalPages - 1);

    // URL Query 파라미터 갱신
    const updateQueryParams = () => {
        const params = new URLSearchParams();
        params.set('page', page);
        params.set('category', filterCategory);
        params.set('searchField', searchField);
        params.set('search', searchKeyword);
        params.set('commentFilter', commentFilter);
        window.history.replaceState(null, '', `?${params.toString()}`);
    };

    // 게시글 데이터 불러오기
    const fetchPosts = () => {
        let url = `http://localhost:8080/api/estate-community?page=${page}&size=10`;

        // 카테고리 필터
        if (filterCategory !== '전체보기') {
            url += `&category=${encodeURIComponent(filterCategory)}`;
        }
        // 검색 필터
        if (searchKeyword.trim() !== '') {
            url += `&searchField=${encodeURIComponent(searchField)}&search=${encodeURIComponent(searchKeyword.trim())}`;
        }
        // 댓글 필터
        if (commentFilter.trim() !== '') {
            url += `&commentFilter=${encodeURIComponent(commentFilter)}`;
        }

        axios
            .get(url)
            .then((response) => {
                if (response.data && response.data.content !== undefined) {
                    setPosts(response.data.content);
                    setTotalPages(response.data.totalPages);
                    setTotalResults(response.data.totalElements);
                } else if (Array.isArray(response.data)) {
                    // content가 없이 배열만 오는 경우
                    setPosts(response.data);
                    setTotalPages(1);
                    setTotalResults(response.data.length);
                } else {
                    console.error('알 수 없는 응답 구조:', response.data);
                }
                updateQueryParams();
            })
            .catch((error) => console.error('게시글 불러오기 오류:', error));
    };

    useEffect(() => {
        fetchPosts();
        // eslint-disable-next-line
    }, [page, filterCategory, searchField, searchKeyword, commentFilter]);

    // 페이지네이션 계산
    const currentBlock = Math.floor(page / blockSize);
    const startPage = currentBlock * blockSize;
    const endPage = Math.min(startPage + blockSize - 1, totalPages - 1);

    // 카테고리 필터 변경
    const handleCategoryFilter = (category) => {
        setFilterCategory(category);
        setPage(0);
    };

    // 댓글 필터 변경
    const handleCommentFilter = (filter) => {
        setCommentFilter(filter);
        setPage(0);
    };

    // 검색 버튼 클릭
    const handleSearch = () => {
        setPage(0);
        fetchPosts();
    };

    // 게시글 작성 버튼 클릭
    const handleWrite = () => {
        // 바로 글 작성 페이지로 이동 (로그인 모달 제거)
        navigate('/community/real-estate/new');
    };

    // 검색 필드 옵션
    const searchFieldOptions = [
        { value: 'title', label: '제목' },
        { value: 'content', label: '내용' },
        { value: 'titleContent', label: '제목+내용' },
        { value: 'author', label: '작성자' },
    ];

    return (
        <div className="community-list-container">
            {/* 상단 배너 (옵션) */}
            <div className="community-banner">
                <h2>🏡 부동산 커뮤니티</h2>
                <p>함께 이야기하고 정보를 나누는 공간</p>
            </div>

            <div className="community-content">
                <h2 className="comment-header">부동산 커뮤니티</h2>

                {/* 카테고리 필터 */}
                <div className="category-filter">
                    {['전체보기', '부동산 매입', '공동명의 의뢰', '최근 동향', '기타'].map((cat) => (
                        <button
                            key={cat}
                            className={filterCategory === cat ? 'active' : ''}
                            onClick={() => handleCategoryFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* 댓글 필터 */}
                <div className="comment-filter">
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
                <div className="search-area">
                    <select
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                        className="search-field"
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
                        className="search-input"
                    />
                    <button onClick={handleSearch} className="search-button">
                        검색
                    </button>
                </div>

                {/* 결과 개수 */}
                <div className="result-count">검색 결과: {totalResults}건</div>

                {/* 새 글 작성 버튼 */}
                <div className="new-post-button-container">
                    <button className="new-post-button" onClick={handleWrite}>
                        ✏️ 새 게시글 작성
                    </button>
                </div>

                {/* 게시글 목록 */}
                <ul className="community-list">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <li key={post.id} className="community-list-item">
                                <Link to={`/community/real-estate/${post.id}`} className="list-link">
                                    <div className="list-item-header">
                                        <div className="list-item-category-title">
                                            <span className="post-category">{post.category}</span>
                                            <h3 className="post-title">{post.title}</h3>
                                        </div>
                                        <div className="list-item-meta">
                                            <p className="meta-line">
                                                <strong>작성자:</strong> {post.author}
                                            </p>
                                            <p className="meta-line">
                                                <strong>작성 시간:</strong>{' '}
                                                {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'N/A'}
                                            </p>
                                            {post.updatedAt && post.updatedAt !== post.createdAt && (
                                                <p className="meta-line">
                                                    <strong>수정 시간:</strong> {new Date(post.updatedAt).toLocaleString()}
                                                </p>
                                            )}
                                            <p className="meta-line">
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

                {/* 페이지네이션 */}
                <div className="pagination">
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

export default EstateCommunityList;
