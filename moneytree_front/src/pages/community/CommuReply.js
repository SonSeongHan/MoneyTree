import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    fetchCommunityReply,
    fetchCreateReply,
    fetchDeleteReply,
    fetchUpdateReply,
} from '../../api/CommuReplyApi';
import { getCookie } from '../../util/cookieUtil';
import '../../css/hobby/CommuReply.css';

const CommuReply = () => {
    const { postId } = useParams();
    const [replies, setReplies] = useState([]);
    const [newReplyContent, setnewReplyContent] = useState('');
    const [editReplyId, seteditReplyId] = useState(null);
    const [editReplyContent, setEditReplyContent] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const navigate = useNavigate();
    const loggedInUser = getCookie('member');
    const loggedInUserId = loggedInUser?.memberId;

    useEffect(() => {
        const loadReplies = async () => {
            try {
                const data = await fetchCommunityReply(postId, page, 10);
                setReplies(data.content);
                setTotalPages(data.totalPages);
            } catch (error) {
                console.error('답글을 불러오는 데 실패했습니다:', error);
            }
        };
        loadReplies();
    }, [postId, page]);

    const handleCreateReply = async () => {
        if (!newReplyContent.trim()) {
            alert('답글 내용을 입력하세요');
            return;
        }
        try {
            const newReply = {
                postId: Number(postId),
                membershipType: loggedInUser.membershipType,
                memberId: loggedInUser.memberId,
                content: newReplyContent,
                is_deleted: false,
            };
            console.log('새로 작성하는 답글 정보:', newReply);
            await fetchCreateReply(newReply);
            setnewReplyContent('');
            alert('답글이 성공적으로 추가되었습니다.');
            // 새로고침 대신 상태만 업데이트해도 되지만, 즉시 반영을 위해 간단히 페이지 리로드
            window.location.reload();
        } catch (error) {
            console.error('답글 생성 실패:', error);
            alert('답글 생성 중 오류가 발생했습니다.');
        }
    };

    const startEditReply = (replyId, content) => {
        seteditReplyId(replyId);
        setEditReplyContent(content);
    };

    const handleUpdateReply = async () => {
        if (!editReplyContent.trim()) {
            alert('수정할 내용을 입력하세요.');
            return;
        }
        const targetReply = replies.find((reply) => reply.replyId === editReplyId);
        if (!targetReply || targetReply.memberId !== loggedInUserId) {
            alert('권한이 없습니다.');
            navigate(-1);
            return;
        }
        try {
            const updateReply = {
                replyId: editReplyId,
                content: editReplyContent,
            };
            await fetchUpdateReply(editReplyId, updateReply);
            seteditReplyId(null);
            setEditReplyContent('');
            alert('답글이 성공적으로 수정되었습니다.');
            window.location.reload();
        } catch (error) {
            console.error('답글 수정 실패:', error);
            alert('답글 수정 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteReply = async (replyId) => {
        if (!window.confirm('이 답글을 삭제하시겠습니까?')) return;
        const targetReply = replies.find((reply) => reply.replyId === replyId);
        if (!targetReply || targetReply.memberId !== loggedInUserId) {
            alert('답글 삭제 권한이 없습니다.');
            return;
        }
        try {
            await fetchDeleteReply(replyId);
            alert('답글이 성공적으로 삭제되었습니다.');
            window.location.reload();
        } catch (error) {
            console.error('답글 삭제 실패:', error);
            alert('답글 삭제 중 오류가 발생했습니다.');
        }
    };

    // 페이지네이션 관련 계산
    const blockSize = 5; // 페이지 블록 크기
    const currentBlock = Math.floor(page / blockSize);
    const startPage = currentBlock * blockSize;
    const endPage = Math.min(startPage + blockSize - 1, totalPages - 1);

    const handlePageClick = (pageNum) => {
        setPage(pageNum);
        window.scrollTo(0, document.querySelector('.reply-header').offsetTop - 50);
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
      <div className="reply-container" style={{
          background: '#fff',
          padding: '20px',
          maxWidth: '1200px',
          margin: '20px auto',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
      }}>
          <h3 className="reply-header" style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '15px',
              color: '#333',
              padding: '0px 0px 10px 0px',
              borderBottom: '2px solid #4caf50'
          }}>💬 댓글 </h3>

          {/* 댓글 작성 영역 */}
          <div className="reply-create" style={{
              marginBottom: '25px',
              background: '#f9f9f9',
              padding: '15px',
              borderRadius: '6px'
          }}>
                <textarea
                  value={newReplyContent}
                  onChange={(e) => setnewReplyContent(e.target.value)}
                  placeholder="답글을 작성하세요"
                  style={{
                      width: '100%',
                      height: '80px',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      resize: 'vertical',
                      fontSize: '0.9rem',
                      marginBottom: '10px'
                  }}
                />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="commuReply-add"
                    onClick={handleCreateReply}
                    style={{
                        backgroundColor: '#82b883',
                        color: 'white',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        transition: 'background-color 0.3s'
                    }}
                  >
                      댓글 작성
                  </button>
              </div>
          </div>

          {/* 댓글 목록 */}
          {replies.length > 0 ? (
            <ul className="reply-list" style={{
                listStyle: 'none',
                padding: '0',
                margin: '0'
            }}>
                {replies.map((reply) => (
                  <li key={reply.replyId} className="reply-item" style={{
                      borderBottom: '1px solid #e1e1e1',
                      padding: '15px 0px 15px 0px',
                      transition: 'background-color 0.2s',
                      marginBottom: '10px'
                  }}>
                      {editReplyId === reply.replyId ? (
                        <div className="reply-edit-area" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                                    <textarea
                                      value={editReplyContent}
                                      onChange={(e) => setEditReplyContent(e.target.value)}
                                      style={{
                                          width: '100%',
                                          height: '60px',
                                          padding: '8px',
                                          border: '1px solid #ccc',
                                          borderRadius: '4px',
                                          resize: 'vertical',
                                          fontSize: '0.9rem'
                                      }}
                                    />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={handleUpdateReply}
                                  className="save-btn"
                                  style={{
                                      backgroundColor: '#28a745',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '6px 12px',
                                      fontSize: '0.9rem',
                                      cursor: 'pointer',
                                      transition: 'background-color 0.3s'
                                  }}
                                >
                                    저장
                                </button>
                                <button
                                  onClick={() => seteditReplyId(null)}
                                  className="cancel-btn"
                                  style={{
                                      backgroundColor: '#6c757d',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '6px 12px',
                                      fontSize: '0.9rem',
                                      cursor: 'pointer',
                                      transition: 'background-color 0.3s'
                                  }}
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                      ) : (
                        <div>
                            <p className="reply-meta" style={{
                                fontSize: '0.9rem',
                                color: '#888',
                                marginBottom: '4px'
                            }}>
                                <strong>{reply.memberId}</strong> ({reply.membershipType})
                            </p>
                            <p className="reply-content" style={{
                                marginBottom: '8px',
                                color: '#333',
                                fontSize: '1rem'
                            }}>
                                {reply.content}
                            </p>
                            {reply.memberId === loggedInUserId && (
                              <div className="reply-actions" style={{
                                  display: 'flex',
                                  gap: '10px'
                              }}>
                                  <button
                                    className="commuReply-set"
                                    onClick={() => startEditReply(reply.replyId, reply.content)}
                                    style={{
                                        background: '#d9d9d8',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        border: 'none',
                                        color: 'black',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        transition: 'background-color 0.3s'
                                    }}
                                  >
                                      수정
                                  </button>
                                  <button
                                    className="commuReply-del"
                                    onClick={() => handleDeleteReply(reply.replyId)}
                                    style={{
                                        backgroundColor: '#3a3a3a',
                                        color: 'white',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        transition: 'background-color 0.3s'
                                    }}
                                  >
                                      삭제
                                  </button>
                              </div>
                            )}
                        </div>
                      )}
                  </li>
                ))}
            </ul>
          ) : (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px 0' }}>
                등록된 댓글이 없습니다.
            </p>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="pagination" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '5px',
                marginTop: '20px'
            }}>
                <button
                  onClick={goFirst}
                  disabled={page === 0}
                  style={{
                      padding: '6px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      background: page === 0 ? '#f0f0f0' : '#fff',
                      cursor: page === 0 ? 'not-allowed' : 'pointer',
                      opacity: page === 0 ? 0.5 : 1
                  }}
                >
                    처음
                </button>
                <button
                  onClick={handlePrevBlock}
                  disabled={startPage === 0}
                  style={{
                      padding: '6px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      background: startPage === 0 ? '#f0f0f0' : '#fff',
                      cursor: startPage === 0 ? 'not-allowed' : 'pointer',
                      opacity: startPage === 0 ? 0.5 : 1
                  }}
                >
                    이전
                </button>

                {Array.from({ length: endPage - startPage + 1 }, (_, idx) => {
                    const pageNum = startPage + idx;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageClick(pageNum)}
                        style={{
                            padding: '6px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            backgroundColor: pageNum === page ? '#007bff' : '#fff',
                            color: pageNum === page ? '#fff' : '#333',
                            cursor: 'pointer'
                        }}
                      >
                          {pageNum + 1}
                      </button>
                    );
                })}

                <button
                  onClick={handleNextBlock}
                  disabled={endPage === totalPages - 1}
                  style={{
                      padding: '6px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      background: endPage === totalPages - 1 ? '#f0f0f0' : '#fff',
                      cursor: endPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                      opacity: endPage === totalPages - 1 ? 0.5 : 1
                  }}
                >
                    다음
                </button>
                <button
                  onClick={goLast}
                  disabled={page === totalPages - 1}
                  style={{
                      padding: '6px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      background: page === totalPages - 1 ? '#f0f0f0' : '#fff',
                      cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer',
                      opacity: page === totalPages - 1 ? 0.5 : 1
                  }}
                >
                    끝
                </button>
            </div>
          )}
      </div>
    );
};

export default CommuReply;