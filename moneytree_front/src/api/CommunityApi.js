import jwtAxios from '../util/jwtUtil';

const API_BASE_URL = 'http://localhost:8080/api/communities';

// 취미 커뮤니티 게시글 목록 조회 (HOBBY) - 카테고리 필터와 댓글 필터 추가
export const fetchHobbyCommunity = async (
  page = 0,
  size = 10,
  category = '전체보기',
  commentFilter = '', // 댓글 필터 파라미터 추가
) => {
  const response = await jwtAxios.get(
    `${API_BASE_URL}?postType=HOBBY&page=${page}&size=${size}&category=${category}&commentFilter=${commentFilter}`, // commentFilter 전달
  );

  // response.data에는 전체 페이지 수(totalPages)와 게시글 수(totalElements)가 포함되어야 함
  return response.data;
};

// 부동산 커뮤니티 게시글 목록 조회 (REAL_ESTATE)
export const fetchRealEstateCommunity = async (page = 0, size = 10) => {
  const response = await jwtAxios.get(
    `${API_BASE_URL}?postType=REAL_ESTATE&page=${page}&size=${size}`,
  );
  return response.data;
};

// 게시글 상세 조회
export const fetchGetCommunityById = async (postId) => {
  const response = await jwtAxios.get(`${API_BASE_URL}/${postId}`);
  return response.data;
};

// 게시글 등록 (취미 커뮤니티 전용)
export const fetchSaveCommunity = async (communityData, files) => {
  console.log('보내는 communityDTO 원본 데이터:', communityData);
  const formData = new FormData();
  const jsonString = JSON.stringify(communityData);
  console.log('보내는 communityDTO JSON:', jsonString);

  // JSON 문자열 그대로 전송 (Blob 사용하지 않음)
  formData.append('communityDTO', jsonString);

  if (files && files.length > 0) {
    files.forEach((file) => formData.append('files', file));
  }

  // 디버깅: formData의 내용 확인
  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }

  const response = await jwtAxios.post(`${API_BASE_URL}`, formData, {
    headers: {
      'Content-type': 'multipart/form-data',
    },
  });
  return response.data;
};

// 파일 가져오기 (이미지 등)
export const fetchFile = async (fileName) => {
  try {
    const response = await jwtAxios.get(`${API_BASE_URL}/files/${fileName}`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error('파일을 가져오는 중에 오류 발생!:', error);
    throw error;
  }
};

// 게시글 수정
export const fetchUpdateCommunity = async (postId, communityData, files, deletedImages) => {
  console.log('수정하려는 커뮤니티 최종 데이터:', communityData);
  console.log('삭제할 이미지 리스트 (프론트에서 전달):', deletedImages);

  const formData = new FormData();
  const communityBlob = new Blob([JSON.stringify(communityData)], { type: 'application/json' });
  formData.append('CommunityDTO', communityBlob);

  if (files && files.length > 0) {
    files.forEach((file) => formData.append('files', file));
  }

  if (deletedImages && deletedImages.length > 0) {
    console.log('삭제할 이미지 JSON 변환:', JSON.stringify(deletedImages));
    const deletedImagesBlob = new Blob([JSON.stringify(deletedImages)], {
      type: 'application/json',
    });
    formData.append('deletedImages', deletedImagesBlob);
  }

  try {
    const response = await jwtAxios.put(`${API_BASE_URL}/update/${postId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('업데이트 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('업데이트 실패!:', error);
    throw error;
  }
};

// 게시글 삭제
export const fetchDeleteCommunity = async (postId) => {
  const response = await jwtAxios.delete(`${API_BASE_URL}/delete/${postId}`);
  return response.data;
};
