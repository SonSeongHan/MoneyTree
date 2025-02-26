import React, { useState } from 'react';
import { fetchSaveCommunity } from '../../api/CommunityApi';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../../util/cookieUtil';
import '../../css/hobby/CommuAdd.css';

const CommuAdd = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]); // 이미지 파일 상태
  const [category, setCategory] = useState('공예'); // 취미 카테고리
  const navigate = useNavigate();

  const loggedInUser = getCookie('member');
  const loggedInUserId = loggedInUser?.memberId;
  const accessToken = loggedInUser?.accessToken;

  if (!loggedInUserId) {
    console.error('유효한 로그인 유저 정보를 찾을 수 없습니다.');
    throw new Error('멤버 정보가 없습니다.');
  }

  // 이미지 파일 처리
  const handleFileChange = (event) => {
    setFiles([...event.target.files]);
  };

  // 게시글 제출 처리
  const handleSubmit = async (event) => {
    event.preventDefault();

    // 취미 커뮤니티로 고정
    const communityData = {
      title,
      content,
      postType: 'HOBBY', // "HOBBY"로 고정
      category, // 선택한 카테고리 추가
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
  };

  return (
    <div>
      <h1>취미 커뮤니티 글 작성</h1>
      <form onSubmit={handleSubmit}>
        {/* 제목 입력 */}
        <div>
          <label>제목:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        {/* 내용 입력 */}
        <div>
          <label>내용:</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required />
        </div>

        {/* 취미 커뮤니티 카테고리 선택 */}
        <div>
          <label>취미 카테고리:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="공예">공예</option>
            <option value="캘리그라피">캘리그라피</option>
            <option value="운동">운동</option>
            <option value="기타">기타</option>
          </select>
        </div>

        {/* 이미지 업로드 */}
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
