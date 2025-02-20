import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../../util/cookieUtil';

const EstateCommunityForm = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('부동산 매입'); // 기본값
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
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(120deg, #f0f4f7, #ffffff)',
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
                    {/* 상단 헤더: "새 게시글 작성" + 오른쪽 "등록하기" 버튼 */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <h2 style={{margin: 0}}>✏️ 새 게시글 작성</h2>
                        <button
                            type="submit"
                            style={{
                                padding: '10px 16px',
                                backgroundColor: '#007bff',
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

                    {/* 제목 아래 구분선 */}
                    <hr
                        style={{
                            border: 'none',
                            borderBottom: '1px solid #ddd',
                            margin: 0,
                        }}
                    />

                    {/* 주제(카테고리) 선택 */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                        <label style={{fontWeight: 500, color: '#555'}}>주제선정</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '1rem',
                            }}
                        >
                            <option value="부동산 매입">부동산 매입</option>
                            <option value="공동명의 의뢰">공동명의 의뢰</option>
                            <option value="최근 동향">최근 동향</option>
                            <option value="기타">기타</option>
                        </select>
                    </div>

                    {/* 제목 입력 */}
                    <div style={{display: 'flex', flexDirection: 'column'}}>
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


                    <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                        <label style={{fontWeight: 500, color: '#555'}}>이미지 업로드</label>

                        {/*
              1) 실제 input[type="file"]는 숨기고,
              2) 커스텀 버튼(label)을 클릭 시 input이 작동하도록 설정
            */}
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            {/* 파일 선택 버튼(커스텀) */}
                            <label
                                htmlFor="fileUpload"
                                style={{
                                    backgroundColor: '#007bff',
                                    color: '#fff',
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'inline-block',
                                }}
                            >
                                파일 선택
                            </label>

                            {/* 선택된 파일 이름 표시 (없으면 '선택된 파일 없음') */}
                            <span style={{fontSize: '0.9rem', color: '#333'}}>
                {image ? image.name : '선택된 파일 없음'}
              </span>
                        </div>

                        {/* 실제 파일 input (숨김) */}
                        <input
                            type="file"
                            id="fileUpload"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                    setImage(e.target.files[0]);
                                }
                            }}
                            style={{display: 'none'}}
                        />
                    </div>


                    <div style={{display: 'flex', flexDirection: 'column'}}>
            <textarea
                placeholder="내용을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                style={{
                    width: '100%',
                    height: '500px',  // 기존 200px → 300px로 높이 증가
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    resize: 'vertical',
                }}
            />
                    </div>

                    {/* 파일 업로드 (커스텀 버튼으로 스타일링) */}

                </form>
            </div>
        </div>
    );
};

export default EstateCommunityForm;
