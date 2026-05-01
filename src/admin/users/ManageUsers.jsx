import React, { useEffect, useState, useMemo } from "react";
import API from "../../services/api";
import {
  User,
  ShieldOff,
  ShieldCheck,
  Search,
  RefreshCw
} from "lucide-react";

function ManageUsers() {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  /* ================= FETCH ================= */
  const fetchUsers = async (silent = false) => {
    try {

      if (!silent) setLoading(true);
      setRefreshing(true);
      setError("");

      const res = await API.get("/admin/users?page=1&limit=50");

      const data = res.data?.data || [];

      setUsers(data);

    } catch (err) {

      console.error(err);

      if (!silent) {
        setError("Failed to load users");
      }

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    const interval = setInterval(() => {
      fetchUsers(true); // 🔥 auto refresh
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  /* ================= FILTER ================= */
  const filteredUsers = useMemo(() => {

    return users.filter((user) => {

      const matchSearch =
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.phone?.includes(search);

      const matchFilter =
        filter === "all" ||
        (filter === "active" && !user.isBlocked) ||
        (filter === "blocked" && user.isBlocked);

      return matchSearch && matchFilter;

    });

  }, [users, search, filter]);

  /* ================= TOGGLE ================= */
  const toggleBlock = async (userId, isBlocked) => {

    try {

      setActionLoading(userId);

      const endpoint = isBlocked
        ? `/admin/users/${userId}/unblock`
        : `/admin/users/${userId}/block`;

      await API.patch(endpoint);

      setUsers(prev =>
        prev.map(u =>
          u._id === userId
            ? { ...u, isBlocked: !isBlocked }
            : u
        )
      );

    } catch (err) {

      console.error(err);
      alert("Action failed");

    } finally {
      setActionLoading(null);
    }

  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="grid gap-4 p-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white p-4 rounded-xl shadow animate-pulse h-16"></div>
        ))}
      </div>
    );
  }

  return (

    <div className="p-4 md:p-6">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

        <h1 className="text-2xl md:text-3xl font-bold">
          Manage Users
        </h1>

        <div className="flex gap-2">

          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>

          <button
            onClick={() => fetchUsers()}
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
      {filteredUsers.length === 0 && (
        <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
          No users found
        </div>
      )}

      {/* ================= DESKTOP ================= */}
      {filteredUsers.length > 0 && (

        <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Provider</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredUsers.map(user => (

                <tr key={user._id} className="border-b hover:bg-gray-50">

                  <td className="p-3 flex items-center gap-2">
                    <User size={16} className="text-blue-600" />
                    {user.name || "No Name"}
                  </td>

                  <td className="p-3 text-gray-600">
                    {user.email || user.phone || "N/A"}
                  </td>

                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                      {user.authProvider}
                    </span>
                  </td>

                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.isBlocked
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}>
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>

                  <td className="p-3">
                    <button
                      disabled={actionLoading === user._id}
                      onClick={() => toggleBlock(user._id, user.isBlocked)}
                      className={`px-3 py-1 rounded text-xs flex items-center gap-1 ${
                        user.isBlocked
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {actionLoading === user._id ? (
                        "..."
                      ) : user.isBlocked ? (
                        <>
                          <ShieldCheck size={14} /> Unblock
                        </>
                      ) : (
                        <>
                          <ShieldOff size={14} /> Block
                        </>
                      )}
                    </button>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

      {/* ================= MOBILE ================= */}
      <div className="grid gap-4 md:hidden">

        {filteredUsers.map(user => (

          <div key={user._id} className="bg-white p-4 rounded-xl shadow space-y-2">

            <div className="flex justify-between items-center">

              <span className="font-semibold text-blue-600">
                {user.name || "User"}
              </span>

              <span className={`text-xs px-2 py-1 rounded ${
                user.isBlocked
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
              }`}>
                {user.isBlocked ? "Blocked" : "Active"}
              </span>

            </div>

            <div className="text-sm text-gray-600">
              {user.email || user.phone}
            </div>

            <button
              onClick={() => toggleBlock(user._id, user.isBlocked)}
              className={`w-full py-2 rounded text-sm ${
                user.isBlocked
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {user.isBlocked ? "Unblock" : "Block"}
            </button>

          </div>

        ))}

      </div>

    </div>

  );

}

export default React.memo(ManageUsers);