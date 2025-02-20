import React, { useState } from 'react';
import { fetchSaveCommunity } from '../../api/CommunityApi';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../../util/cookieUtil';

const CommuAdd = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]); // 이미지 파일 상태
    // 취미 커뮤니티 카테고리: 공예, 캘리그라피, 운동, 기타
    const [hobbyCategory, setHobbyCategory] = useState('공예');

    const loggedInUser = getCookie('member');
    const loggedInUserId = loggedInUser?.memberId;
    const accessToken = loggedInUser?.accessToken;
    if (!loggedInUserId) {
        console.error('유효한 로그인 유저 정보를 찾을 수 없습니다.');
        throw new Error('멤버 정보가 없습니다.');
    }

    const handleFileChange = (event) => {
        setFiles([...event.target.files]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // 취미 커뮤니티만 사용하므로 postType은 항상 'HOBBY'
        const communityData = {
            title,
            content,
            postType: 'HOBBY',
            category: hobbyCategory, // 추가된 취미 카테고리
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
                    {/* 상단 헤더: 제목과 등록 버튼 */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <h2 style={{ margin: 0 }}>✏️ 취미 커뮤니티 글 작성</h2>
                        <button
                            type="submit"
                            style={{
                                padding: '10px 16px',
                                backgroundColor: '#28a745', // 초록색 버튼
                                color: '#fff',
                                fontSize: '1rem',
                                fontWeight: 500,
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            등록하기
                        </button>
                    </div>

                    <hr
                        style={{
                            border: 'none',
                            borderBottom: '1px solid #ddd',
                            margin: 0,
                        }}
                    />

                    {/* 취미 커뮤니티 카테고리 선택 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: 500, color: '#555' }}>카테고리</label>
                        <select
                            value={hobbyCategory}
                            onChange={(e) => setHobbyCategory(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '1rem',
                            }}
                        >
                            <option value="공예">공예</option>
                            <option value="캘리그라피">캘리그라피</option>
                            <option value="운동">운동</option>
                            <option value="기타">기타</option>
                        </select>
                    </div>

                    {/* 제목 입력 */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <input
                            type="text"
                            placeholder="제목을 입력하세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
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
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
            <textarea
                placeholder="내용을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                style={{
                    width: '100%',
                    height: '500px',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    resize: 'vertical',
                }}
            />
                    </div>

                    {/* 이미지 업로드 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: 500, color: '#555' }}>이미지 업로드</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label
                                htmlFor="fileUpload"
                                style={{
                                    backgroundColor: '#28a745',
                                    color: '#fff',
                                    padding: '5px 10px',
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
                </form>
            </div>
        </div>
    );
};

export default CommuAdd;
