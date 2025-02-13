// src/api/HobbyAPI.js
import axios from "axios";
import { API_SERVER_HOST } from "./todoApi"; // API_SERVER_HOST가 정의된 파일

// Hobby API 기본 경로 설정
const host = `${API_SERVER_HOST}/api/hobbies`;

const hobbyAxios = axios.create({
    baseURL: host,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// 전체 취미 목록 조회 API
export const getAllHobbies = async () => {
    try {
        // 빈 문자열을 사용하여 baseURL 그대로 호출 (trailing slash 제거)
        const response = await hobbyAxios.get("");
        return response.data;
    } catch (error) {
        console.error("전체 취미 목록 조회 실패:", error);
        throw error;
    }
};

// 특정 ID의 취미 조회 API
export const getHobbyById = async (id) => {
    try {
        const response = await hobbyAxios.get(`/${id}`);
        return response.data;
    } catch (error) {
        console.error(`ID ${id}의 취미 조회 실패:`, error);
        throw error;
    }
};

// 카테고리별 취미 조회 API
export const getHobbiesByCategory = async (hobbyCategory) => {
    try {
        const response = await hobbyAxios.get(`/category/${hobbyCategory}`);
        return response.data;
    } catch (error) {
        console.error(`카테고리 [${hobbyCategory}] 취미 조회 실패:`, error);
        throw error;
    }
};
