import axios  from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/community/replies';

export const fetchCommunityReply = async (postId,page = 0,size=10) => {

  const response = await axios.get(`${API_BASE_URL}/${postId}/page-replies?page=${page}&size=${size}`);
  return response.data
}

export const fetchCreateReply = async (communityRepliesDTO) => {

  const response = await axios.post(`${API_BASE_URL}`,communityRepliesDTO)
  return response.data
}

export const fetchGetReplyById = async (replyId) => {

  const response = await axios.get(`${API_BASE_URL}/${replyId}`);
  return  response.data
}

export const fetchUpdateReply = async (replyId,communityRepliesDTO) => {

  const response = await axios.put(`${API_BASE_URL}/${replyId}`,communityRepliesDTO)
  return response.data
}

export const fetchDeleteReply = async (replyId) => {

  const response = await axios.delete(`${API_BASE_URL}/${replyId}`);
  return response.data
}

