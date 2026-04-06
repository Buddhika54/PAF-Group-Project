import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // adjust if needed
});

// Ticket API
export const ticketAPI = {
  getAll: () => API.get("/tickets"),
  getById: (id) => API.get(`/tickets/${id}`),
  create: (data) => API.post("/tickets", data),
};

// Booking API (since your app expects it)
export const bookingAPI = {
  getAll: () => API.get("/bookings"),
  create: (data) => API.post("/bookings", data),
};


export const resourceAPI = {
  getAll: () => API.get("/resources"),
  getById: (id) => API.get(`/resources/${id}`),
};