// import jwtAxios from '../util/jwtUtil';
// import axios from 'axios';

//현재 주석처리는 CORS 및 토큰이 생기면 풀거나 추가 수정할 예정
//proxy를 사용함으로써 현재 사용중인 axiox코드는 바로 백엔드와 프론트를 연결함
//실제 배포시 proxy를 제거하고 배포해야함

import jwtAxios from '../util/jwtUtil';

const API_BASE_URL = 'http://localhost:8080/api/communities';
// const API_BASE_URL = 'api/communities'

//enum에서 Hobby 관련 커뮤티가 작성된것을 가져오는 api
export const fetchHobbyCommunity = async  (page = 0,size = 10) =>{
  // const response = await axios.get(`${API_BASE_URL}?postType=HOBBY&page=${page}&size=${size}`)
  const response = await jwtAxios.get(`${API_BASE_URL}?postType=HOBBY&page=${page}&size=${size}`);
  return response.data
};

//
export const fetchRealEstateCommunity = async (page =0, size =10) =>{
  // const response = await  axios.get(`api/communitites?postType=HOBBY&page=${page}&size={size}`)
  const response = await jwtAxios.get(`${API_BASE_URL}?postType=REAL_ESTATE&page=${page}&size=${size}`);
  return response.data
};

export const fetchGetCommunityById = async (postId) =>{
  // const response = await axios.get(`${API_BASE_URL}/${postId}`)
  const response = await jwtAxios.get(`${API_BASE_URL}/${postId}`)
  return response.data
};

export const fetchSaveCommunity = async (communityData, files)=>{
  console.log("보내는 communityDTO 원본 데이터:", communityData); // ✅ 원본 JSON 로그 출력

         const formData = new FormData();
         const jsonString = JSON.stringify(communityData);

         console.log("보내는 communityDTO JSON:", jsonString); // ✅ JSON 문자열 로그 출력

         formData.append("communityDTO",JSON.stringify(communityData));

         if(files && files.length > 0) {
           files.forEach(file => formData.append("files",file));
         }

  const response = await jwtAxios.post(`${API_BASE_URL}`,formData,{
    headers: {
      "Content-type": "multipart/form-data",
    },
  });
  return response.data
};

export const fetchFile = async (fileName) => {
  try {
    const response = await jwtAxios.get(`${API_BASE_URL}/files/${fileName}`,{
      responseType: 'blob', //바이너리 데이터 처릿
    });
    return URL.createObjectURL(response.data); //브라우저에서 사용할 URL 생성
  }catch (error) {
    console.error("파일을 가져오는 중에 오류 발생!:",error);
    throw error;
  }
};

export const fetchUpdateCommunity = async (postId,communityData,files) => {
  const formData = new FormData();

  formData.append("communityDTO",JSON.stringify(communityData));

  // 여러 개의 파일 추가
  if (files && files.length > 0) {
    files.forEach(file => formData.append("files", file));
  }

  const response = await jwtAxios.put(`${API_BASE_URL}/update/${postId}`,formData,{
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data
};

export const fetchDeleteCommunity = async (postId) => {
  // const response = await axios.delete(`${API_BASE_URL}/delete/${postId}`)
  const response = await jwtAxios.delete(`${API_BASE_URL}/delete/${postId}`)
  return response.data
};