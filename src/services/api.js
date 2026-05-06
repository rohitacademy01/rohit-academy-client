import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://rohit-academy-server-1.onrender.com/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use(
  (config) => {
    try {
      const admin = JSON.parse(localStorage.getItem("admin") || "null");
      const token = admin?.token || localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
    return config;
  },
  (error) => Promise.reject(error)
);

let isRedirecting = false;

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    if (status === 401 && !isRedirecting) {
      isRedirecting = true;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("admin");
      const target = currentPath.startsWith("/admin") ? "/admin-login" : "/login";
      window.location.href = target;
      setTimeout(() => { isRedirecting = false; }, 2000);
    }
    return Promise.reject(error);
  }
);

export default API;
