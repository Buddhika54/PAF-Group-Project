import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Always attach token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const bookingAPI = {
  getMyBookings: () => api.get('/bookings/my'),
  getMyStats: () => api.get('/bookings/my/stats'),
  create: (data) => api.post('/bookings', data),
};

export const ticketAPI = {
  getMyTickets: () => api.get('/tickets/my'),
  getById: (id) => api.get(`/tickets/${id}`),
  getMyStats: () => api.get('/tickets/my/stats'),
  create: (data) => api.post('/tickets', data),
  updateStatus: (id, data) => api.put(`/tickets/${id}/status`, data),
  assign: (id, technicianId) => api.put(`/tickets/${id}/assign`, { technicianId }),
  addComment: (id, content) => api.post(`/tickets/${id}/comments`, { content }),
  editComment: (ticketId, cid, content) => api.put(`/tickets/${ticketId}/comments/${cid}`, { content }),
  deleteComment: (ticketId, cid) => api.delete(`/tickets/${ticketId}/comments/${cid}`),
  uploadAttachment: (id, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/tickets/${id}/attachments`, form);
  },
  getAll: () => api.get('/tickets'),
};

export const resourceAPI = {
  getAll: () => api.get('/resources'),
};

export default api;