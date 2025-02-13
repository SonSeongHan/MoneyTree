// import axios from 'axios';
//
// // Axios 인스턴스 생성 (baseURL과 withCredentials 옵션 설정)
// const axiosInstance = axios.create({
//     baseURL: 'http://localhost:8080', // 백엔드 주소에 맞게 수정
//     withCredentials: true,            // 쿠키 전송 활성화
// });
//
// // 요청 인터셉터: access token을 헤더에 추가
// // 요청 인터셉터: access token을 헤더에 추가
// axiosInstance.interceptors.request.use(
//     (config) => {
//         const accessToken = localStorage.getItem('accessToken');
//         console.log("[Request Interceptor] Access token:", accessToken);
//         if (accessToken) {
//             config.headers.Authorization = `Bearer ${accessToken}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );
//
// // 응답 인터셉터: 401 오류 발생 시 refresh 엔드포인트 호출
// axiosInstance.interceptors.response.use(
//     (response) => {
//         console.log("[Response Interceptor] 응답 성공", response);
//         return response;
//     },
//     async (error) => {
//         console.log("[Response Interceptor] 에러 발생", error.response);
//         const originalRequest = error.config;
//         if (error.response && error.response.status === 401 && !originalRequest._retry) {
//             originalRequest._retry = true;
//             try {
//                 console.log("[Response Interceptor] 401 발생 -> Refresh 엔드포인트 호출");
//                 const { data } = await axiosInstance.get('/api/auth/refresh');
//                 const newAccessToken = data.accessToken;
//                 console.log("[Response Interceptor] 새 Access token:", newAccessToken);
//                 localStorage.setItem('accessToken', newAccessToken);
//                 axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
//                 originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
//                 return axiosInstance(originalRequest);
//             } catch (refreshError) {
//                 console.log("[Response Interceptor] Refresh 실패:", refreshError);
//                 return Promise.reject(refreshError);
//             }
//         }
//         return Promise.reject(error);
//     }
// );
//
//
// export default axiosInstance;
