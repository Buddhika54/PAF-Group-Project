import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:8080/api/admin";

// Create axios instance with token interceptor
const adminAxios = axios.create({
  baseURL: API_BASE_URL,
});

adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminUserService = {
  // Get all users (admin can see everyone)
  getAllUsers: async () => {
    const response = await adminAxios.get("/users");
    return response.data;
  },

  // Create new ADMIN or TECHNICIAN
  createUser: async (userData) => {
    const response = await adminAxios.post("/users", userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await adminAxios.delete(`/users/${userId}`);
    return response.data;
  },
};
