import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Users, ShoppingCart, RefreshCw, IndianRupee, TrendingUp, Package, Download, Plus, ChevronRight } from "lucide-react";
import API from "../../services/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalMaterials: 0, totalUsers: 0, totalOrders: 0, totalBatches: 0, totalRevenue: 0, totalDownloads: 0, recentOrders: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(true);
      const res = await API.get("/admin/stats");
      const data = res.data?.data || res.data || {};
      setStats({
        totalMaterials: data.totalMaterials || 0,
        totalUsers: data.totalUsers || 0,
        totalOrders: data.totalOrders || 0,
        totalBatches: data.totalBatches || 0,
        totalRevenue: data.totalRevenue || 0,
        totalDownloads: data.totalDownloads || 0,
        recentOrders: data.recentOrders || [],
      });
      setError("");
    } catch {
      if (!silent) setError("Failed to load dashboard stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
  const fmtCurrency = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

  const statCards = [
    { title: "Total Revenue", value: fmtCurrency(stats.totalRevenue), icon: <IndianRupee size={22} />, color: "yellow", route: "/admin/orders" },
    { title: "Total Orders", value: fmt(stats.totalOrders), icon: <ShoppingCart size={22} />, color: "purple", route: "/admin/orders" },
    { title: "Active Batches", value: fmt(stats.totalBatches), icon: <Package size={22} />, color: "blue", route: "/admin/batches" },
    { title: "Total Users", value: fmt(stats.totalUsers), icon: <Users size={22} />, color: "green", route: "/admin/users" },
    { title: "PDF Materials", value: fmt(stats.totalMaterials), icon: <FileText size={22} />, color: "indigo", route: "/admin/materials" },
    { title: "Downloads", value: fmt(stats.totalDownloads), icon: <Download size={22} />, color: "pink", route: null },
  ];

  const colorMap = {
    yellow: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
    purple: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
    blue: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
    green: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
    indigo: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
    pink: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
  };

  if (loading) return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(6)].map(i => (
        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm animate-pulse">
          <div className="h-4 w-24 bg-gray-200 mb-3 rounded" />
          <div className="h-8 w-28 bg-gray-300 rounded" />
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div className="text-center py-20">
      <p className="text-red-500 mb-4 font-medium">{error}</p>
      <button onClick={() => fetchStats()}
        className="flex items-center gap-2 mx-auto bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium">
        <RefreshCw size={16} /> Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={24} /> Dashboard Overview
          </h1>
          <p className="text-gray-500 text-sm mt-1">Real-time platform statistics</p>
        </div>
        <button onClick={() => fetchStats()} disabled={refreshing}
          className="flex items-center gap-2 text-sm bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50 transition shadow-sm">
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((item, i) => {
          const c = colorMap[item.color];
          const card = (
            <div className={`bg-white p-6 rounded-2xl shadow-sm border ${c.border} hover:shadow-md transition-all group`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 ${c.bg} rounded-xl ${c.text}`}>{item.icon}</div>
                {item.route && <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition" />}
              </div>
              <p className="text-3xl font-extrabold text-gray-900 mb-1">{item.value}</p>
              <p className="text-sm text-gray-500 font-medium">{item.title}</p>
            </div>
          );
          return item.route ? (
            <button key={i} onClick={() => navigate(item.route)} className="text-left">{card}</button>
          ) : (
            <div key={i}>{card}</div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Plus size={18} />, label: "New Batch", desc: "Create study package", route: "/admin/batches", color: "blue" },
            { icon: <FileText size={18} />, label: "Upload PDF", desc: "Add study material", route: "/admin/materials/upload", color: "green" },
            { icon: <Users size={18} />, label: "Manage Users", desc: "View all students", route: "/admin/users", color: "purple" },
            { icon: <ShoppingCart size={18} />, label: "View Orders", desc: "Track payments", route: "/admin/orders", color: "orange" },
          ].map((item, i) => (
            <button key={i} onClick={() => navigate(item.route)}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-left group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                item.color === "blue" ? "bg-blue-100 text-blue-600" :
                item.color === "green" ? "bg-green-100 text-green-600" :
                item.color === "purple" ? "bg-purple-100 text-purple-600" :
                "bg-orange-100 text-orange-600"
              }`}>{item.icon}</div>
              <p className="font-bold text-gray-900 text-sm mb-0.5">{item.label}</p>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      {stats.recentOrders?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <button onClick={() => navigate("/admin/orders")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentOrders.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="text-green-600" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {order.user?.name || order.user?.email || "User"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {order.batch?.name || "Direct purchase"} · {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <span className="text-sm font-bold text-green-600 flex-shrink-0">₹{order.amount?.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;
