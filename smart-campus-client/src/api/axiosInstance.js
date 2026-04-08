import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Only add token if it exists (don't require it)
api.interceptors.request.use(
    (config) => {
        // Check if this is a public endpoint that doesn't need auth
        const publicEndpoints = ['/resources', '/tickets']; // Add public endpoints here
        
        const isPublic = publicEndpoints.some(endpoint => config.url.includes(endpoint));
        
        if (!isPublic) {
            const token = localStorage.getItem('token');
            if(token){
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Don't redirect to login for public endpoints
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Only redirect to login if it's not a public endpoint and not a CORS error
    const isPublicEndpoint = error.config?.url?.includes('/resources') || 
                            error.config?.url?.includes('/tickets');
    
    if (error.response?.status === 401 && !isPublicEndpoint) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export const bookingAPI = {
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






