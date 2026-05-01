import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "./AuthContext";

const DownloadContext = createContext();

export function DownloadProvider({ children }) {

  const { user } = useAuth();

  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔑 UNIQUE STORAGE KEY PER USER */
  const getStorageKey = () =>
    user ? `downloads_${user._id}` : "downloads_guest";

  /* 📦 LOAD FROM BACKEND */
  const fetchDownloads = async () => {
    try {

      setLoading(true);

      const res = await API.get("/orders/my-materials");

      const data =
        res.data?.data ||
        [];

      setDownloads(data);

      /* 💾 CACHE */
      localStorage.setItem(getStorageKey(), JSON.stringify(data));

    } catch (error) {

      console.error("Download fetch error:", error);

      /* 🔁 FALLBACK FROM CACHE */
      const saved = localStorage.getItem(getStorageKey());
      if (saved) setDownloads(JSON.parse(saved));

    } finally {

      setLoading(false);

    }
  };

  /* 🔄 LOAD WHEN USER CHANGE */
  useEffect(() => {
    if (user) {
      fetchDownloads();
    } else {
      setDownloads([]);
      setLoading(false);
    }
  }, [user]);

  /* ➕ ADD (SAFE + NO DUPLICATE) */
  const addDownload = (product) => {

    if (!product || !product._id) return;

    setDownloads((prev) => {

      const exists = prev.some((p) => p._id === product._id);
      if (exists) return prev;

      const updated = [...prev, product];

      localStorage.setItem(getStorageKey(), JSON.stringify(updated));

      return updated;
    });
  };

  /* ❌ CLEAR */
  const clearDownloads = () => {
    setDownloads([]);
    localStorage.removeItem(getStorageKey());
  };

  return (
    <DownloadContext.Provider
      value={{
        downloads,
        loading,
        addDownload,
        clearDownloads,
        refreshDownloads: fetchDownloads
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
}

/* 🔥 SAFE HOOK */
export const useDownloads = () => {
  const context = useContext(DownloadContext);

  if (!context) {
    throw new Error("useDownloads must be used within DownloadProvider");
  }

  return context;
};