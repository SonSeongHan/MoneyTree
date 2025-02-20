import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../../util/cookieUtil';

const EstateCommunityForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('부동산 매입'); // 기본값 설정
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const loggedInUser = getCookie('member');
  const loggedInUserId = loggedInUser?.memberId; // 작성 시 memberId 사용

  // 로그인 체크: 폼은 항상 보이고, 제출 시 로그인 여부 확인
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loggedInUserId) {
      alert('로그인이 필요합니다.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('memberId', loggedInUserId);
    // 카테고리 값 전송
    formData.append('category', category);
    if (image) {
      formData.append('image', image);
    }

    axios
      .post('http://localhost:8080/api/estate-community', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(() => {
        navigate('/community/real-estate');
      })
      .catch((error) => console.error('게시글 작성 중 오류 발생:', error));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>✏️ 새 게시글 작성</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            required
            style={{ padding: '10px', flexGrow: 1, border: '1px solid #ddd', borderRadius: '5px' }}
          />
          {/* 카테고리 선택 드롭다운 */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          >
            <option value="부동산 매입">부동산 매입</option>
            <option value="공동명의 의뢰">공동명의 의뢰</option>
            <option value="최근 동향">최근 동향</option>
            <option value="기타">기타</option>
          </select>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          required
          style={{
            padding: '10px',
            height: '100px',
            border: '1px solid #ddd',
            borderRadius: '5px',
          }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setImage(e.target.files[0]);
            }
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          게시글 작성
        </button>
      </form>
    </div>
  );
};

export default EstateCommunityForm;
