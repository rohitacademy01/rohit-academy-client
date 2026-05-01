import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  GraduationCap,
  Loader2,
  Check
} from "lucide-react";
import API from "../../services/api";

function ManageClasses() {

  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState("");
  const [requiresStream, setRequiresStream] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  /* ================= FETCH ================= */
  const fetchClasses = async () => {

    try {

      setLoading(true);

      const res = await API.get("/classes");

      const list = res.data?.data || [];

      const sorted = [...list].sort(
        (a, b) => Number(a.name) - Number(b.name)
      );

      setClasses(sorted);

    } catch (err) {

      console.error(err);
      setError("Failed to load classes");

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  /* ================= INPUT CHANGE ================= */
  const handleClassInput = (value) => {

    setError("");

    setNewClass(value);

    const num = parseInt(value);

    if (!isNaN(num) && num >= 11) {
      setRequiresStream(true);
    } else {
      setRequiresStream(false);
    }
  };

  /* ================= ADD ================= */
  const handleAddClass = async () => {

    const name = newClass.trim();

    if (!name) return;

    /* 🔥 NUMERIC VALIDATION */
    if (!/^\d+$/.test(name)) {
      setError("Class must be numeric (e.g. 9, 10, 11)");
      return;
    }

    const exists = classes.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      setError("Class already exists");
      return;
    }

    try {

      setAdding(true);
      setError("");

      await API.post("/classes", {
        name,
        requiresStream
      });

      setNewClass("");
      setRequiresStream(false);

      fetchClasses();

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Add failed"
      );

    } finally {

      setAdding(false);

    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id, name) => {

    if (!window.confirm(`Delete "${name}"?`)) return;

    try {

      await API.delete(`/classes/${id}`);

      setClasses((prev) =>
        prev.filter((c) => c._id !== id)
      );

    } catch (err) {

      console.error(err);
      setError("Delete failed");

    }
  };

  /* ================= EDIT START ================= */
  const handleEditStart = (cls) => {

    setError("");
    setEditingId(cls._id);
    setEditingValue(cls.name);

  };

  /* ================= EDIT SAVE ================= */
  const handleEditSave = async () => {

    const name = editingValue.trim();

    if (!name) return;

    /* 🔥 NUMERIC VALIDATION */
    if (!/^\d+$/.test(name)) {
      setError("Class must be numeric");
      return;
    }

    const exists = classes.find(
      (c) =>
        c.name.toLowerCase() === name.toLowerCase() &&
        c._id !== editingId
    );

    if (exists) {
      setError("Class already exists");
      return;
    }

    const num = parseInt(name);
    const requiresStreamUpdate = !isNaN(num) && num >= 11;

    try {

      await API.put(`/classes/${editingId}`, {
        name,
        requiresStream: requiresStreamUpdate
      });

      setClasses((prev) =>
        prev.map((c) =>
          c._id === editingId
            ? { ...c, name, requiresStream: requiresStreamUpdate }
            : c
        )
      );

      setEditingId(null);
      setEditingValue("");

    } catch (err) {

      console.error(err);
      setError("Update failed");

    }
  };

  return (

    <div className="max-w-5xl mx-auto px-4 sm:px-6">

      <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
        <GraduationCap className="text-blue-600" />
        Manage Classes
      </h1>

      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}

      {/* ================= ADD ================= */}

      <div className="flex flex-col gap-3 mb-8">

        <div className="flex gap-3">

          <input
            type="number"
            placeholder="Enter class (e.g. 9, 10, 11, 12)"
            value={newClass}
            onChange={(e) =>
              handleClassInput(e.target.value)
            }
            className="border p-3 rounded-lg flex-1"
          />

          <button
            onClick={handleAddClass}
            disabled={adding}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center gap-2"
          >

            {adding ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Plus size={18} /> Add
              </>
            )}

          </button>

        </div>

        {requiresStream && (
          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
            ⚠️ This class will require stream selection (11th+ rule)
          </div>
        )}

      </div>

      {/* ================= LIST ================= */}

      {loading ? (

        <div className="text-center py-10 text-gray-500">
          Loading classes...
        </div>

      ) : (

        <div className="space-y-4">

          {classes.length === 0 && (
            <div className="text-gray-500">
              No classes found
            </div>
          )}

          {classes.map((cls) => (

            <div
              key={cls._id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
            >

              <div>

                {editingId === cls._id ? (

                  <input
                    type="number"
                    value={editingValue}
                    onChange={(e) =>
                      setEditingValue(e.target.value)
                    }
                    className="border p-2 rounded w-40"
                    autoFocus
                  />

                ) : (

                  <>
                    <span className="font-semibold text-lg">
                      {cls.name}
                    </span>

                    {cls.requiresStream && (
                      <span className="ml-3 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                        Stream Required
                      </span>
                    )}
                  </>

                )}

              </div>

              <div className="flex gap-4">

                {editingId === cls._id ? (

                  <button
                    onClick={handleEditSave}
                    className="text-green-600"
                  >
                    <Check size={20} />
                  </button>

                ) : (

                  <button
                    onClick={() => handleEditStart(cls)}
                    className="text-blue-600"
                  >
                    <Edit2 size={20} />
                  </button>

                )}

                <button
                  onClick={() =>
                    handleDelete(cls._id, cls.name)
                  }
                  className="text-red-500"
                >
                  <Trash2 size={20} />
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}

export default ManageClasses;