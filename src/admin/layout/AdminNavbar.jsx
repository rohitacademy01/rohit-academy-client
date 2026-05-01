import React from "react";
import { Menu, LogOut, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AdminNavbar({ toggleSidebar }) {

  const navigate = useNavigate();

  /* =========================
     🔐 GET ADMIN DATA
  ========================= */
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  /* =========================
     🚪 LOGOUT (SAFE)
  ========================= */
  const handleLogout = () => {

    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    try {

      // 🔥 clear everything safely
      localStorage.clear();

      // 🔐 redirect
      navigate("/admin-login", { replace: true });

    } catch (err) {

      console.error("Logout error:", err);

      // fallback
      navigate("/admin-login", { replace: true });
    }
  };

  return (

    <header className="bg-white border-b px-4 md:px-6 py-3 flex items-center justify-between shadow-sm">

      {/* ================= LEFT ================= */}
      <div className="flex items-center gap-3">

        {/* ☰ MOBILE MENU */}
        <button
          onClick={() => toggleSidebar?.()}
          className="md:hidden text-gray-700 hover:text-black transition"
        >
          <Menu size={24} />
        </button>

        {/* 🛡️ LOGO / TITLE */}
        <div className="flex items-center gap-2">

          <ShieldCheck className="text-blue-600" size={20} />

          <h1 className="font-semibold text-lg text-blue-600">
            Admin Panel
          </h1>

        </div>

      </div>

      {/* ================= RIGHT ================= */}
      <div className="flex items-center gap-4">

        {/* 👤 ADMIN INFO */}
        <div className="hidden sm:flex flex-col text-right">

          <span className="text-sm font-medium text-gray-700">
            {admin?.email || "Admin"}
          </span>

          <span className="text-xs text-gray-500">
            {admin?.role || "Administrator"}
          </span>

        </div>

        {/* 🔐 LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 active:scale-95 transition"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>

      </div>

    </header>

  );

}

export default React.memo(AdminNavbar);