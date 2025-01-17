// src/Pages/navpage/AllComments.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import jwtAxios, { decodeJWT } from '../util/jwtUtil';
import { toast } from 'react-toastify'; // toast 임포트
import 'react-toastify/dist/ReactToastify.css'; // 스타일 임포트

const AllComments = () => {
  const { newsId } = useParams(); // URL에서 뉴스 ID 가져오기
  const [comments, setComments] = useState([]); // 댓글 목록
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const [editingCommentId, setEditingCommentId] = useState(null); // 편집 상태
  const [updatedContent, setUpdatedContent] = useState(''); // 업데이트할 내용
  const [newComment, setNewComment] = useState(''); // 새 댓글 내용
  const [loading, setLoading] = useState(true); // 댓글 로딩 상태

  const navigate = useNavigate();

  const userEmail = decodeJWT(); // 사용자 이메일 가져오기

  // 댓글 가져오기
  const fetchComments = async (page = 0) => {
    setLoading(true);
    try {
      const response = await jwtAxios.get(`/api/comments/news/${newsId}`, {
        params: { page, size: 10, sort: 'createdAt,desc' },
      });
      // 댓글 데이터에 사용자 추천/비추천 상태 추가
      const fetchedComments = response.data.content.map((comment) => ({
        ...comment,
        hasUpvoted: comment.hasUpvoted || false,
        hasDownvoted: comment.hasDownvoted || false,
      }));
      setComments(fetchedComments);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      console.error('댓글을 가져오는 중 오류 발생:', err);
      toast.error('댓글을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [newsId]);

  // 좋아요 처리
  const handleLike = async (commentId) => {
    if (!userEmail) {
      alert('로그인이 필요합니다.');
      toast.info('로그인이 필요합니다.');
      navigate('/player/login');
      return;
    }

    try {
      await jwtAxios.patch(`/api/comments/${commentId}/like`);
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
              ...comment,
              likes: comment.likes + 1,
              hasUpvoted: true,
            }
            : comment
        )
      );
      toast.success('좋아요가 반영되었습니다.');
    } catch (err) {
      console.error('댓글 좋아요 중 오류 발생:', err);
      toast.error('좋아요에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 싫어요 처리
  const handleDislike = async (commentId) => {
    if (!userEmail) {
      alert('로그인이 필요합니다.');
      toast.info('로그인이 필요합니다.');
      navigate('/player/login');
      return;
    }

    try {
      await jwtAxios.patch(`/api/comments/${commentId}/dislike`);
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
              ...comment,
              dislikes: comment.dislikes + 1,
              hasDownvoted: true,
            }
            : comment
        )
      );
      toast.success('싫어요가 반영되었습니다.');
    } catch (err) {
      console.error('댓글 싫어요 중 오류 발생:', err);
      toast.error('싫어요에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 댓글 수정 처리
  const handleUpdate = async (commentId) => {
    if (!updatedContent.trim()) {
      toast.warning('댓글 내용을 입력하세요.');
      return;
    }

    try {
      await jwtAxios.patch(`/api/comments/${commentId}`, {
        content: updatedContent,
      });
      setEditingCommentId(null);
      toast.success('댓글이 성공적으로 수정되었습니다.');
      fetchComments(currentPage);
    } catch (err) {
      console.error('댓글 수정 중 오류 발생:', err);
      toast.error('댓글 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 댓글 삭제 처리
  const handleDelete = async (commentId) => {
    if (!window.confirm('정말 댓글을 삭제하시겠습니까?')) return;

    try {
      await jwtAxios.delete(`/api/comments/${commentId}`);
      toast.success('댓글이 성공적으로 삭제되었습니다.');
      fetchComments(currentPage);
    } catch (err) {
      console.error('댓글 삭제 중 오류 발생:', err);
      toast.error('댓글 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 새 댓글 추가 처리
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.warning('댓글 내용을 입력하세요.');
      return;
    }

    if (!userEmail) {
      toast.info('로그인이 필요합니다.');
      navigate('/player/login');
      return;
    }

    try {
      await jwtAxios.post(`/api/comments/news/${newsId}`, {
        username: userEmail,
        content: newComment,
      });
      setNewComment('');
      toast.success('댓글이 성공적으로 작성되었습니다.');
      // fetchComments(0); // 기존: 첫 페이지로 이동

      // 변경: 현재 페이지로 다시 불러오기
      fetchComments(currentPage);
    } catch (err) {
      console.error('댓글 작성 중 오류 발생:', err);
      toast.error('댓글 작성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 날짜 형식 지정
  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  if (loading) return <div>댓글을 불러오는 중...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', color: 'black' }}>
      <h1>모든 댓글</h1>
      <div>
        {comments.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {comments.map((comment) => (
              <li
                key={comment.id}
                style={{
                  marginBottom: '10px',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                {editingCommentId === comment.id ? (
                  <>
                    <textarea
                      value={updatedContent}
                      onChange={(e) => setUpdatedContent(e.target.value)}
                      rows="3"
                      style={{
                        width: '100%',
                        marginBottom: '10px',
                        padding: '10px',
                      }}
                    />
                    <div>
                      <button
                        onClick={() => handleUpdate(comment.id)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          marginRight: '10px',
                        }}
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingCommentId(null)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                        }}
                      >
                        취소
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ marginBottom: '8px' }}>
                      <span
                        style={{
                          fontWeight: 'bold',
                          marginRight: '5px',
                          color: '#1a73e8',
                        }}
                      >
                        사용자:
                      </span>
                      <span>{comment.username}</span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <span
                        style={{
                          fontWeight: 'bold',
                          marginRight: '5px',
                          color: '#1a73e8',
                        }}
                      >
                        댓글내용:
                      </span>
                      <span>{comment.content}</span>
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: '#666',
                      }}
                    >
                      작성일: {formatDate(comment.createdAt)}
                      {comment.updatedAt && (
                        <span> | 수정일: {formatDate(comment.updatedAt)}</span>
                      )}
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      {/* 좋아요 버튼 */}
                      <button
                        onClick={() => handleLike(comment.id)}
                        disabled={comment.hasUpvoted}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: comment.hasUpvoted
                            ? '#6c757d'
                            : '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: comment.hasUpvoted
                            ? 'not-allowed'
                            : 'pointer',
                          marginRight: '10px',
                        }}
                      >
                        👍 좋아요 ({comment.likes})
                      </button>

                      {/* 싫어요 버튼 */}
                      <button
                        onClick={() => handleDislike(comment.id)}
                        disabled={comment.hasDownvoted}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: comment.hasDownvoted
                            ? '#6c757d'
                            : '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: comment.hasDownvoted
                            ? 'not-allowed'
                            : 'pointer',
                        }}
                      >
                        👎 싫어요 ({comment.dislikes})
                      </button>

                      {/* 댓글 작성자가 로그인한 사용자일 경우에만 수정 및 삭제 버튼 표시 */}
                      {userEmail && userEmail === comment.username && (
                        <>
                          <button
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setUpdatedContent(comment.content);
                            }}
                            style={{
                              marginLeft: '10px',
                              padding: '5px 10px',
                              backgroundColor: '#ffc107',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                            }}
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(comment.id)}
                            style={{
                              marginLeft: '10px',
                              padding: '5px 10px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                            }}
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
          <p>사용 가능한 댓글이 없습니다.</p>
        )}
      </div>

      {/* 페이지네이션 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          flexWrap: 'wrap',
        }}
      >
        {/* 첫 페이지로 이동 */}
        <button
          onClick={() => fetchComments(0)}
          disabled={currentPage === 0}
          style={{
            padding: '8px 16px',
            backgroundColor: currentPage === 0 ? '#e9ecef' : '#0d6efd',
            color: currentPage === 0 ? '#6c757d' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            minWidth: '70px',
          }}
        >
          ≪ 처음
        </button>

        {/* 이전 그룹으로 이동 */}
        <button
          onClick={() =>
            fetchComments(Math.max(0, Math.floor((currentPage - 5) / 5) * 5))
          }
          disabled={currentPage < 5}
          style={{
            padding: '8px 16px',
            backgroundColor: currentPage < 5 ? '#e9ecef' : '#0d6efd',
            color: currentPage < 5 ? '#6c757d' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: currentPage < 5 ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            minWidth: '70px',
          }}
        >
          ＜ 이전
        </button>

        {/* 페이지 번호 버튼들 */}
        {[
          ...Array(Math.min(5, totalPages - Math.floor(currentPage / 5) * 5)),
        ].map((_, idx) => {
          const pageNum = Math.floor(currentPage / 5) * 5 + idx;
          return (
            <button
              key={pageNum}
              onClick={() => fetchComments(pageNum)}
              style={{
                padding: '8px 12px',
                backgroundColor: currentPage === pageNum ? '#0d6efd' : 'white',
                color: currentPage === pageNum ? 'white' : '#0d6efd',
                border: '1px solid #0d6efd',
                borderRadius: '4px',
                cursor: 'pointer',
                minWidth: '40px',
                fontWeight: currentPage === pageNum ? '600' : '400',
              }}
            >
              {pageNum + 1}
            </button>
          );
        })}

        {/* 다음 그룹으로 이동 */}
        <button
          onClick={() =>
            fetchComments(
              Math.min(totalPages - 1, Math.ceil((currentPage + 1) / 5) * 5)
            )
          }
          disabled={
            Math.floor(currentPage / 5) === Math.floor((totalPages - 1) / 5)
          }
          style={{
            padding: '8px 16px',
            backgroundColor:
              Math.floor(currentPage / 5) === Math.floor((totalPages - 1) / 5)
                ? '#e9ecef'
                : '#0d6efd',
            color:
              Math.floor(currentPage / 5) === Math.floor((totalPages - 1) / 5)
                ? '#6c757d'
                : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor:
              Math.floor(currentPage / 5) === Math.floor((totalPages - 1) / 5)
                ? 'not-allowed'
                : 'pointer',
            fontWeight: '500',
            minWidth: '70px',
          }}
        >
          다음 ＞
        </button>

        {/* 마지막 페이지로 이동 */}
        <button
          onClick={() => fetchComments(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
          style={{
            padding: '8px 16px',
            backgroundColor:
              currentPage === totalPages - 1 ? '#e9ecef' : '#0d6efd',
            color: currentPage === totalPages - 1 ? '#6c757d' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            minWidth: '70px',
          }}
        >
          마지막 ≫
        </button>
      </div>

      {/* 새 댓글 추가 */}
      {userEmail ? (
        <div style={{ marginTop: '20px' }}>
          <h3>댓글 작성</h3>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 작성하세요...( 댓글을 작성하려면 로그인이 필요합니다. )"
            rows="3"
            style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
          />
          <button
            onClick={handleAddComment}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            제출
          </button>
        </div>
      ) : (
        <p>댓글을 작성하려면 로그인이 필요합니다.</p>
      )}
    </div>
  );
};

export default AllComments;
