import axios from 'axios';

//현재 주석처리는 CORS 및 토큰이 생기면 풀거나 추가 수정할 예정
//proxy를 사용함으로써 현재 사용중인 axiox코드는 바로 백엔드와 프론트를 연결함
//실제 배포시 proxy를 제거하고 배포해야함

// const API_BASE_URL = 'http://localhost:8080/api/communities';

//enum에서 Hobby 관련 커뮤티가 작성된것을 가져오는 api
export const fetchHobbyCommunity = async  (page = 0,size = 10) =>{
  // const response = await axios.get(`${API_BASE_URL}?postType=HOBBY&page=${page}&size=${size}`)
  const response = await  axios.get(`api/communitites?postType=HOBBY&page=${page}&size=${size}`)
  return response.data
}

//
export const fetchRealEstateCommunity = async (page =0, size =10) =>{
  // const response = await  axios.get(`api/communitites?postType=HOBBY&page=${page}&size={size}`)
  const response = await  axios.get(`api/communitites?postType=REAL_ESTATE&page=${page}&size=${size}`)
  return response.data
}

export const fetchGetCommunityById = async (postId) =>{
  // const response = await axios.get(`${API_BASE_URL}/${postId}`)
  const response = await axios.get(`api/communities/${postId}`)
  return response.data
}

export const fetchSaveCommunity = async (communityDTO)=>{
  // const response = await axios.post(`${API_BASE_URL}`,communityDTO)
  const response = await axios.post(`api/communities/`,communityDTO)
  return response.data
}

export const fetchUpdateCommunity = async (postId,communityDTO) => {
  // const response = await axios.put(`${API_BASE_URL}/update/${postId}`, communityDTO)
  const response = await axios.post(`api/communities/update/${postId}`,communityDTO)
  return response.data
}

export const fetchDeleteCommunity = async (postId) => {
  // const response = await axios.delete(`${API_BASE_URL}/delete/${postId}`)
  const response = await axios.delete(`api/communities/delete/${postId}`)
  return response.data
}