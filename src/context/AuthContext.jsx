import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =====================================
     🔄 LOAD USER (AUTO LOGIN)
  ===================================== */
  const loadUser = async () => {
    try {

      const token = localStorage.getItem("token");

      /* 🔥 ADMIN LOGIN KO IGNORE KARO */
      const admin = JSON.parse(localStorage.getItem("admin") || "null");

      if (!token || admin?.token) {
        setUser(null);
        setLoading(false);
        return;
      }

      /* ⚡ FAST CACHE LOAD */
      try {
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        }
      } catch {
        localStorage.removeItem("user");
      }

      /* 🔐 VERIFY FROM SERVER */
      const res = await API.get("/auth/me");

      const userData = res.data?.user;

      if (!userData) throw new Error("Invalid user");

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

    } catch (err) {

      console.error("❌ AUTH ERROR:", err.response?.data || err.message);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setUser(null);

    } finally {
      setLoading(false);
    }
  };

  /* =====================================
     🚀 INITIAL LOAD + MULTI TAB SYNC
  ===================================== */
  useEffect(() => {

    /* ⚡ FAST LOCAL LOAD */
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem("user");
    }

    loadUser();

    /* 🔥 MULTI TAB LOGOUT SYNC */
    const syncLogout = (e) => {

      if (e.key === "token" && !e.newValue) {
        setUser(null);
      }

      if (e.key === "user" && !e.newValue) {
        setUser(null);
      }

    };

    window.addEventListener("storage", syncLogout);

    return () => {
      window.removeEventListener("storage", syncLogout);
    };

  }, []);

  /* =====================================
     🔐 LOGIN (USER ONLY)
  ===================================== */
  const login = (data) => {

    if (!data?.token || !data?.user) {
      console.error("❌ Invalid login data");
      return;
    }

    try {

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);

    } catch (error) {
      console.error("Login storage error:", error);
    }
  };

  /* =====================================
     🚪 LOGOUT
  ===================================== */
  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =====================================
   🔹 HOOK
===================================== */
export const useAuth = () => {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};