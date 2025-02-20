// CommuUpdate.js
import React, { useState, useEffect } from 'react';
import { fetchGetCommunityById, fetchUpdateCommunity, fetchFile } from '../../api/CommunityApi';
import { useParams, useNavigate } from 'react-router-dom';
import { getCookie } from '../../util/cookieUtil';

const CommuUpdate = () => {
  const { postId } = useParams();
  const [postData, setPostData] = useState(null);
  const [files, setFiles] = useState([]); // 새 파일들
  const [imageUrls, setImageUrls] = useState([]); // 기존 이미지 URL들
  const [deletedImages, setDeletedImages] = useState([]); // 삭제할 이미지 목록
  const navigate = useNavigate();

  const loggedInUser = getCookie('member');
  const loggedInUserId = loggedInUser?.memberId;
  if (!loggedInUserId) {
    console.error('로그인 정보가 없습니다.');
    throw new Error('멤버 정보가 없습니다.');
  }

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await fetchGetCommunityById(postId);
        setPostData(data);

        if (data.imageUrls && data.imageUrls.length > 0) {
          const imageUrlsFetched = await Promise.all(
            data.imageUrls.map(async (fileName) => {
              try {
                return { fileName, url: await fetchFile(fileName) };
              } catch (error) {
                console.error('이미지 로드 실패:', error);
                return null;
              }
            }),
          );
          setImageUrls(imageUrlsFetched.filter((img) => img !== null));
        }
      } catch (error) {
        console.error('글 로드 실패:', error);
        alert('글을 불러오는 데 실패했습니다.');
      }
    };

    fetchPost();
  }, [postId]);

  const handleFileChange = (event) => {
    setFiles([...event.target.files]);
  };

  const handleDeleteImage = (fileName) => {
    setDeletedImages([...deletedImages, fileName]);
    setImageUrls(imageUrls.filter((img) => img.fileName !== fileName));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const communityData = {
      postId: postData.postId,
      memberId: postData.memberId,
      postType: postData.postType,
      title: postData.title,
      content: postData.content,
      createdAt: postData.createdAt,
      updatedAt: new Date().toISOString(),
      deletedImages: deletedImages,
    };

    console.log('보내는 communityDTO:', communityData);

    try {
      const data = await fetchUpdateCommunity(postId, communityData, files, deletedImages);
      console.log('업데이트 응답 데이터:', data);
      alert('글이 성공적으로 수정되었습니다.');
      navigate(`/community/check/${postData.postId}`);
    } catch (error) {
      console.error('글 수정 중 오류 발생:', error);
      alert('글 수정 중 오류가 발생했습니다.');
    }
  };

  if (!postData) {
    return <p>로딩 중...</p>;
  }

  return (
    <div>
      <h1>글 수정 (취미)</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>제목:</label>
          <input
            type="text"
            value={postData.title}
            onChange={(e) => setPostData({ ...postData, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label>내용:</label>
          <textarea
            value={postData.content}
            onChange={(e) => setPostData({ ...postData, content: e.target.value })}
            required
          />
        </div>
        <div>
          <label>기존 이미지:</label>
          <div>
            {imageUrls.length > 0 ? (
              imageUrls.map((img, index) => (
                <div key={index} style={{ display: 'inline-block', marginRight: '10px' }}>
                  <img src={img.url} alt="게시글 이미지" width="100" />
                  <button type="button" onClick={() => handleDeleteImage(img.fileName)}>
                    X
                  </button>
                </div>
              ))
            ) : (
              <p>이미지가 없습니다.</p>
            )}
          </div>
        </div>
        <div>
          <label>새로운 이미지:</label>
          <input type="file" accept="image/*" multiple onChange={handleFileChange} />
        </div>
        <button type="submit">수정</button>
      </form>
      <button onClick={() => navigate(-1)}>뒤로 가기</button>
    </div>
  );
};

export default CommuUpdate;
