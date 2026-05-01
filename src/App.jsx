import React, { Suspense } from "react";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";

/* 🔄 Simple Loader */
function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function App() {
  return (
    <>
      {/* 🔝 Scroll reset */}
      <ScrollToTop />

      {/* ⚡ Route Loader Wrapper */}
      <Suspense fallback={<Loader />}>
        <AppRoutes />
      </Suspense>
    </>
  );
}

export default App;