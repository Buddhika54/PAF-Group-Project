import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if(token){
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
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

//_____Resource_____

//_____Booking_____
export const bookingAPI = {
    create:       (data) => api.post('/bookings', data),
    getMyBookings:()     => api.get('/bookings/my'),
    getMyStats:   ()     => api.get('/bookings/my/stats'),
    getAll:       ()     => api.get('/bookings'),
    getById:      (id)   => api.get(`/bookings/${id}`),
    approve:      (id)   => api.put(`/bookings/${id}/approve`),
    reject:       (id, reason) => api.put(
        `/bookings/${id}/reject`,
        { rejectionReason: reason }
    ),
    cancel:       (id)   => api.put(`/bookings/${id}/cancel`),
}

//_____Ticket_____
export const ticketAPI = {
    create: (data) => api.post('/tickets', data),
}

export default api;