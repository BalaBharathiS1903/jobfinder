import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    if (localStorage.getItem("access")) {
      api.get("/auth/me/")
        .then((r) => setUser(r.data))
        .catch(() => { localStorage.clear(); setUser(null); });
    } else {
      setUser(null);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login/", { email, password });
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    const me = await api.get("/auth/me/");
    setUser(me.data);
  };

  const register = async (username, email, password) => {
    await api.post("/auth/register/", { username, email, password });
    await login(email, password);
  };

  const logout = () => {
    api.post("/auth/logout/").catch(() => {});
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
