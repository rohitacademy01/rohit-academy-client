import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {

  const { user } = useAuth();

  /* =====================================
     🧠 STATE (SAFE INIT)
  ===================================== */
  const [cartItems, setCartItems] = useState([]);

  /* =====================================
     🔑 STORAGE KEY
  ===================================== */
  const getStorageKey = () =>
    user?._id ? `cart_${user._id}` : "cart_guest";

  /* =====================================
     🔐 SAFE PARSE
  ===================================== */
  const safeParse = (data) => {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  };

  /* =====================================
     📦 LOAD CART (USER CHANGE SAFE)
  ===================================== */
  useEffect(() => {

    const key = getStorageKey();

    const saved = localStorage.getItem(key);

    if (saved) {
      const parsed = safeParse(saved);

      if (Array.isArray(parsed)) {
        setCartItems(parsed);
      } else {
        setCartItems([]);
      }

    } else {
      setCartItems([]);
    }

  }, [user]);

  /* =====================================
     💾 SAVE (CENTRALIZED)
  ===================================== */
  const saveCart = (items) => {

    const safeItems = Array.isArray(items) ? items : [];

    setCartItems(safeItems);

    localStorage.setItem(
      getStorageKey(),
      JSON.stringify(safeItems)
    );
  };

  /* =====================================
     ➕ ADD (NO DUPLICATE + SAFE)
  ===================================== */
  const addToCart = (product) => {

    if (!product || (!product._id && !product.id)) return;

    setCartItems((prev) => {

      const safePrev = Array.isArray(prev) ? prev : [];

      const id = product._id || product.id;

      const exists = safePrev.find(
        (item) => (item._id || item.id) === id
      );

      if (exists) return safePrev;

      const updated = [...safePrev, product];

      localStorage.setItem(
        getStorageKey(),
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  /* =====================================
     ❌ REMOVE (🔥 FINAL FIX)
  ===================================== */
  const removeFromCart = (id) => {

    if (!id) return;

    setCartItems((prev) => {

      const safePrev = Array.isArray(prev) ? prev : [];

      const updated = safePrev.filter(
        (item) => (item._id || item.id) !== id
      );

      localStorage.setItem(
        getStorageKey(),
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  /* =====================================
     🧹 CLEAR
  ===================================== */
  const clearCart = () => {

    setCartItems([]);

    localStorage.removeItem(getStorageKey());
  };

  /* =====================================
     💰 TOTAL (SAFE)
  ===================================== */
  const total = Array.isArray(cartItems)
    ? cartItems.reduce(
        (sum, item) => sum + (Number(item?.price) || 0),
        0
      )
    : 0;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* =====================================
   🔥 HOOK
===================================== */
export const useCart = () => {

  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
};