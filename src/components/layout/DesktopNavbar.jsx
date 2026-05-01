import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, GraduationCap, BookOpen, Package } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function DesktopNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Logout from your account?")) logout();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 z-50 hidden md:block">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-3.5 px-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="text-xl font-extrabold text-gray-900">
            Rohit <span className="text-blue-600">Academy</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          <Link to="/batches" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition">
            <Package size={15} /> Batches
          </Link>
          <Link to="/classes" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition">
            <BookOpen size={15} /> Classes
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button onClick={() => navigate("/account")}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl text-blue-700 text-sm font-semibold transition">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-xs font-bold">{(user.name || user.email || "U")[0].toUpperCase()}</span>
                  )}
                </div>
                <span className="max-w-24 truncate">{user.name || user.email?.split("@")[0]}</span>
              </button>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition px-2 py-2">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition px-3 py-2">Login</Link>
              <Link to="/register" className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-xl hover:shadow-lg transition shadow-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default React.memo(DesktopNavbar);
