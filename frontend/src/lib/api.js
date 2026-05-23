import axios from "axios";

const api = axios.create({ baseURL: "/api", withCredentials: true });

let refreshRequest = null;

function getCookie(name) {
  if (typeof document === "undefined") return "";
  const prefix = `${name}=`;
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length) || "";
}

api.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  if (!["get", "head", "options", "trace"].includes(method)) {
    const csrfToken = getCookie("csrftoken");
    if (csrfToken) {
      config.headers = {
        ...config.headers,
        "X-CSRFToken": csrfToken,
      };
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        refreshRequest ||= axios
          .post("/api/auth/refresh/", {}, { withCredentials: true })
          .finally(() => {
            refreshRequest = null;
          });
        await refreshRequest;
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
