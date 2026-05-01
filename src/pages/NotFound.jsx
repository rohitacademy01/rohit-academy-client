import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition">
            <ArrowLeft size={18} /> Go Back
          </button>
          <Link to="/"
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition shadow-lg">
            <Home size={18} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
