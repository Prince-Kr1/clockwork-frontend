import axios from 'axios';
import { BASE_URL } from './apiPath';

const axiosInstance = axios.create({
  baseURL: BASE_URL, 
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  },
});

// Request Interceptor with debug
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    console.log("🔍 Token exists:", !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Auth header added");
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if(error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userId');
        // Reload page to trigger redirect to login
        window.location.href = '/login';
      }
      else if (error.response.status === 500) {
        console.error("Server error. Please try again later.");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please try again.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;