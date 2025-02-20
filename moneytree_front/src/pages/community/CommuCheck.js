import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchGetCommunityById, fetchFile, fetchDeleteCommunity } from '../../api/CommunityApi';
import { getCookie } from '../../util/cookieUtil';
import CommuReply from './CommuReply';
import '../../css/hobby/HobbyCommunityDetail.css';

const HobbyCommunityDetail = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [community, setCommunity] = useState(null);
    const [imageUrls, setImageUrls] = useState([]);

    // 로그인한 사용자 정보 (쿠키에서 가져옴)
    const loggedInUser = getCookie('member');
    const loggedInUserId = loggedInUser?.memberId;

    // 게시글 데이터 불러오기
    useEffect(() => {
        const loadCommunity = async () => {
            try {
                const data = await fetchGetCommunityById(postId);
                setCommunity(data);

                // 이미지가 있을 경우, 썸네일이 's_'로 시작한다면 원본 이미지를 로드
                if (data.imageUrls && data.imageUrls.length > 0) {
                    try {
                        const originalImageUrls = await Promise.all(
                            data.imageUrls.map(async (img) => {
                                // 썸네일 's_' 제거 후 원본 파일 호출
                                return await fetchFile(img.replace('s_', ''));
                            }),
                        );
                        setImageUrls(originalImageUrls);
                    } catch (error) {
                        console.error('이미지를 불러오는 중 오류 발생:', error);
                    }
                }
            } catch (error) {
                console.error('게시글을 불러오는 데 실패했습니다:', error);
                alert('게시글을 불러오는 데 실패했습니다.');
            }
        };

        loadCommunity();
    }, [postId]);

    // 게시글 삭제
    const handleDelete = async () => {
        if (!community) return;
        if (community.memberId !== loggedInUserId) {
            alert('삭제 권한이 없습니다.');
            return;
        }
        const confirmDelete = window.confirm('정말로 해당 글을 삭제하시겠습니까?');
        if (!confirmDelete) return;

        try {
            await fetchDeleteCommunity(postId);
            alert('게시글이 삭제되었습니다.');
            navigate(-1); // 이전 페이지로 이동
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert('권한이 없습니다.');
            } else {
                console.error('게시글 삭제 중 오류 발생:', error);
                alert('게시글 삭제에 실패했습니다.');
            }
        }
    };

    // 로딩 상태
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
                        <span><strong>작성자:</strong> {community.memberId}</span>
                        {community.createdAt && (
                            <span>
              <strong>작성 시간:</strong> {new Date(community.createdAt).toLocaleString()}
            </span>
                        )}
                        {community.updatedAt && community.updatedAt !== community.createdAt && (
                            <span>
              <strong>수정 시간:</strong> {new Date(community.updatedAt).toLocaleString()}
            </span>
                        )}
                        {community.comments && (
                            <span>
              <strong>댓글 수:</strong> {community.comments.length}
            </span>
                        )}
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
                        className="btn estate-detail-list-btn" // 목록 버튼에도 원하는 스타일을 추가할 수 있습니다.
                    >
                        목록
                    </button>
                    {loggedInUserId === community.memberId && (
                        <>
                            <button
                                onClick={() => navigate(`/community/update/${postId}`)}
                                className="btn estate-detail-edit-btn" // 수정 버튼: 녹색 계열
                            >
                                수정
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn estate-detail-delete-btn" // 삭제 버튼: 빨간색 계열
                            >
                                삭제
                            </button>
                        </>
                    )}

                </div>

                {/* 댓글 영역 */}
                <div className="hobby-detail-comments">
                    <CommuReply post={postId} />
                </div>
            </div>
        </div>
    );
};

export default HobbyCommunityDetail;
