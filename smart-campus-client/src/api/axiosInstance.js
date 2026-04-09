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

//_____Notification_____
export const notificationAPI = {
    getMyNotifications: () => api.get('/notifications'),
    getUnreadCount:     () => api.get('/notifications/unread-count'),
    markAsRead:         (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead:      () => api.put('/notifications/read-all'),
}

//_____System Notifications (Admin Broadcasts)_____
export const systemNotificationAPI = {
    getAll:   ()         => api.get('/system-notifications'),
    getOne:   (id)       => api.get(`/system-notifications/${id}`),
    create:   (data)     => api.post('/system-notifications', data),
    update:   (id, data) => api.put(`/system-notifications/${id}`, data),
    delete:   (id)       => api.delete(`/system-notifications/${id}`),
}

export default api;