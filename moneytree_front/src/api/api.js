import jwtAxios from '../util/jwtUtil';

const BASE_URL = 'http://localhost:8080/api/qna';

const answerApi = {
  // 특정 문의의 답변 목록 조회
  getAnswersByInquiryId: async (inquiryId) => {
    try {
      const response = await jwtAxios.get(
        `${BASE_URL}/inquiries/${inquiryId}/answers`
      );
      return response.data; // 답변 목록 반환
    } catch (error) {
      console.error('답변 목록 조회 실패:', error);
      throw error;
    }
  },

  // 특정 답변 조회
  getAnswerById: async (answerId) => {
    try {
      const response = await jwtAxios.get(`${BASE_URL}/answers/${answerId}`);
      return response.data; // 특정 답변 반환
    } catch (error) {
      console.error('답변 조회 실패:', error);
      throw error;
    }
  },

  // 답변 등록
  addAnswer: async (inquiryId, content) => {
    try {
      const response = await jwtAxios.post(`${BASE_URL}/answers/${inquiryId}`, {
        content, // 내용만 전달
      });
      return response.data; // 추가된 답변 반환
    } catch (error) {
      console.error('답변 추가 실패:', error);
      throw error;
    }
  },

  // 답변 수정
  updateAnswer: async (answerId, updatedContent) => {
    try {
      const response = await jwtAxios.put(`${BASE_URL}/answers/${answerId}`, {
        content: updatedContent, // 수정된 내용 전달
      });
      return response.data; // 수정된 답변 반환
    } catch (error) {
      console.error('답변 수정 실패:', error);
      throw error;
    }
  },

  // 답변 삭제
  deleteAnswer: async (answerId) => {
    try {
      const response = await jwtAxios.delete(`${BASE_URL}/answers/${answerId}`);
      return response.data; // 삭제 결과 반환
    } catch (error) {
      console.error('답변 삭제 실패:', error);
      throw error;
    }
  },
};

export default answerApi;
