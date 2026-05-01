import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const ProductContext = createContext();

export function ProductProvider({ children }) {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* 📦 FETCH ALL MATERIALS */
  const fetchProducts = async () => {
    try {

      setLoading(true);
      setError("");

      const res = await API.get("/materials");

      const data =
        res.data?.data ||
        res.data ||
        [];

      setProducts(data);

    } catch (err) {

      console.error("Product fetch error:", err);

      setError("Failed to load materials");
      setProducts([]);

    } finally {

      setLoading(false);

    }
  };

  /* 🔄 LOAD ON START */
  useEffect(() => {
    fetchProducts();
  }, []);

  /* 🔄 REFRESH (useful after upload/delete) */
  const refreshProducts = () => fetchProducts();

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

/* 🔥 SAFE HOOK */
export const useProducts = () => {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error("useProducts must be used within ProductProvider");
  }

  return context;
};