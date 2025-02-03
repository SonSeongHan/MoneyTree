import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EstateCommunityForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }

    // FormData 확인용 로그
    for (let key of formData.keys()) {
      console.log(key, formData.get(key));
    }

    axios
      .post('http://localhost:8080/api/estate-community', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((response) => {
        console.log('게시글 작성 성공:', response.data);
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
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          required
          style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
        />
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
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setImage(e.target.files[0]);
              console.log('파일 선택됨:', e.target.files[0]);
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
