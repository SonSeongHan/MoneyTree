import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const EstateCommunityList = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/estate-community')
      .then((response) => setPosts(response.data))
      .catch((error) => console.error('게시글을 불러오는 중 오류 발생:', error));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>🏡 부동산 커뮤니티</h2>

      {/*  게시글 작성 버튼을 더 눈에 띄게 변경 */}
      <Link to="/community/estate/new">
        <button
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '15px',
          }}
        >
          ✏️ 새 게시글 작성
        </button>
      </Link>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts.length > 0 ? (
          posts.map((post) => (
            <li
              key={post.id}
              style={{
                border: '1px solid #ddd',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '5px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <Link
                to={`/community/estate/${post.id}`}
                style={{ textDecoration: 'none', color: '#333' }}
              >
                <h3>{post.title}</h3>
              </Link>
            </li>
          ))
        ) : (
          <p>게시글이 없습니다.</p>
        )}
      </ul>
    </div>
  );
};

export default EstateCommunityList;
