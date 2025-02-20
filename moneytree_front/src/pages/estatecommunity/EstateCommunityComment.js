import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/estate/EstateCommunityComment.css';
import { getCookie } from '../../util/cookieUtil';
import LoginPage from '../member/LoginPage'; // 로그인 모달 컴포넌트

const EstateCommunityComment = ({ postId, onCommentChange }) => {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0); // 전체 댓글 개수
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLoginTooltip, setShowLoginTooltip] = useState(false);

  const blockSize = 10;
  // 로그인한 사용자의 memberId
  const loggedInUser = getCookie('member');
  const loggedInUserId = loggedInUser?.memberId;

  // 댓글 목록 불러오기
  const fetchComments = () => {
    axios
        .get(`http://localhost:8080/api/comments?postId=${postId}&page=${page}&size=10`)
        .then((response) => {
          if (response.data && response.data.content !== undefined) {
            setComments(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalResults(response.data.totalElements);
          } else {
            console.error('알 수 없는 응답 구조:', response.data);
          }
        })
        .catch((error) => console.error('댓글 불러오기 오류:', error));
  };

  useEffect(() => {
    fetchComments();
  }, [postId, page]);

  // 페이지네이션 계산
  const currentBlock = Math.floor(page / blockSize);
  const startPage = currentBlock * blockSize;
  const endPage = Math.min(startPage + blockSize - 1, totalPages - 1);

  const handlePageClick = (pageNum) => setPage(pageNum);
  const handlePrevBlock = () => setPage(Math.max(startPage - blockSize, 0));
  const handleNextBlock = () => setPage(Math.min(startPage + blockSize, totalPages - 1));
  const goFirst = () => setPage(0);
  const goLast = () => setPage(totalPages - 1);

  // 새 댓글 작성
  const handleNewCommentSubmit = () => {
    if (!loggedInUserId) {
      // 로그인하지 않은 경우
      alert('댓글 작성시 로그인이 필요합니다.');
      setShowLoginTooltip(true);
      setShowLoginModal(true);
      setTimeout(() => {
        setShowLoginTooltip(false);
      }, 3000);
      return;
    }
    if (!newCommentText.trim()) return;

    axios
        .post(`http://localhost:8080/api/comments?postId=${postId}`, {
          text: newCommentText,
          author: loggedInUserId,
        })
        .then(() => {
          // 새 댓글 작성 후에도 현재 페이지 유지 (setPage(0) 제거)
          setNewCommentText('');
          fetchComments();
          if (onCommentChange) onCommentChange();
        })
        .catch((error) => console.error('댓글 작성 오류:', error));
  };

  // 댓글 수정 시작
  const handleStartEdit = (comment) => {
    if (!loggedInUserId || String(comment.author) !== String(loggedInUserId)) {
      alert('수정 권한이 없습니다.');
      return;
    }
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  };

  // 댓글 수정 저장
  const handleSaveEdit = (commentId) => {
    if (!editingText.trim()) return;
    axios
        .put(`http://localhost:8080/api/comments/${commentId}`, {
          text: editingText,
          author: loggedInUserId,
        })
        .then(() => {
          setEditingCommentId(null);
          setEditingText('');
          fetchComments();
          if (onCommentChange) onCommentChange();
        })
        .catch((error) => console.error('댓글 수정 오류:', error));
  };

  // 댓글 삭제
  const handleDeleteComment = (comment) => {
    if (!loggedInUserId || String(comment.author) !== String(loggedInUserId)) {
      alert('삭제 권한이 없습니다.');
      return;
    }
    if (window.confirm('이 댓글을 삭제하시겠습니까?')) {
      axios
          .delete(`http://localhost:8080/api/comments/${comment.id}`)
          .then(() => {
            fetchComments();
            if (onCommentChange) onCommentChange();
          })
          .catch((error) => console.error('댓글 삭제 오류:', error));
    }
  };

  // 모달 닫기 핸들러
  const closeModal = () => setShowLoginModal(false);
  const handleLoginSuccess = () => setShowLoginModal(false);

  return (
      <div className="comment-container">
        <h3 className="comment-header">💬 댓글 (댓글 개수: {totalResults}건)</h3>

        {/*
        1) 댓글 작성 폼을 위에 배치
           => 댓글 목록이 아래로 내려감
      */}
        <div className="comment-create-form">
        <textarea
            placeholder="댓글을 입력하세요"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="create-textarea"
        />
          <div className="comment-create-button-container">
            <button onClick={handleNewCommentSubmit} className="btn create-btn">
              댓글 작성
            </button>
            {showLoginTooltip && <div className="login-tooltip">로그인이 필요합니다</div>}
          </div>
        </div>

        {/*
        2) 댓글 목록
           - 서버가 내림차순(최신→0번)이라고 가정 → reverse() 적용
           - 오름차순이면 reverse() 제거
      */}
        {comments.length > 0 ? (
            <ul className="comment-list">
              {comments
                  .slice()
                  .reverse()
                  .map((comment) => (
                      <li key={comment.id} className="comment-item">
                        {editingCommentId === comment.id ? (
                            <div className="comment-edit-form">
                              <input
                                  type="text"
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="edit-input"
                              />
                              <div className="edit-buttons">
                                <button onClick={() => handleSaveEdit(comment.id)} className="btn save-btn">
                                  저장
                                </button>
                                <button
                                    onClick={() => setEditingCommentId(null)}
                                    className="btn cancel-btn"
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                        ) : (
                            <>
                              <p className="comment-meta">
                                <strong>{comment.author}</strong> -{' '}
                                {comment.createdAt
                                    ? new Date(comment.createdAt).toLocaleString()
                                    : 'N/A'}
                                {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                                    <span> (수정: {new Date(comment.updatedAt).toLocaleString()})</span>
                                  )}
                              </p>
                              <p className="comment-text">{comment.text}</p>
                              <div className="comment-actions">
                                {loggedInUserId && String(comment.author) === String(loggedInUserId) && (
                                    <>
                                      <button onClick={() => handleStartEdit(comment)} className="btn edit-btn">
                                        수정
                                      </button>
                                      <button
                                          onClick={() => handleDeleteComment(comment)}
                                          className="btn delete-btn"
                                      >
                                        삭제
                                      </button>
                                    </>
                                )}
                              </div>
                            </>
                        )}
                      </li>
                  ))}
            </ul>
        ) : (
            <p className="no-comment">댓글이 없습니다.</p>
        )}

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

        {/* 로그인 모달 (비로그인 시 댓글 작성 등에서 호출) */}
        {showLoginModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <button className="modal-close-button" onClick={closeModal}>
                  &times;
                </button>
                <LoginPage onLoginSuccess={handleLoginSuccess} />
              </div>
            </div>
        )}
      </div>
  );
};

export default EstateCommunityComment;
