import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchCommunityReply,
  fetchCreateReply,
  fetchDeleteReply,
  fetchUpdateReply,
} from '../../api/CommuReplyApi';
import { getCookie } from '../../util/cookieUtil';

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

  return (
    <div>
      <h3>답글</h3>
      <ul>
        {replies.map((reply) => (
          <li key={reply.replyId}>
            {editReplyId === reply.replyId ? (
              <div>
                <textarea
                  value={editReplyContent}
                  onChange={(e) => setEditReplyContent(e.target.value)}
                />
                <button onClick={handleUpdateReply}>저장</button>
                <button onClick={() => seteditReplyId(null)}>취소</button>
              </div>
            ) : (
              <div>
                {/* 여기서 reply.membershipType를 사용하여 실제 작성자의 등급을 표시 */}
                <p>
                  {reply.memberId} ({reply.membershipType}): {reply.content}
                </p>
                {reply.memberId === loggedInUserId && (
                  <button onClick={() => startEditReply(reply.replyId, reply.content)}>수정</button>
                )}
                {reply.memberId === loggedInUserId && (
                  <button onClick={() => handleDeleteReply(reply.replyId)}>삭제</button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      <div>
        <textarea
          value={newReplyContent}
          onChange={(e) => setnewReplyContent(e.target.value)}
          placeholder="답글을 작성하세요"
        />
        <button onClick={handleCreateReply}>작성</button>
      </div>
    </div>
  );
};

export default CommuReply;
