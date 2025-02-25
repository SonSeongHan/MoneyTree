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
  console.log("보내는 communityDTO 원본 데이터:", communityData); // 원본 JSON 로그 출력

  const formData = new FormData();
  const jsonString = JSON.stringify(communityData);

  console.log("보내는 communityDTO JSON:", jsonString); // JSON 문자열 로그 출력

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

export const fetchUpdateCommunity = async (postId, communityData, files, deletedImages) => {
  console.log("수정하려는 커뮤니티 최종 데이터:", communityData);
  console.log("삭제할 이미지 리스트 (프론트에서 전달):", deletedImages);

  const formData = new FormData();

  //  JSON 데이터를 Blob으로 변환해서 FormData에 추가
  const communityBlob = new Blob([JSON.stringify(communityData)], { type: "application/json" });
  formData.append("CommunityDTO", communityBlob); //  대소문자 정확히 일치시켜야 함

  //  파일 추가
  if (files && files.length > 0) {
    files.forEach((file) => formData.append("files", file));
  }

  //  삭제할 이미지 추가
  if (deletedImages && deletedImages.length > 0) {
    console.log("삭제할 이미지 JSON 변환:", JSON.stringify(deletedImages));
    const deletedImagesBlob = new Blob([JSON.stringify(deletedImages)],{type: "application/json"});
    formData.append("deletedImages",deletedImagesBlob);
  }

  console.log("FormData 확인:",formData);

  try {
    const response = await jwtAxios.put(`${API_BASE_URL}/update/${postId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("업데이트 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("업데이트 실패!:", error);
    throw error;
  }
};

export const fetchDeleteCommunity = async (postId) => {
  // const response = await axios.delete(`${API_BASE_URL}/delete/${postId}`)
  const response = await jwtAxios.delete(`${API_BASE_URL}/delete/${postId}`)
  return response.data
};