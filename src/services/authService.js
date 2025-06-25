import axios from "axios";

const API_URL = ""; // Adjust if needed

export const loginUser = async (formData) => {
  const res = await axios.post(`${API_URL}/login`, formData);
  return res.data;
};

export const registerUser = async (formData) => {
  const res = await axios.post(`${API_URL}/register`, formData);
  return res.data;
};


