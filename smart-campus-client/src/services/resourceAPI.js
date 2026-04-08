import axios from "axios";

const API = "http://localhost:8080/api/resources";

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const resourceAPI = {
  getAll: (params) => axios.get(API, { ...getAuthHeader(), params }),
  getById: (id) => axios.get(`${API}/id/${id}`, getAuthHeader()),
  create: (data) =>
    axios.post(API, data, {
      ...getAuthHeader(),
      headers: {
        ...getAuthHeader().headers,
        "Content-Type": "multipart/form-data",
      },
    }),
  update: (id, data) =>
    axios.put(`${API}/${id}`, data, {
      ...getAuthHeader(),
      headers: {
        ...getAuthHeader().headers,
        "Content-Type": "multipart/form-data",
      },
    }),
  delete: (id) => axios.delete(`${API}/${id}`, getAuthHeader()),
  updateStatus: (id, status) =>
    axios.patch(`${API}/${id}/status`, { status }, getAuthHeader()),
  getStats: () => axios.get(`${API}/stats`, getAuthHeader()), // ✅ FIXED
};
