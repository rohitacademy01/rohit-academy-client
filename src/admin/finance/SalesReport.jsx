import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingCart,
  IndianRupee,
  Package,
  RefreshCw
} from "lucide-react";
import API from "../../services/api";

function SalesReport() {

  const [stats, setStats] = useState({
    totalSales: 0,
    todaySales: 0,
    monthlySales: 0,
    totalOrders: 0
  });

  const [topProducts, setTopProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     💰 FORMATTERS
  ========================= */
  const formatPrice = (num = 0) =>
    `₹${Number(num).toLocaleString("en-IN")}`;

  /* =========================
     📦 FETCH DATA
  ========================= */
  const fetchReport = async (silent = false) => {

    try {

      if (!silent) setLoading(true);
      setRefreshing(true);
      setError("");

      const res = await API.get("/admin/sales-report");

      const data = res.data?.data || {};

      setStats({
        totalSales: data.stats?.totalSales || 0,
        todaySales: data.stats?.todaySales || 0,
        monthlySales: data.stats?.monthlySales || 0,
        totalOrders: data.stats?.totalOrders || 0
      });

      setTopProducts(data.topProducts || []);

    } catch (err) {

      console.error("❌ Sales report error:", err);

      if (!silent) {
        setError("Failed to load sales report");
      }

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };

  /* =========================
     🚀 INIT + AUTO REFRESH
  ========================= */
  useEffect(() => {

    fetchReport();

    const interval = setInterval(() => {
      fetchReport(true);
    }, 30000);

    return () => clearInterval(interval);

  }, []);

  /* =========================
     ⏳ LOADING
  ========================= */
  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 p-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white p-5 rounded-xl shadow animate-pulse">
            <div className="h-5 w-24 bg-gray-200 mb-3 rounded"></div>
            <div className="h-8 w-32 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  /* =========================
     ❌ ERROR
  ========================= */
  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>

        <button
          onClick={() => fetchReport()}
          className="flex items-center gap-2 mx-auto bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (

    <div className="p-4 md:p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl md:text-3xl font-bold">
          Sales Report
        </h1>

        <button
          onClick={() => fetchReport()}
          className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>

      </div>

      {/* ================= STATS ================= */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 mb-8">

        <StatCard
          icon={<IndianRupee size={26} />}
          color="green"
          label="Total Sales"
          value={formatPrice(stats.totalSales)}
        />

        <StatCard
          icon={<TrendingUp size={26} />}
          color="blue"
          label="Today Sales"
          value={formatPrice(stats.todaySales)}
        />

        <StatCard
          icon={<Package size={26} />}
          color="purple"
          label="Monthly Sales"
          value={formatPrice(stats.monthlySales)}
        />

        <StatCard
          icon={<ShoppingCart size={26} />}
          color="orange"
          label="Total Orders"
          value={stats.totalOrders}
        />

      </div>

      {/* ================= TOP PRODUCTS ================= */}
      <div className="bg-white p-5 rounded-xl shadow">

        <h2 className="text-lg md:text-xl font-semibold mb-4">
          Top Selling Materials
        </h2>

        {topProducts.length === 0 ? (

          <div className="text-center py-10 text-gray-500">
            No sales data available yet
          </div>

        ) : (

          <>
            {/* 💻 DESKTOP TABLE */}
            <table className="w-full hidden md:table">

              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Material</th>
                  <th className="p-3 text-left">Sales</th>
                </tr>
              </thead>

              <tbody>
                {topProducts.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3 font-semibold">
                      {index + 1}
                    </td>

                    <td className="p-3">
                      {item.name}
                    </td>

                    <td className="p-3 font-semibold text-green-600">
                      {item.sales}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>

            {/* 📱 MOBILE CARDS */}
            <div className="md:hidden space-y-3">

              {topProducts.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                >

                  <div>
                    <p className="font-medium">
                      #{index + 1} {item.name}
                    </p>
                  </div>

                  <span className="font-semibold text-green-600">
                    {item.sales}
                  </span>

                </div>
              ))}

            </div>
          </>
        )}

      </div>

    </div>
  );
}

/* =========================
   🔥 STAT CARD
========================= */
function StatCard({ icon, label, value, color }) {

  const colors = {
    green: "text-green-600 bg-green-100",
    blue: "text-blue-600 bg-blue-100",
    purple: "text-purple-600 bg-purple-100",
    orange: "text-orange-600 bg-orange-100"
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow flex items-center gap-4 hover:shadow-md transition">

      <div className={`p-3 rounded-lg ${colors[color]}`}>
        {icon}
      </div>

      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <h2 className="text-lg md:text-xl font-bold">{value}</h2>
      </div>

    </div>
  );
}

export default React.memo(SalesReport);