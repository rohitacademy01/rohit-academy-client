import React, { useEffect, useState, useMemo } from "react";
import {
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Search
} from "lucide-react";
import API from "../../services/api";

function OrdersAdmin() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  /* ================= FETCH ================= */
  const fetchOrders = async (silent = false) => {
    try {

      if (!silent) setLoading(true);
      setRefreshing(true);
      setError("");

      const res = await API.get("/admin/orders");

      const data = res.data?.data || [];

      const sorted = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(sorted);

    } catch (err) {
      console.error(err);
      if (!silent) setError("Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders(true); // 🔥 auto refresh
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  /* ================= FILTER ================= */
  const filteredOrders = useMemo(() => {

    return orders.filter(order => {

      const matchSearch =
        order.orderId?.toLowerCase().includes(search.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        order.user?.phone?.includes(search);

      const matchStatus =
        statusFilter === "all" ||
        order.status?.toLowerCase() === statusFilter;

      return matchSearch && matchStatus;

    });

  }, [orders, search, statusFilter]);

  /* ================= STATUS UI ================= */
  const getStatusUI = (status = "") => {

    const s = status.toLowerCase();

    if (s === "paid") {
      return {
        icon: <CheckCircle size={16} />,
        text: "Paid",
        color: "bg-green-100 text-green-600"
      };
    }

    if (s === "pending") {
      return {
        icon: <Clock size={16} />,
        text: "Pending",
        color: "bg-yellow-100 text-yellow-600"
      };
    }

    return {
      icon: <XCircle size={16} />,
      text: "Failed",
      color: "bg-red-100 text-red-600"
    };
  };

  const formatPrice = (amt) =>
    `₹${Number(amt || 0).toLocaleString("en-IN")}`;

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="text-center py-16 text-gray-500">
        Loading orders...
      </div>
    );
  }

  return (

    <div className="p-4 md:p-6">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

        <h1 className="text-2xl md:text-3xl font-bold">
          Orders Management
        </h1>

        <div className="flex gap-2">

          <input
            type="text"
            placeholder="Search order / user"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <button
            onClick={() => fetchOrders()}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>

        </div>

      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-center">
          {error}
        </div>
      )}

      {/* EMPTY */}
      {filteredOrders.length === 0 && (
        <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
          No orders found
        </div>
      )}

      {/* ================= DESKTOP ================= */}
      {filteredOrders.length > 0 && (

        <div className="hidden md:block bg-white shadow rounded-xl overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">User</th>
                <th className="p-3">Items</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>

            <tbody>

              {filteredOrders.map(order => {

                const status = getStatusUI(order.status);

                return (
                  <tr key={order._id} className="border-b hover:bg-gray-50">

                    <td className="p-3 font-semibold">
                      {order.orderId || order._id}
                    </td>

                    <td className="p-3">
                      {order.user?.name || "User"}
                      <div className="text-xs text-gray-500">
                        {order.user?.phone}
                      </div>
                    </td>

                    <td className="p-3">
                      {order.materials?.length || 1}
                    </td>

                    <td className="p-3 font-semibold text-blue-600">
                      {formatPrice(order.amount)}
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-1 rounded flex items-center gap-1 w-fit ${status.color}`}>
                        {status.icon} {status.text}
                      </span>
                    </td>

                    <td className="p-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                  </tr>
                );

              })}

            </tbody>

          </table>

        </div>

      )}

      {/* ================= MOBILE ================= */}
      <div className="grid gap-4 md:hidden">

        {filteredOrders.map(order => {

          const status = getStatusUI(order.status);

          return (
            <div key={order._id} className="bg-white shadow rounded-xl p-4 space-y-2">

              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-600">
                  {order.orderId || order._id}
                </span>

                <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${status.color}`}>
                  {status.icon} {status.text}
                </span>
              </div>

              <div className="text-sm text-gray-600">
                {order.user?.name} • {order.user?.phone}
              </div>

              <div className="text-sm text-gray-500">
                {order.materials?.length || 1} items
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-blue-600">
                  {formatPrice(order.amount)}
                </span>

                <span className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>

            </div>
          );

        })}

      </div>

    </div>

  );

}

export default OrdersAdmin;