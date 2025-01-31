import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EstateCommunityDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/estate-community/${id}`)
      .then((response) => {
        setPost(response.data);
        setComments(response.data.comments || []);
      })
      .catch((error) => console.error('게시글을 불러오는 중 오류 발생:', error));
  }, [id]);

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;

    axios
      .post(`http://localhost:8080/api/estate-community/${id}/comments`, { text: commentText })
      .then((response) => {
        setComments([...comments, response.data]);
        setCommentText('');
      })
      .catch((error) => console.error('댓글 작성 중 오류 발생:', error));
  };

  const handleDelete = () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      axios
        .delete(`http://localhost:8080/api/estate-community/${id}`)
        .then(() => navigate('/community/estate'))
        .catch((error) => console.error('게시글 삭제 중 오류 발생:', error));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {post ? (
        <>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          {post.imageUrl && (
            <img src={post.imageUrl} alt="게시글 이미지" style={{ width: '100%' }} />
          )}
          <div>
            <Link to={`/community/estate/edit/${id}`}>
              <button>수정</button>
            </Link>
            <button onClick={handleDelete}>삭제</button>
          </div>

          <h3>💬 댓글</h3>
          <ul>
            {comments.map((comment) => (
              <li key={comment.id}>{comment.text}</li>
            ))}
          </ul>
          <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} />
          <button onClick={handleCommentSubmit}>댓글 작성</button>
        </>
      ) : (
        <p>게시글을 찾을 수 없습니다.</p>
      )}
    </div>
  );
};

export default EstateCommunityDetail;
