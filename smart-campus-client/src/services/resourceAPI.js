import axios from "axios";

const API = "http://localhost:8080/api/resources";

export const resourceAPI = {
  getAll: (params) => axios.get(API, { params }),
  getById: (id) => axios.get(`${API}/id/${id}`),
  create: (data) =>
    axios.post(API, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    axios.put(`${API}/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => axios.delete(`${API}/${id}`),
  updateStatus: (id, status) => axios.patch(`${API}/${id}/status`, { status }),
  getStats: () => axios.get(`${API}/stats`),
};
