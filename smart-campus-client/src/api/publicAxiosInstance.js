import axios from 'axios';

// This instance DOES NOT require authentication
const publicApi = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const publicTicketAPI = {
  create: (data) => publicApi.post('/tickets', data),
  uploadAttachment: (id, file) => {
    const form = new FormData();
    form.append('file', file);
    return publicApi.post(`/tickets/${id}/attachments`, form);
  },
};

export const publicResourceAPI = {
  getAll: () => publicApi.get('/resources'),
};

export default publicApi;