import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/estate/EstateCommunityDetail.css';
import EstateCommunityComment from '../../pages/estatecommunity/EstateCommunityComment.js'; // 위에서 생성한 CommentList 컴포넌트 import

const EstateCommunityDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/estate-community/${id}`)
      .then((response) => {
        setPost(response.data);
      })
      .catch((error) => console.error('게시글을 불러오는 중 오류 발생:', error));
  }, [id]);

  const handleEditPost = () => {
    if (post) {
      setEditedTitle(post.title);
      setEditedContent(post.content);
      setEditMode(true);
    }
  };

  const handleSavePost = () => {
    const updatedPostData = {
      title: editedTitle,
      content: editedContent,
      author: post.author,
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
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const handleDeletePost = () => {
    if (window.confirm('정말 게시글을 삭제하시겠습니까?')) {
      axios
        .delete(`http://localhost:8080/api/estate-community/${id}`)
        .then(() => navigate('/community/real-estate'))
        .catch((error) => console.error('게시글 삭제 중 오류 발생:', error));
    }
  };

  return (
    <div className="detail-container">
      {post ? (
        <>
          {editMode ? (
            <div className="edit-post-form">
              <input
                type="text"
                className="edit-title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
              <textarea
                className="edit-content"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              />
              <div className="edit-buttons">
                <button className="btn save-btn" onClick={handleSavePost}>
                  저장
                </button>
                <button className="btn cancel-btn" onClick={handleCancelEdit}>
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="post-title">{post.title}</h2>
              <p className="post-content">{post.content}</p>
              {post.imageUrl && (
                <div>
                  <img className="post-image" src={post.imageUrl} alt="게시글 이미지" />
                  <p className="image-file-name">
                    파일 이름: {post.imageFileName}{' '}
                    <a href={post.imageUrl} download={post.imageFileName}>
                      다운로드
                    </a>
                  </p>
                </div>
              )}
              <p className="post-meta">
                <strong>작성 시간:</strong>{' '}
                {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'N/A'}
              </p>
              <div className="post-buttons">
                <button className="btn edit-btn" onClick={handleEditPost}>
                  수정
                </button>
                <button className="btn delete-btn" onClick={handleDeletePost}>
                  삭제
                </button>
              </div>
            </>
          )}

          {/* 댓글 페이지네이션 컴포넌트 추가 */}
          <EstateCommunityComment postId={id} />
        </>
      ) : (
        <p>게시글을 찾을 수 없습니다.</p>
      )}
    </div>
  );
};

export default EstateCommunityDetail;
