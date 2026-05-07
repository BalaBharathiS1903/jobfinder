import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    api.get("/auth/me/")
      .then((r) => setUser(r.data))
      .catch(() => setUser(null));
  }, []);

  const login = async (email, password) => {
    await api.post("/auth/login/", { email, password });
    const me = await api.get("/auth/me/");
    setUser(me.data);
    return me.data;
  };

  const register = async (username, email, password) => {
    await api.post("/auth/register/", { username, email, password });
    try {
      await login(email, password);
    } catch {
      // login failed after register — not a registration error, ignore
    }
  };

  const logout = () => {
    api.post("/auth/logout/").catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
