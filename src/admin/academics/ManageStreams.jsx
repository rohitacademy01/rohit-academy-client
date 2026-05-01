import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { Plus, Trash2 } from "lucide-react";

function ManageStreams() {

  const [streams, setStreams] = useState([]);
  const [classes, setClasses] = useState([]);

  const [form, setForm] = useState({
    name: "",
    classId: ""
  });

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     📦 FETCH DATA
  ========================= */
  const fetchData = async () => {
    try {

      setLoading(true);
      setError("");

      const [streamRes, classRes] = await Promise.all([
        API.get("/streams"),
        API.get("/classes")   // ✅ FIXED ENDPOINT
      ]);

      setStreams(streamRes.data?.data || []);
      setClasses(classRes.data?.data || []);

    } catch (err) {

      console.error("Streams load error:", err);
      setError("Failed to load streams");

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* =========================
     ➕ ADD STREAM
  ========================= */
  const handleAdd = async (e) => {

    e.preventDefault();

    if (!form.name.trim() || !form.classId) {
      setError("All fields required");
      return;
    }

    try {

      setAdding(true);
      setError("");

      await API.post("/streams", {
        name: form.name.trim(),
        classId: form.classId
      });

      setForm({
        name: "",
        classId: ""
      });

      fetchData();

    } catch (err) {

      console.error("Add stream error:", err);

      setError(
        err.response?.data?.message ||
        "Failed to add stream"
      );

    } finally {

      setAdding(false);

    }
  };

  /* =========================
     ❌ DELETE STREAM
  ========================= */
  const handleDelete = async (id) => {

    if (!window.confirm("Delete this stream?")) return;

    try {

      await API.delete(`/streams/${id}`);

      setStreams((prev) =>
        prev.filter((s) => s._id !== id)
      );

    } catch (err) {

      console.error("Delete stream error:", err);
      setError("Delete failed");

    }
  };

  /* =========================
     ⏳ LOADING
  ========================= */
  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading Streams...
      </div>
    );
  }

  return (

    <div className="p-4 md:p-6">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">
        Manage Streams
      </h1>

      {/* ERROR */}
      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}

      {/* ================= ADD FORM ================= */}
      <form
        onSubmit={handleAdd}
        className="bg-white p-4 rounded-xl shadow mb-6 flex flex-col md:flex-row gap-4"
      >

        {/* STREAM NAME */}
        <input
          type="text"
          placeholder="Stream Name (e.g. PCB)"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value
            })
          }
          className="border p-3 rounded-lg flex-1"
        />

        {/* CLASS SELECT */}
        <select
          value={form.classId}
          onChange={(e) =>
            setForm({
              ...form,
              classId: e.target.value
            })
          }
          className="border p-3 rounded-lg"
        >

          <option value="">
            Select Class
          </option>

          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name} {/* ✅ double Class fix */}
            </option>
          ))}

        </select>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={adding}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-60"
        >

          <Plus size={18} />

          {adding ? "Adding..." : "Add"}

        </button>

      </form>

      {/* ================= LIST ================= */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        {streams.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No streams added yet
          </div>
        ) : (

          <table className="w-full">

            <thead className="bg-gray-100 text-left">

              <tr>
                <th className="p-3">Stream</th>
                <th className="p-3">Class</th>
                <th className="p-3 text-right">Action</th>
              </tr>

            </thead>

            <tbody>

              {streams.map((stream) => (

                <tr key={stream._id} className="border-t">

                  <td className="p-3 font-medium">
                    {stream.name}
                  </td>

                  <td className="p-3">
                    {stream.classId?.name || "-"} {/* ✅ double Class fix */}
                  </td>

                  <td className="p-3 text-right">

                    <button
                      onClick={() => handleDelete(stream._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>

  );
}

export default ManageStreams;