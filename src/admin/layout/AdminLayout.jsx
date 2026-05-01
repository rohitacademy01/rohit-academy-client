import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, Users, ShoppingCart,
  LogOut, Menu, X, BookOpen, Package, GraduationCap,
  ChevronDown, ChevronRight, BarChart2, Tag, BookMarked
} from "lucide-react";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    academics: true,
    materials: false,
    finance: false,
    studyPdfs: false,
  });

  const handleLogout = () => {
    if (!window.confirm("Logout from admin panel?")) return;
    localStorage.removeItem("admin");
    navigate("/admin-login", { replace: true });
  };

  const toggleSection = (key) => setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const isActive = (path, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const linkClass = (path, exact = false) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
      isActive(path, exact)
        ? "bg-blue-600 text-white font-semibold shadow-sm"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  const subLinkClass = (path) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
      location.pathname === path
        ? "bg-blue-100 text-blue-700 font-semibold"
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
    }`;

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === "/admin") return "Dashboard";
    if (p.includes("/batches")) return "Manage Batches";
    if (p.includes("/materials/upload")) return "Upload Material";
    if (p.includes("/materials")) return "Materials";
    if (p.includes("/pdfs")) return "Study PDFs";
    if (p.includes("/users")) return "Users";
    if (p.includes("/orders")) return "Orders";
    if (p.includes("/academics/classes")) return "Classes";
    if (p.includes("/academics/streams")) return "Streams";
    if (p.includes("/academics/subjects")) return "Subjects";
    if (p.includes("/academics")) return "Academics";
    if (p.includes("/coupons")) return "Coupons";
    if (p.includes("/sales-report")) return "Sales Report";
    return "Admin Panel";
  };

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-white border-r border-gray-200 shadow-sm p-5 flex flex-col overflow-y-auto transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>

        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 leading-none">Rohit Academy</h2>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
          <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1 text-gray-700">

          <NavLink to="/admin" end className={linkClass("/admin", true)}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>

          <NavLink to="/admin/batches" className={linkClass("/admin/batches")}>
            <Package size={18} /> Batches
          </NavLink>

          {/* Academics */}
          <div>
            <button onClick={() => toggleSection("academics")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive("/admin/academics") ? "text-blue-700 bg-blue-50 font-semibold" : "text-gray-600 hover:bg-gray-100"}`}>
              <BookOpen size={18} />
              <span className="flex-1 text-left">Academics</span>
              {openSections.academics ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {openSections.academics && (
              <div className="ml-4 mt-1 space-y-0.5">
                <NavLink to="/admin/academics/classes" className={subLinkClass("/admin/academics/classes")}>Classes</NavLink>
                <NavLink to="/admin/academics/streams" className={subLinkClass("/admin/academics/streams")}>Streams</NavLink>
                <NavLink to="/admin/academics/subjects" className={subLinkClass("/admin/academics/subjects")}>Subjects</NavLink>
              </div>
            )}
          </div>

          {/* Study PDFs — NEW */}
          <NavLink to="/admin/pdfs" className={linkClass("/admin/pdfs")}>
            <BookMarked size={18} /> Study PDFs
          </NavLink>

          {/* Materials (legacy) */}
          <div>
            <button onClick={() => toggleSection("materials")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive("/admin/materials") ? "text-blue-700 bg-blue-50 font-semibold" : "text-gray-600 hover:bg-gray-100"}`}>
              <FileText size={18} />
              <span className="flex-1 text-left">Materials</span>
              {openSections.materials ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {openSections.materials && (
              <div className="ml-4 mt-1 space-y-0.5">
                <NavLink to="/admin/materials" className={subLinkClass("/admin/materials")}>All Materials</NavLink>
                <NavLink to="/admin/materials/upload" className={subLinkClass("/admin/materials/upload")}>
                  <span className="text-green-600 font-semibold">+ Upload PDF</span>
                </NavLink>
              </div>
            )}
          </div>

          <NavLink to="/admin/users" className={linkClass("/admin/users")}>
            <Users size={18} /> Users
          </NavLink>
          <NavLink to="/admin/orders" className={linkClass("/admin/orders")}>
            <ShoppingCart size={18} /> Orders
          </NavLink>

          {/* Finance */}
          <div>
            <button onClick={() => toggleSection("finance")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${(isActive("/admin/coupons") || isActive("/admin/sales-report")) ? "text-blue-700 bg-blue-50 font-semibold" : "text-gray-600 hover:bg-gray-100"}`}>
              <BarChart2 size={18} />
              <span className="flex-1 text-left">Finance</span>
              {openSections.finance ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {openSections.finance && (
              <div className="ml-4 mt-1 space-y-0.5">
                <NavLink to="/admin/coupons" className={subLinkClass("/admin/coupons")}>
                  <Tag size={12} /> Coupons
                </NavLink>
                <NavLink to="/admin/sales-report" className={subLinkClass("/admin/sales-report")}>
                  <BarChart2 size={12} /> Sales Report
                </NavLink>
              </div>
            )}
          </div>

        </nav>

        {/* Logout */}
        <button onClick={handleLogout}
          className="flex items-center gap-3 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2.5 rounded-xl text-sm transition mt-4">
          <LogOut size={18} /> Logout
        </button>

      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-700">
            <Menu size={24} />
          </button>
          <h1 className="font-bold text-gray-900">{getPageTitle()}</h1>
          <div className="w-8" />
        </header>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            Admin · Online
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default AdminLayout;
