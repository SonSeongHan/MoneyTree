import React, { useState, useEffect } from 'react';
import { fetchGetCommunityById, fetchFile, fetchDeleteCommunity } from '../../api/CommunityApi';
import CommuReply from './CommuReply';
import { useParams, useNavigate } from 'react-router-dom';
import { getCookie } from '../../util/cookieUtil';
import '../../css/hobby/HobbyCommunityDetail.css';

const CommuCheck = () => {
    const { postId } = useParams();
    const [community, setCommunity] = useState(null);
    const [imageUrls, setImageUrls] = useState([]);
    const [totalComments, setTotalComments] = useState(0); // 댓글 수 상태 추가
    const navigate = useNavigate();

    // 로그인한 사용자 정보는 인증용으로만 사용 (권한 검사 등)
    const loggedInUser = getCookie('member');
    const loggedInUserId = loggedInUser?.memberId;

    // 날짜 포맷 처리 함수
    const formatDate = (date) => {
        const parsedDate = new Date(date);
        return parsedDate instanceof Date && !isNaN(parsedDate) ? parsedDate.toLocaleString() : 'N/A';
    };

    // 댓글 작성 후 댓글 수 즉시 갱신
    const updateCommentCount = (newCommentCount) => {
        setTotalComments(newCommentCount); // 댓글 수 업데이트
    };

    // 게시글 및 댓글 불러오기
    useEffect(() => {
        const loadCommunity = async () => {
            try {
                const data = await fetchGetCommunityById(postId);
                setCommunity(data);

                // 댓글 수 업데이트
                setTotalComments(data.commentCount || 0);

                if (data.imageUrls && data.imageUrls.length > 0) {
                    try {
                        const originalImageUrls = await Promise.all(
                          data.imageUrls.map(async (img) => {
                              return await fetchFile(img.replace('s_', ''));
                          }),
                        );
                        setImageUrls(originalImageUrls);
                    } catch (error) {
                        console.error('이미지를 불러오는 중 오류 발생:', error);
                    }
                }
            } catch (error) {
                console.error('글을 불러오는 데 실패했습니다:', error);
                alert('글을 불러오는 데 실패했습니다.');
            }
        };

        loadCommunity();
    }, [postId]);

    const handleDelete = async () => {
        const confirmDelete = window.confirm('정말로 해당 글을 삭제하시겠습니까?');
        if (!confirmDelete) return;

        try {
            // 삭제 전에 백엔드에서 권한 검증을 하고 있다면 이 부분은 필요 없을 수 있음.
            if (community.memberId !== loggedInUserId) {
                alert('삭제 권한이 없습니다.');
                return;
            }

            await fetchDeleteCommunity(postId);
            alert('게시글이 삭제되었습니다.');
            navigate(-1);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert('권한이 없습니다.');
            } else {
                console.error('게시글 삭제 중 오류 발생:', error);
                alert('게시글 삭제에 실패했습니다.');
            }
        }
    };

    if (!community) {
        return <p className="hobby-loading">로딩 중...</p>;
    }

    return (
      <div className="commuall-bg">
          <div className="hobby-detail-container">
              {/* 게시글 상단 영역: 제목 / 작성자 / 작성일 등 */}
              <div className="hobby-detail-header">
                  <h2 className="hobby-detail-title">{community.title}</h2>
                  <div className="hobby-detail-meta">
                      <span><strong>작성자:</strong> {community.memberId} ({community.membershipType})</span>
                      {community.createdAt && (
                        <span>
                                <strong>작성 시간:</strong> {formatDate(community.createdAt)}
                            </span>
                      )}
                      {community.updatedAt && community.updatedAt !== community.createdAt && (
                        <span>
                                <strong>수정 시간:</strong> {formatDate(community.updatedAt)}
                            </span>
                      )}
                      <span>
                            <strong>댓글 수:</strong> {totalComments}
                        </span>
                  </div>
              </div>

              {/* 게시글 본문 */}
              <div className="hobby-detail-content">
                  <p>{community.content}</p>
                  {/* 이미지 섹션 */}
                  {imageUrls.length > 0 && (
                    <div className="hobby-detail-images">
                        {imageUrls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`community-${index}`}
                          />
                        ))}
                    </div>
                  )}
              </div>

              {/* 하단 버튼들 */}
              <div className="hobby-detail-buttons">
                  <button
                    onClick={() =>
                      community.postType
                        ? navigate(`/community/${community.postType.toLowerCase()}`)
                        : navigate(-1)
                    }
                    className="btn estate-detail-list-btn"
                  >
                      목록
                  </button>
                  {loggedInUserId === community.memberId && (
                    <>
                        <button
                          onClick={() => navigate(`/community/update/${postId}`)}
                          className="btn estate-detail-edit-btn"
                        >
                            수정
                        </button>
                        <button
                          onClick={handleDelete}
                          className="btn estate-detail-delete-btn"
                        >
                            삭제
                        </button>
                    </>
                  )}
              </div>

              {/* 댓글 영역 */}
              <div className="hobby-detail-comments">
                  <CommuReply postId={postId} updateCommentCount={updateCommentCount} />
              </div>
          </div>
      </div>
    );
};

export default CommuCheck;