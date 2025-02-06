import jwtAxios from '../util/jwtUtil';

const API_BASE_URL = 'http://localhost:8080/api/community/replies';

export const fetchCommunityReply = async (postId,page = 0,size=10) => {

  const response = await jwtAxios.get(`${API_BASE_URL}/${postId}/page-replies?page=${page}&size=${size}`);
  return response.data
}

export const fetchCreateReply = async (communityRepliesDTO) => {

  console.log("communityRepliesDTO의 정보들:",communityRepliesDTO)
  try {
    const response = await jwtAxios.post(`${API_BASE_URL}`, communityRepliesDTO, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("변환된 response data:", response.data);
    return response.data
  }catch(error) {
    console.error("답글 생성 요청 중 오류 발생:",error.response ? error.response.data : error);
    throw error;
  }
}

export const fetchGetReplyById = async (replyId) => {

  const response = await jwtAxios.get(`${API_BASE_URL}/${replyId}`);
  return  response.data
}

export const fetchUpdateReply = async (replyId,communityRepliesDTO) => {

  const response = await jwtAxios.put(`${API_BASE_URL}/${replyId}`,communityRepliesDTO)
  return response.data
}

export const fetchDeleteReply = async (replyId) => {

  const response = await jwtAxios.delete(`${API_BASE_URL}/${replyId}`);
  return response.data
}

