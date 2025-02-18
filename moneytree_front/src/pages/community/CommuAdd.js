import React, { useState } from 'react';
import axios from 'axios';
import { fetchSaveCommunity } from '../../api/CommunityApi';
import { useNavigate, useParams } from 'react-router-dom';
import { getCookie } from '../../util/cookieUtil';

const CommuAdd = () => {
  const { type } = useParams();
  // 드롭다운 선택 값은 "hobby" 또는 "real-estate" (소문자, 하이픈 사용)
  const [postType, setPostType] = useState(type ? type.toLowerCase() : 'hobby');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]); // 이미지 파일 상태
  const navigate = useNavigate();

  const loggedInUser = getCookie('member');
  const loggedInUserId = loggedInUser?.memberId;
  const accessToken = loggedInUser?.accessToken;
  if (!loggedInUserId) {
    console.error('유효한 로그인 유저 정보를 찾을 수 없습니다.');
    throw new Error('멤버 정보가 없습니다.');
  }

  // 부동산 커뮤니티 선택 시 사용할 카테고리 state (기본값 "부동산 매입")
  const [realEstateCategory, setRealEstateCategory] = useState('부동산 매입');

  const handleFileChange = (event) => {
    setFiles([...event.target.files]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // postType 정규화: "real-estate"는 "REAL_ESTATE", 그 외는 "HOBBY"
    const normalizedPostType = postType === 'real-estate' ? 'REAL_ESTATE' : 'HOBBY';

    if (normalizedPostType === 'REAL_ESTATE') {
      // 부동산 커뮤니티의 경우: EstateCommunityForm과 동일한 방식으로 처리하며,
      // 추가로 사용자가 선택한 부동산 카테고리를 전송합니다.
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('memberId', loggedInUserId);
      // 선택한 부동산 카테고리 전송
      formData.append('category', realEstateCategory);
      if (files && files.length > 0) {
        files.forEach((file) => formData.append('image', file));
      }

      try {
        const response = await axios.post('http://localhost:8080/api/estate-community', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log('응답 데이터:', response.data);
        alert('게시글이 성공적으로 등록되었습니다.');
        navigate('/community/real-estate');
      } catch (error) {
        console.error('게시글 등록 실패:', error);
        alert('게시글 등록 중 문제가 발생했습니다.');
      }
    } else {
      // 취미 커뮤니티의 경우: 기존 API 함수를 사용합니다.
      const communityData = {
        title,
        content,
        postType: normalizedPostType, // "HOBBY"
        memberId: loggedInUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        const response = await fetchSaveCommunity(communityData, files);
        console.log('응답 데이터:', response);
        alert('게시글이 성공적으로 등록되었습니다.');
        navigate('/community/hobby');
      } catch (error) {
        console.error('게시글 등록 실패:', error);
        alert('게시글 등록 중 문제가 발생했습니다.');
      }
    }
  };

  return (
    <div>
      <h1>커뮤니티 글 작성</h1>
      <form onSubmit={handleSubmit}>
        {/* 커뮤니티 유형 선택 */}
        <div>
          <label>커뮤니티 유형:</label>
          <select value={postType} onChange={(e) => setPostType(e.target.value)}>
            <option value="hobby">취미 커뮤니티</option>
            <option value="real-estate">부동산 커뮤니티</option>
          </select>
        </div>

        {/* 부동산 커뮤니티를 선택한 경우, 추가로 부동산 카테고리 선택 드롭다운 노출 */}
        {postType === 'real-estate' && (
          <div>
            <label>부동산 카테고리:</label>
            <select
              value={realEstateCategory}
              onChange={(e) => setRealEstateCategory(e.target.value)}
            >
              <option value="부동산 매입">부동산 매입</option>
              <option value="공동명의 의뢰">공동명의 의뢰</option>
              <option value="최근 동향">최근 동향</option>
              <option value="기타">기타</option>
            </select>
          </div>
        )}

        <div>
          <label>제목:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>내용:</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required />
        </div>
        <div>
          <label>이미지 업로드:</label>
          <input type="file" accept="image/*" multiple onChange={handleFileChange} />
        </div>
        <button type="submit">등록하기</button>
      </form>
    </div>
  );
};

export default CommuAdd;
