import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { DownloadProvider } from "./context/DownloadContext";
import { ProductProvider } from "./context/ProductContext";

import "./styles/theme.css";

/* =====================================
   🔥 PROVIDER COMPOSITION (CLEAN)
===================================== */
function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <DownloadProvider>
          <ProductProvider>
            {children}
          </ProductProvider>
        </DownloadProvider>
      </CartProvider>
    </AuthProvider>
  );
}

/* =====================================
   🛡 SIMPLE ERROR BOUNDARY
===================================== */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("🔥 App Crash:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center text-center p-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong 😢</h1>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* =====================================
   🚀 ROOT RENDER
===================================== */
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <ErrorBoundary>
      <Providers>
        <App />
      </Providers>
    </ErrorBoundary>
  </BrowserRouter>
);