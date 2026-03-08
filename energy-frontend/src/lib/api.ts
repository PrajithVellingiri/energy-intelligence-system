import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data: { email: string; username: string; password: string }) =>
    api.post("/auth/signup", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
};

// AI Analytics API - CSV-driven with persistent reports
export const analyticsAPI = {
  getModelStatus: () => api.get("/api/model-status"),
  analyzeCSV: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/analyze-csv", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 300000, // 5 min timeout for training + analysis
    });
  },
  listReports: () => api.get("/api/reports"),
  getReport: (reportId: number) => api.get(`/api/reports/${reportId}`),
  deleteReport: (reportId: number) => api.delete(`/api/reports/${reportId}`),
};

export default api;
