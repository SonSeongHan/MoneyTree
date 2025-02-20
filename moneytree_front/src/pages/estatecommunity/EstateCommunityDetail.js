import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/estate/EstateCommunityDetail.css';
import EstateCommunityComment from '../../pages/estatecommunity/EstateCommunityComment';
import { getCookie } from '../../util/cookieUtil';

const EstateCommunityDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedFile, setEditedFile] = useState(null);
  const navigate = useNavigate();

  const loggedInUser = getCookie('member');
  const loggedInUserId = loggedInUser?.memberId;

  // 댓글 수를 바로 업데이트하기 위해, 댓글이 변경될 때 호출할 콜백 함수
  const updateCommentCount = (newCount) => {
    setPost((prevPost) => {
      if (prevPost) {
        return { ...prevPost, comments: Array(newCount).fill(null) };
      }
      return prevPost;
    });
  };

  const fetchPostDetail = () => {
    axios
        .get(`http://localhost:8080/api/estate-community/${id}`)
        .then((response) => {
          setPost(response.data);
        })
        .catch((error) => console.error('게시글을 불러오는 중 오류 발생:', error));
  };

  useEffect(() => {
    fetchPostDetail();
  }, [id]);

  const handleEditPost = () => {
    if (!loggedInUserId || String(post.author) !== String(loggedInUserId)) {
      alert('수정 권한이 없습니다.');
      return;
    }
    setEditedTitle(post.title);
    setEditedContent(post.content);
    setEditMode(true);
  };

  const handleSavePost = () => {
    if (editedFile) {
      const formData = new FormData();
      formData.append('title', editedTitle);
      formData.append('content', editedContent);
      formData.append('image', editedFile);

      axios
          .put(`http://localhost:8080/api/estate-community/${id}/with-file`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          .then((response) => {
            setPost(response.data);
            setEditMode(false);
            setEditedFile(null);
          })
          .catch((error) => console.error('게시글 수정(파일 포함) 중 오류 발생:', error));
    } else {
      const updatedPostData = {
        title: editedTitle,
        content: editedContent,
      };
      axios
          .put(`http://localhost:8080/api/estate-community/${id}`, updatedPostData, {
            headers: { 'Content-Type': 'application/json' },
          })
          .then((response) => {
            setPost(response.data);
            setEditMode(false);
          })
          .catch((error) => console.error('게시글 수정 중 오류 발생:', error));
    }
  };

  const handleDeletePost = () => {
    if (!loggedInUserId || String(post.author) !== String(loggedInUserId)) {
      alert('삭제 권한이 없습니다.');
      return;
    }
    if (window.confirm('정말 게시글을 삭제하시겠습니까?')) {
      axios
          .delete(`http://localhost:8080/api/estate-community/${id}`)
          .then(() => navigate('/community/real-estate'))
          .catch((error) => console.error('게시글 삭제 중 오류 발생:', error));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setEditedFile(e.target.files[0]);
    }
  };

  return (
      // 그라데이션 배경
      <div className="estate-detail-bg">
        {/* 상세 컨테이너 (흰색 박스) */}
        <div className="estate-detail-container">
          {post ? (
              <>
                {/* 편집 모드 */}
                {editMode ? (
                    <div className="estate-detail-edit-post-form">
                      <input
                          type="text"
                          className="estate-detail-edit-title"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                      />
                      <textarea
                          className="estate-detail-edit-content"
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                      />
                      <input type="file" onChange={handleFileChange} />
                      <div className="estate-detail-edit-buttons">
                        <button
                            className="estate-detail-btn estate-detail-save-btn"
                            onClick={handleSavePost}
                        >
                          저장
                        </button>
                        <button
                            className="estate-detail-btn estate-detail-cancel-btn"
                            onClick={() => {
                              setEditMode(false);
                              setEditedFile(null);
                            }}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                ) : (
                    <>
                      {/* 일반 모드 */}
                      <div className="estate-detail-header">
                        <div className="estate-detail-header-left">
                          <span className="estate-detail-post-category">{post.category}</span>
                          <h2 className="estate-detail-post-title">{post.title}</h2>
                        </div>
                        <div className="estate-detail-header-right">
                          <p className="estate-detail-meta-line">
                            <strong>작성자:</strong> {post.author}
                          </p>
                          <p className="estate-detail-meta-line">
                            <strong>작성 시간:</strong>{' '}
                            {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'N/A'}
                          </p>
                          {post.updatedAt && post.updatedAt !== post.createdAt && (
                              <p className="estate-detail-meta-line">
                                <strong>수정 시간:</strong>{' '}
                                {new Date(post.updatedAt).toLocaleString()}
                              </p>
                          )}
                          <p className="estate-detail-meta-line">
                            <strong>댓글 수:</strong> {post.comments ? post.comments.length : 0}
                          </p>
                        </div>
                      </div>

                      <p className="estate-detail-post-content">{post.content}</p>

                      {post.imageUrl && (
                          <div className="estate-detail-image-section">
                            <img
                                className="estate-detail-post-image"
                                src={post.imageUrl}
                                alt="게시글 이미지"
                            />
                            <p className="estate-detail-image-file-name">
                              파일 이름: {post.imageFileName}{' '}
                              <a href={post.imageUrl} download={post.imageFileName}>
                                다운로드
                              </a>
                            </p>
                          </div>
                      )}

                      {/* 버튼 영역: 오른쪽 정렬 */}
                      <div className="estate-detail-post-buttons">
                        {loggedInUserId && String(post.author) === String(loggedInUserId) && (
                            <>
                              <button
                                  className="estate-detail-btn estate-detail-edit-btn"
                                  onClick={handleEditPost}
                              >
                                수정
                              </button>
                              <button
                                  className="estate-detail-btn estate-detail-delete-btn"
                                  onClick={handleDeletePost}
                              >
                                삭제
                              </button>
                            </>
                        )}
                      </div>
                    </>
                )}

                {/* 댓글 컴포넌트 (게시글 상세 하단) */}
                <EstateCommunityComment postId={id} onCommentChange={fetchPostDetail} />
              </>
          ) : (
              <p>게시글을 찾을 수 없습니다.</p>
          )}
        </div>
      </div>
  );
};

export default EstateCommunityDetail;
