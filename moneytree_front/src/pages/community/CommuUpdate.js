import React, { useState, useEffect } from 'react';
import { fetchGetCommunityById, fetchUpdateCommunity, fetchFile } from '../../api/CommunityApi';
import { useParams, useNavigate } from 'react-router-dom';
import { getCookie } from '../../util/cookieUtil';
import '../../css/hobby/commuupdate.css';

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
            navigate(`/community/check/${postData.postId}`); // 수정 후 해당 게시글로 이동
        } catch (error) {
            console.error('글 수정 중 오류 발생:', error);
            alert('글 수정 중 오류가 발생했습니다.');
        }
    };

    const handleGoBack = () => {
        // 뒤로가기 버튼 클릭 시 기본 페이지로 이동
        navigate('/community/hobby?page=0&category=전체보기&commentFilter='); // 기본 페이지로 이동
    };

    if (!postData) {
        return (
          <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(120deg, #d4edda, #ffffff)',
                padding: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
          >
              <p style={{ fontSize: '18px', color: '#333' }}>로딩 중...</p>
          </div>
        );
    }

    return (
      <div
        style={{
            minHeight: '100vh',
            background: 'linear-gradient(120deg, #d4edda, #ffffff)', // 초록빛 그라데이션 배경
            padding: '20px',
            boxSizing: 'border-box',
        }}
      >
          <div
            style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '20px',
                boxSizing: 'border-box',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            }}
          >
              <form
                onSubmit={handleSubmit}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                }}
              >
                  {/* 상단 헤더: 제목과 버튼들 */}
                  <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                  >
                      <h2 style={{ margin: 0 }}>✏️ 취미 커뮤니티 글 수정</h2>
                      <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            type="button"
                            onClick={handleGoBack}
                            style={{
                                padding: '10px 16px',
                                backgroundColor: '#6c757d',
                                color: '#fff',
                                fontSize: '1rem',
                                fontWeight: 500,
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                          >
                              취소하기
                          </button>
                          <button
                            type="submit"
                            style={{
                                padding: '10px 16px',
                                backgroundColor: '#28a745',
                                color: '#fff',
                                fontSize: '1rem',
                                fontWeight: 500,
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                          >
                              수정하기
                          </button>
                      </div>
                  </div>

                  <hr
                    style={{
                        border: 'none',
                        borderBottom: '1px solid #ddd',
                        margin: 0,
                    }}
                  />

                  {/* 제목 입력 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontWeight: 500, color: '#555' }}>제목</label>
                      <input
                        type="text"
                        placeholder="제목을 입력하세요"
                        value={postData.title}
                        onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '1.1rem',
                        }}
                      />
                  </div>

                  {/* 내용 입력 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontWeight: 500, color: '#555' }}>내용</label>
                      <textarea
                        placeholder="내용을 입력하세요"
                        value={postData.content}
                        onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                        required
                        style={{
                            width: '100%',
                            height: '300px',
                            padding: '12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            resize: 'vertical',
                        }}
                      />
                  </div>

                  {/* 기존 이미지 표시 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontWeight: 500, color: '#555' }}>기존 이미지</label>
                      <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '15px',
                          padding: '15px',
                          border: '1px dashed #ccc',
                          borderRadius: '4px',
                          backgroundColor: '#fafafa'
                      }}>
                          {imageUrls.length > 0 ? (
                            imageUrls.map((img, index) => (
                              <div
                                key={index}
                                style={{
                                    position: 'relative',
                                    width: '150px',
                                    height: '150px',
                                    overflow: 'hidden',
                                    borderRadius: '4px',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                                }}
                              >
                                  <img
                                    src={img.url}
                                    alt="게시글 이미지"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteImage(img.fileName)}
                                    style={{
                                        position: 'absolute',
                                        top: '5px',
                                        right: '5px',
                                        width: '25px',
                                        height: '25px',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(220, 53, 69, 0.8)',
                                        color: 'white',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}
                                  >
                                      ×
                                  </button>
                              </div>
                            ))
                          ) : (
                            <p style={{ color: '#666', margin: '10px 0' }}>이미지가 없습니다.</p>
                          )}
                      </div>
                  </div>

                  {/* 새 이미지 업로드 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontWeight: 500, color: '#555' }}>새 이미지 업로드</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <label
                            htmlFor="fileUpload"
                            style={{
                                backgroundColor: '#28a745',
                                color: '#fff',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'inline-block',
                            }}
                          >
                              파일 선택
                          </label>
                          <span style={{ fontSize: '0.9rem', color: '#333' }}>
                                {files.length > 0 ? files.map((file) => file.name).join(', ') : '선택된 파일 없음'}
                            </span>
                      </div>
                      <input
                        type="file"
                        id="fileUpload"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                  </div>

                  {/* 모바일에서는 하단에 버튼 추가 */}
                  <div
                    style={{
                        display: 'none',
                        marginTop: '20px',
                        gap: '10px',
                        flexDirection: 'column'
                    }}
                    className="mobile-buttons"
                  >
                      <button
                        type="submit"
                        style={{
                            padding: '12px 16px',
                            backgroundColor: '#28a745',
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: 500,
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                      >
                          수정하기
                      </button>
                      <button
                        type="button"
                        onClick={handleGoBack}
                        style={{
                            padding: '12px 16px',
                            backgroundColor: '#6c757d',
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: 500,
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                      >
                          취소하기
                      </button>
                  </div>
              </form>
          </div>
      </div>
    );
};

export default CommuUpdate;