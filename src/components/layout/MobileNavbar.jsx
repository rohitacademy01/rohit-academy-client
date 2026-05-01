import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, Package, User, Menu, X, LogOut, GraduationCap, Download, ShoppingBag } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function MobileNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  const navItems = [
    { to: "/", icon: <Home size={20} />, label: "Home" },
    { to: "/batches", icon: <Package size={20} />, label: "Batches" },
    { to: "/classes", icon: <BookOpen size={20} />, label: "Classes" },
    { to: user ? "/account" : "/login", icon: <User size={20} />, label: user ? "Account" : "Login" },
  ];

  return (
    <>
      {/* Top Bar */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <GraduationCap size={16} className="text-white" />
          </div>
          <span className="font-extrabold text-gray-900 text-lg">Rohit <span className="text-blue-600">Academy</span></span>
        </Link>
        <button onClick={() => setMenuOpen(true)} className="text-gray-700 p-1">
          <Menu size={24} />
        </button>
      </header>

      {/* Slide-out Menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col p-6">
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-gray-900">Menu</span>
              <button onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={22} />
              </button>
            </div>

            {user && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-lg">{(user.name || "U")[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{user.name || "Student"}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email || user.phone}</p>
                </div>
              </div>
            )}

            <nav className="space-y-1 flex-1">
              {[
                { to: "/", icon: <Home size={18} />, label: "Home" },
                { to: "/batches", icon: <Package size={18} />, label: "All Batches" },
                { to: "/classes", icon: <BookOpen size={18} />, label: "Browse Classes" },
                ...(user ? [
                  { to: "/downloads", icon: <Download size={18} />, label: "My Downloads" },
                  { to: "/account", icon: <User size={18} />, label: "My Account" },
                ] : [
                  { to: "/login", icon: <User size={18} />, label: "Login" },
                  { to: "/register", icon: <User size={18} />, label: "Register" },
                ]),
              ].map((item) => (
                <Link key={item.to} to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive(item.to) ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}>
                  {item.icon} {item.label}
                </Link>
              ))}
            </nav>

            {user && (
              <button onClick={() => { logout(); setMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 text-sm font-medium transition w-full mt-4">
                <LogOut size={18} /> Logout
              </button>
            )}
          </div>
        </>
      )}

      {/* Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg">
        <div className="flex items-center justify-around py-2 px-4">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition ${
                isActive(item.to) ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              }`}>
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default MobileNavbar;
