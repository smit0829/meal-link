import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("meallink_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("meallink_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("meallink_user", JSON.stringify(data.user));
      })
      .catch((err) => {
        // Only log out if the server actively rejected the token
        // (expired/invalid/user deleted). A network error or the
        // backend being briefly unreachable should NOT log the user
        // out — just keep showing the cached user from localStorage.
        if (err.response?.status === 401) {
          localStorage.removeItem("meallink_token");
          localStorage.removeItem("meallink_user");
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("meallink_token", data.token);
    localStorage.setItem("meallink_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    try {
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem("meallink_token", data.token);
      localStorage.setItem("meallink_user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error("AuthContext.register error:", err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("meallink_token");
    localStorage.removeItem("meallink_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
