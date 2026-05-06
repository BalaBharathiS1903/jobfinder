import axios from "axios";

const api = axios.create({ baseURL: "/api", withCredentials: true });

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        await axios.post("/api/auth/refresh/", {}, { withCredentials: true });
        original.withCredentials = true;
        return api(original);
      } catch {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;
