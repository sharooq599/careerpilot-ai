import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000", timeout: 60000 });
api.interceptors.request.use(config => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (typeof FormData !== "undefined" && config.data instanceof FormData) delete config.headers["Content-Type"];
  return config;
});
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && !["/auth/login", "/auth/register"].some(p => error.config?.url?.includes(p))) {
    localStorage.removeItem("access_token");
    if (window.location.pathname !== "/login") window.location.assign("/login?session=expired");
  }
  return Promise.reject(error);
});
export default api;
