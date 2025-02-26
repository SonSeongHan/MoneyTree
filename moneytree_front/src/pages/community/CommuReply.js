import React, { useState, useEffect } from 'react';
import {
    fetchCommunityReply,
    fetchCreateReply,
    fetchDeleteReply,
    fetchUpdateReply,
} from '../../api/CommuReplyApi'; // 댓글 API
import { getCookie } from '../../util/cookieUtil';
import '../../css/hobby/CommuReply.css';

const CommuReply = ({ postId, updateCommentCount }) => {
    const [replies, setReplies] = useState([]);
    const [newReplyContent, setNewReplyContent] = useState('');
    const [editingReplyId, setEditingReplyId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [page, setPage] = useState(0); // 페이지 상태
    const [totalPages, setTotalPages] = useState(0);
    const loggedInUser = getCookie('member');
    const loggedInUserId = loggedInUser?.memberId;

    // 댓글 불러오기
    const loadReplies = async () => {
        try {
            const data = await fetchCommunityReply(postId, page, 10);
            // 최신 댓글이 맨 위로 오도록 정렬
            const sortedReplies = data.content.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            );
            setReplies(sortedReplies); // 정렬된 댓글 목록을 state에 저장
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('댓글을 불러오는 데 실패했습니다:', error);
        }
    };

    useEffect(() => {
        loadReplies(); // 컴포넌트가 마운트되면 댓글을 불러옵니다.
    }, [postId, page, loadReplies]); // 댓글 불러오는 API가 postId와 page 변경 시마다 실행

    // 날짜 유효성 검사 함수
    const isValidDate = (date) => {
        const parsedDate = new Date(date);
        return parsedDate instanceof Date && !isNaN(parsedDate);
    };

    // 댓글 작성
    const handleCreateReply = async () => {
        if (!newReplyContent.trim()) {
            alert('답글 내용을 입력하세요');
            return;
        }
        try {
            const newReply = {
                postId: Number(postId),
                memberId: loggedInUserId,
                content: newReplyContent,
                is_deleted: false,
            };

            await fetchCreateReply(newReply); // 댓글 생성 요청
            setNewReplyContent(''); // 입력 필드 초기화
            setPage(0); // 댓글 작성 후 첫 번째 페이지로 이동
            loadReplies(); // 댓글 목록을 새로고침하여 최신 댓글을 반영
        } catch (error) {
            console.error('답글 작성 오류:', error);
            alert('답글 작성 중 오류가 발생했습니다.');
        }
    };

    // 댓글 수정 시작
    const handleStartEdit = (reply) => {
        setEditingReplyId(reply.replyId);
        setEditingText(reply.content);
    };

    // 댓글 수정 저장
    const handleSaveEdit = async (replyId) => {
        if (!editingText.trim()) return;
        try {
            await fetchUpdateReply(replyId, { content: editingText });
            setEditingReplyId(null);
            setEditingText('');
            loadReplies(); // 댓글 수정 후 댓글 목록을 새로고침
        } catch (error) {
            console.error('답글 수정 오류:', error);
            alert('답글 수정 중 오류가 발생했습니다.');
        }
    };

    // 댓글 삭제
    const handleDeleteReply = async (replyId) => {
        if (!window.confirm('이 답글을 삭제하시겠습니까?')) return;
        try {
            await fetchDeleteReply(replyId);
            loadReplies(); // 댓글 삭제 후 댓글 목록을 새로고침

            // 댓글 삭제 후 댓글 개수 업데이트
            updateCommentCount(replies.length - 1); // 부모 컴포넌트에서 댓글 개수를 업데이트
        } catch (error) {
            console.error('답글 삭제 오류:', error);
            alert('답글 삭제 중 오류가 발생했습니다.');
        }
    };

    // 페이지네이션 계산
    const blockSize = 10;
    const currentBlock = Math.floor(page / blockSize);
    const startPage = currentBlock * blockSize;
    const endPage = Math.min(startPage + blockSize - 1, totalPages - 1);

    const handlePageClick = (pageNum) => setPage(pageNum);
    const handlePrevBlock = () => setPage(Math.max(startPage - blockSize, 0));
    const handleNextBlock = () => setPage(Math.min(startPage + blockSize, totalPages - 1));
    const goFirst = () => setPage(0);
    const goLast = () => setPage(totalPages - 1);

    return (
      <div>
          <h3>답글</h3>
          <div>
        <textarea
          placeholder="댓글을 입력하세요"
          value={newReplyContent}
          onChange={(e) => setNewReplyContent(e.target.value)}
        />
              <button onClick={handleCreateReply}>작성</button>
          </div>

          <ul>
              {replies.length > 0 ? (
                replies
                  .slice()
                  .reverse() // 최신 댓글이 맨 위에 오도록 역순으로 정렬
                  .map((reply) => (
                    <li key={reply.replyId}>
                        {editingReplyId === reply.replyId ? (
                          <div>
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                    />
                              <button onClick={() => handleSaveEdit(reply.replyId)}>저장</button>
                              <button onClick={() => setEditingReplyId(null)}>취소</button>
                          </div>
                        ) : (
                          <div>
                              <p>
                                  <strong>{reply.memberId}</strong> -{' '}
                                  {isValidDate(reply.created_at)
                                    ? new Date(reply.created_at).toLocaleString()
                                    : 'N/A'}{' '}
                                  {reply.updated_at && reply.updated_at !== reply.created_at && (
                                    <span> (수정: {new Date(reply.updated_at).toLocaleString()})</span>
                                      )}
                              </p>
                              <p>{reply.content}</p>
                              {loggedInUserId === reply.memberId && (
                                <>
                                    <button onClick={() => handleStartEdit(reply)}>수정</button>
                                    <button onClick={() => handleDeleteReply(reply.replyId)}>삭제</button>
                                </>
                              )}
                          </div>
                        )}
                    </li>
                  ))
              ) : (
                <p>댓글이 없습니다.</p>
              )}
          </ul>

          {/* 페이지네이션 */}
          <div>
              <button onClick={goFirst} disabled={page === 0}>
                  처음
              </button>
              <button onClick={handlePrevBlock} disabled={startPage === 0}>
                  이전
              </button>
              {Array.from({ length: endPage - startPage + 1 }, (_, idx) => {
                  const pageNum = startPage + idx;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageClick(pageNum)}
                      disabled={pageNum === page}
                    >
                        {pageNum + 1}
                    </button>
                  );
              })}
              <button onClick={handleNextBlock} disabled={endPage === totalPages - 1}>
                  다음
              </button>
              <button onClick={goLast} disabled={page === totalPages - 1}>
                  끝
              </button>
          </div>
      </div>
    );
};

export default CommuReply;
