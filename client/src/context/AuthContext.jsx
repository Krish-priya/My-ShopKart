import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("shopkart_token");
    if (!token) {
      setLoading(false);
      return;
    }

    apiRequest("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("shopkart_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function login(token, nextUser) {
    localStorage.setItem("shopkart_token", token);
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem("shopkart_token");
    setUser(null);
  }

  function updateUser(nextUser) {
    setUser(nextUser);
  }

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, updateUser, isAuthenticated, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
