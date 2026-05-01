import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Search,
  Layers
} from "lucide-react";
import API from "../../services/api";

function ManageAcademics() {

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedClassObj, setSelectedClassObj] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState("");

  const [newSubject, setNewSubject] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  /* ================= CLASSES ================= */
  const fetchClasses = async () => {
    try {

      const res = await API.get("/classes");
      const list = res.data?.data || [];

      setClasses(list);

      if (list.length > 0) {
        setSelectedClass(list[0]._id);
        setSelectedClassObj(list[0]);
      }

    } catch {
      setError("Failed to load classes");
    }
  };

  /* ================= STREAMS ================= */
  const fetchStreams = async (classId) => {
    try {

      const res = await API.get(`/streams?classId=${classId}`);
      setStreams(res.data?.data || []);

    } catch {
      setStreams([]);
    }
  };

  /* ================= SUBJECTS ================= */
  const fetchSubjects = async (classId, streamId = "") => {

    try {

      setLoading(true);

      let url = `/subjects?classId=${classId}`;
      if (streamId) url += `&streamId=${streamId}`;

      const res = await API.get(url);

      setSubjects(res.data?.data || []);

    } catch {
      setError("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {

    const cls = classes.find(c => c._id === selectedClass);
    setSelectedClassObj(cls);

    if (!selectedClass) return;

    if (cls?.requiresStream) {
      fetchStreams(selectedClass);
    } else {
      setStreams([]);
      setSelectedStream("");
    }

    fetchSubjects(selectedClass);

  }, [selectedClass, classes]);

  useEffect(() => {
    if (selectedStream) {
      fetchSubjects(selectedClass, selectedStream);
    }
  }, [selectedStream]);

  /* ================= FILTER ================= */
  const filteredSubjects = useMemo(() => {

    if (!search.trim()) return subjects;

    return subjects.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );

  }, [subjects, search]);

  /* ================= ADD ================= */
  const addSubject = async () => {

    const name = newSubject.trim();

    if (!name) return;

    if (selectedClassObj?.requiresStream && !selectedStream) {
      setError("Select stream first");
      return;
    }

    const exists = subjects.find(
      s => s.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      setError("Subject already exists");
      return;
    }

    try {

      setAdding(true);
      setError("");

      const res = await API.post("/subjects", {
        name,
        classId: selectedClass,
        streamId: selectedStream || null
      });

      setSubjects(prev => [...prev, res.data.data]);
      setNewSubject("");

    } catch (err) {
      setError(err.response?.data?.message || "Add failed");
    } finally {
      setAdding(false);
    }
  };

  /* ================= DELETE ================= */
  const deleteSubject = async (id, name) => {

    if (!window.confirm(`Delete "${name}"?`)) return;

    try {

      await API.delete(`/subjects/${id}`);

      setSubjects(prev => prev.filter(s => s._id !== id));

    } catch {
      setError("Delete failed");
    }
  };

  /* ================= UI ================= */

  return (

    <div className="p-4 md:p-6 max-w-4xl mx-auto">

      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Manage Academics
      </h1>

      {/* ERROR */}
      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}

      {/* ================= SELECT CLASS ================= */}
      <div className="mb-4">

        <label className="block mb-2 font-semibold">
          Select Class
        </label>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border p-3 rounded-lg w-full max-w-xs"
        >
          {classes.map(cls => (
            <option key={cls._id} value={cls._id}>
              {cls.name}
            </option>
          ))}
        </select>

      </div>

      {/* ================= STREAM SELECT ================= */}
      {selectedClassObj?.requiresStream && (

        <div className="mb-6">

          <label className="block mb-2 font-semibold">
            Select Stream
          </label>

          <select
            value={selectedStream}
            onChange={(e) => setSelectedStream(e.target.value)}
            className="border p-3 rounded-lg w-full max-w-xs"
          >
            <option value="">Choose stream</option>
            {streams.map(s => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

        </div>

      )}

      {/* ================= BOX ================= */}
      <div className="bg-white p-5 rounded-xl shadow">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">

          <h2 className="font-bold text-lg flex items-center gap-2">
            <Layers size={18} /> Subjects
          </h2>

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-1 rounded"
          />

        </div>

        {/* ADD */}
        <div className="flex gap-2 mb-4">

          <input
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Enter subject"
            className="border p-2 rounded flex-1"
            onKeyDown={(e) => e.key === "Enter" && addSubject()}
          />

          <button
            onClick={addSubject}
            disabled={adding}
            className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-1"
          >
            {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          </button>

        </div>

        {/* LIST */}
        {loading ? (

          <p className="text-gray-500">Loading...</p>

        ) : filteredSubjects.length === 0 ? (

          <p className="text-gray-500">No subjects found</p>

        ) : (

          <ul className="space-y-2">

            {filteredSubjects.map(sub => (

              <li
                key={sub._id}
                className="flex justify-between items-center bg-gray-50 p-3 rounded"
              >

                <div>
                  <span className="font-medium">{sub.name}</span>

                  {sub.streamId && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      Stream
                    </span>
                  )}
                </div>

                <button
                  onClick={() => deleteSubject(sub._id, sub.name)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>

              </li>

            ))}

          </ul>

        )}

      </div>

    </div>

  );

}

export default ManageAcademics;