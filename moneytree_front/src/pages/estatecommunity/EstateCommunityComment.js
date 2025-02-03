import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/estate/EstateCommunityComment.css';

const EstateCommunityComment = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(0); // 현재 댓글 페이지 (0부터 시작)
  const [totalPages, setTotalPages] = useState(0); // 전체 댓글 페이지 수
  const [newCommentText, setNewCommentText] = useState(''); // 댓글 작성 입력란
  const [editingCommentId, setEditingCommentId] = useState(null); // 수정 중인 댓글 ID
  const [editingText, setEditingText] = useState(''); // 수정용 입력값
  const blockSize = 10; // 한 블록에 표시할 페이지 수

  // 댓글 목록을 페이지네이션해서 가져오기
  const fetchComments = () => {
    axios
      .get(`http://localhost:8080/api/estate-community/${postId}/comments?page=${page}&size=10`)
      .then((response) => {
        // 응답 JSON 구조: { content: [...], totalPages: ..., ... }
        if (response.data && response.data.content !== undefined) {
          setComments(response.data.content);
          setTotalPages(response.data.totalPages);
        } else if (Array.isArray(response.data)) {
          setComments(response.data);
          setTotalPages(1);
        } else {
          console.error('알 수 없는 응답 구조:', response.data);
        }
      })
      .catch((error) => console.error('댓글 불러오기 오류:', error));
  };

  useEffect(() => {
    fetchComments();
  }, [postId, page]);

  // 페이지네이션 블록 계산
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

  // 댓글 추가 처리
  const handleNewCommentSubmit = () => {
    if (!newCommentText.trim()) return;
    axios
      .post(`http://localhost:8080/api/comments?postId=${postId}`, {
        text: newCommentText,
        author: '익명', // 로그인 정보로 대체 가능
      })
      .then((response) => {
        setNewCommentText('');
        setPage(0); // 새 댓글 작성 후 최신 댓글 확인을 위해 첫 페이지로 이동
        fetchComments();
      })
      .catch((error) => console.error('댓글 작성 오류:', error));
  };

  // 댓글 삭제 처리
  const handleDeleteComment = (commentId) => {
    if (window.confirm('이 댓글을 삭제하시겠습니까?')) {
      axios
        .delete(`http://localhost:8080/api/comments/${commentId}`)
        .then(() => fetchComments())
        .catch((error) => console.error('댓글 삭제 오류:', error));
    }
  };

  // 인라인 댓글 수정 시작
  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  };

  // 인라인 댓글 수정 취소
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  // 인라인 댓글 수정 저장
  const handleSaveEdit = (commentId) => {
    if (!editingText.trim()) return;
    axios
      .put(`http://localhost:8080/api/comments/${commentId}`, {
        text: editingText,
        author: '익명', // 또는 기존 comment.author 유지
      })
      .then((response) => {
        setEditingCommentId(null);
        setEditingText('');
        fetchComments();
      })
      .catch((error) => console.error('댓글 수정 오류:', error));
  };

  return (
    <div className="comment-container">
      <h3 className="comment-header">💬 댓글</h3>
      {comments.length > 0 ? (
        <ul className="comment-list">
          {comments.map((comment) => (
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
                    <button onClick={handleCancelEdit} className="btn cancel-btn">
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="comment-meta">
                    <strong>{comment.author}</strong> -{' '}
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'N/A'}
                    {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                      <span> (수정됨: {new Date(comment.updatedAt).toLocaleString()})</span>
                    )}
                  </p>
                  <p className="comment-text">{comment.text}</p>
                  <div className="comment-actions">
                    <button onClick={() => handleStartEdit(comment)} className="btn edit-btn">
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="btn delete-btn"
                    >
                      삭제
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-comment">댓글이 없습니다.</p>
      )}

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

      <div className="comment-create-form">
        <textarea
          placeholder="댓글을 입력하세요"
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          className="create-textarea"
        />
        <button onClick={handleNewCommentSubmit} className="btn create-btn">
          댓글 작성
        </button>
      </div>
    </div>
  );
};

export default EstateCommunityComment;
