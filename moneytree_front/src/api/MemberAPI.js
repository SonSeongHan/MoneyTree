import axios from "axios";

const BASE_URL = "http://localhost:8080/api/members";

export const login = async (loginData) => {
  return axios.post(`${BASE_URL}/login`, loginData);
};

export const createMember = async (memberData) => {
  return axios.post(`${BASE_URL}/make`, memberData);
};

export const updateMember = async (id, memberData) => {
  return axios.put(`${BASE_URL}/modify/${id}`, memberData);
};

export const deleteMember = async (id) => {
  return axios.delete(`${BASE_URL}/delete/${id}`);
};
