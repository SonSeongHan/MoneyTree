import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    fetchCommunityReply,
    fetchCreateReply,
    fetchDeleteReply,
    fetchUpdateReply,
} from '../../api/CommuReplyApi';
import { getCookie } from '../../util/cookieUtil';
import '../../css/hobby/CommuReply.css'; // ★ 추가: CSS 파일 임포트

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

    return (
        <div className="reply-container">
            <h3 className="reply-header">💬 댓글 </h3>

            {/* 댓글 작성 영역을 먼저 배치 */}
            <div className="reply-create">
        <textarea
            value={newReplyContent}
            onChange={(e) => setnewReplyContent(e.target.value)}
            placeholder="답글을 작성하세요"
        />
                <button className="commuReply-add" onClick={handleCreateReply}>댓글 작성</button>
            </div>

            {/* 댓글 목록은 아래쪽에 렌더링 */}
            <ul className="reply-list">
                {replies.map((reply) => (
                    <li key={reply.replyId} className="reply-item">
                        {editReplyId === reply.replyId ? (
                            <div className="reply-edit-area">
                <textarea
                    value={editReplyContent}
                    onChange={(e) => setEditReplyContent(e.target.value)}
                />
                                <button onClick={handleUpdateReply} className="save-btn">
                                    저장
                                </button>
                                <button onClick={() => seteditReplyId(null)} className="cancel-btn">
                                    취소
                                </button>
                            </div>
                        ) : (
                            <div>
                                <p className="reply-meta">
                                    {reply.memberId} ({reply.membershipType})
                                </p>
                                <p className="reply-content">{reply.content}</p>
                                {reply.memberId === loggedInUserId && (
                                    <div className="reply-actions">
                                        <button className="commuReply-set" onClick={() => startEditReply(reply.replyId, reply.content)}>
                                            수정
                                        </button>
                                        <button className="commuReply-del" onClick={() => handleDeleteReply(reply.replyId)}>
                                            삭제
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CommuReply;
