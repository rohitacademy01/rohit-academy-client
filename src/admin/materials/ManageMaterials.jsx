import React, { useEffect, useState, useMemo } from "react";
import {
  Trash2,
  Pencil,
  FileText,
  Plus,
  RefreshCw,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function ManageMaterials() {

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  /* ===============================
     📦 FETCH
  ============================== */
  const fetchMaterials = async (silent = false) => {

    try {

      if (!silent) setLoading(true);
      setRefreshing(true);
      setError("");

      const res = await API.get("/materials?admin=true");

      const data = res.data?.data || [];

      const sorted = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setMaterials(sorted);

    } catch (err) {

      console.error(err);

      if (!silent) {
        setError("Failed to load materials");
      }

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };

  useEffect(() => {
    fetchMaterials();

    const interval = setInterval(() => {
      fetchMaterials(true);
    }, 30000);

    return () => clearInterval(interval);

  }, []);

  /* ===============================
     🔍 SEARCH FILTER
  ============================== */
  const filteredMaterials = useMemo(() => {

    if (!search.trim()) return materials;

    return materials.filter((m) =>
      m.title.toLowerCase().includes(search.toLowerCase())
    );

  }, [materials, search]);

  /* ===============================
     ❌ DELETE
  ============================== */
  const handleDelete = async (id) => {

    if (!window.confirm("Delete this material?")) return;

    try {

      setDeletingId(id);

      await API.delete(`/materials/${id}`);

      setMaterials(prev => prev.filter(m => m._id !== id));

    } catch (err) {

      console.error(err);
      alert(err.response?.data?.message || "Delete failed");

    } finally {

      setDeletingId(null);

    }

  };

  /* ===============================
     💰 FORMAT
  ============================== */
  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  /* ===============================
     ⏳ LOADING
  ============================== */
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-4 p-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white p-5 rounded-xl shadow animate-pulse">
            <div className="h-5 bg-gray-200 mb-2 rounded"></div>
            <div className="h-4 bg-gray-300 w-2/3 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (

    <div>

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

        <h1 className="text-2xl md:text-3xl font-bold">
          Manage Materials
        </h1>

        <div className="flex gap-2 flex-wrap">

          {/* 🔍 SEARCH */}
          <div className="flex items-center border px-3 rounded-lg bg-white">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search material..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-2 outline-none"
            />
          </div>

          {/* 🔄 REFRESH */}
          <button
            onClick={() => fetchMaterials()}
            className="flex items-center gap-2 bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>

          {/* ➕ ADD */}
          <button
            onClick={() => navigate("/admin/materials/upload")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} /> Upload
          </button>

        </div>

      </div>

      {/* ❌ ERROR */}
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-center">
          {error}
        </div>
      )}

      {/* EMPTY */}
      {filteredMaterials.length === 0 && !error && (
        <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">
          No materials found
        </div>
      )}

      {/* ================= DESKTOP ================= */}
      {filteredMaterials.length > 0 && (

        <div className="hidden md:block bg-white shadow rounded-xl overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3">Class</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Type</th>
                <th className="p-3">Title</th>
                <th className="p-3">Price</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredMaterials.map((m) => (

                <tr key={m._id} className="border-b hover:bg-gray-50">

                  <td className="p-3">{m.classId?.name}</td>
                  <td className="p-3">{m.subjectId?.name}</td>
                  <td className="p-3">{m.type}</td>

                  <td className="p-3 flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    {m.title}
                  </td>

                  <td className="p-3 font-semibold text-blue-600">
                    {formatPrice(m.price)}
                  </td>

                  <td className="p-3 flex justify-center gap-4">

                    <button
                      onClick={() => navigate(`/admin/materials/edit/${m._id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      disabled={deletingId === m._id}
                      onClick={() => handleDelete(m._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      {deletingId === m._id ? "..." : <Trash2 size={18} />}
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

        {filteredMaterials.map((m) => (

          <div key={m._id} className="bg-white shadow rounded-xl p-4">

            <div className="flex items-center gap-2 font-semibold text-blue-600">
              <FileText size={18} />
              {m.title}
            </div>

            <p className="text-sm text-gray-600">
              {m.classId?.name} • {m.subjectId?.name}
            </p>

            <p className="text-sm text-gray-600">
              {m.type}
            </p>

            <div className="flex justify-between mt-3">

              <span className="font-bold text-blue-600">
                {formatPrice(m.price)}
              </span>

              <div className="flex gap-4">

                <button
                  onClick={() => navigate(`/admin/materials/edit/${m._id}`)}
                  className="text-blue-600"
                >
                  <Pencil size={18} />
                </button>

                <button
                  disabled={deletingId === m._id}
                  onClick={() => handleDelete(m._id)}
                  className="text-red-500"
                >
                  {deletingId === m._id ? "..." : <Trash2 size={18} />}
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default React.memo(ManageMaterials);