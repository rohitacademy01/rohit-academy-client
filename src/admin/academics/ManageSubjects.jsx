import React, { useEffect, useState } from "react";
import { Plus, Trash2, BookOpen, Loader2 } from "lucide-react";
import API from "../../services/api";

function ManageSubjects() {

  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStream, setSelectedStream] = useState("");

  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     📚 LOAD CLASSES
  ========================= */
  const fetchClasses = async () => {
    try {
      const res = await API.get("/classes");
      const list = res.data?.data || [];

      setClasses(list);

      if (list.length > 0) {
        setSelectedClass(list[0]._id);
      }

    } catch (err) {
      setError("Failed to load classes");
    }
  };

  /* =========================
     🌿 LOAD STREAMS
  ========================= */
  const fetchStreams = async (classId) => {
    try {

      const res = await API.get(`/streams?classId=${classId}`);
      const list = res.data?.data || [];

      setStreams(list);

      if (list.length > 0) {
        setSelectedStream(list[0]._id);
      } else {
        setSelectedStream("");
      }

    } catch (err) {
      console.error(err);
    }
  };

  /* =========================
     📄 LOAD SUBJECTS (🔥 NEW ROUTE)
  ========================= */
  const fetchSubjects = async (classId, streamId = null) => {
    try {

      setLoading(true);

      let url = `/subjects/${classId}`;

      if (streamId) {
        url = `/subjects/${classId}/${streamId}`;
      }

      const res = await API.get(url);

      const sorted = (res.data?.data || []).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setSubjects(sorted);

    } catch (err) {
      console.error(err);
      setError("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     🔥 CLASS CHANGE HANDLER
  ========================= */
  const handleClassChange = (classId) => {

    setSelectedClass(classId);
    setSubjects([]);
    setError("");

    const cls = classes.find(c => c._id === classId);

    if (cls?.hasStreams) {
      fetchStreams(classId);
    } else {
      setStreams([]);
      setSelectedStream("");
      fetchSubjects(classId); // direct load
    }
  };

  /* =========================
     🔥 STREAM CHANGE
  ========================= */
  const handleStreamChange = (streamId) => {

    setSelectedStream(streamId);

    if (selectedClass) {
      fetchSubjects(selectedClass, streamId);
    }
  };

  /* =========================
     EFFECTS
  ========================= */
  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      handleClassChange(selectedClass);
    }
  }, [selectedClass]);

  /* =========================
     ➕ ADD SUBJECT
  ========================= */
  const handleAddSubject = async () => {

    const name = newSubject.trim();

    if (!name) return;

    const cls = classes.find(c => c._id === selectedClass);

    if (cls?.hasStreams && !selectedStream) {
      return setError("Stream required for this class");
    }

    const exists = subjects.find(
      s => s.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      return setError("Subject already exists");
    }

    try {

      setAdding(true);
      setError("");

      await API.post("/subjects", {
        name,
        classId: selectedClass,
        streamId: cls?.hasStreams ? selectedStream : null
      });

      setNewSubject("");

      fetchSubjects(selectedClass, selectedStream);

    } catch (err) {
      setError(err.response?.data?.message || "Add failed");
    } finally {
      setAdding(false);
    }
  };

  /* =========================
     ❌ DELETE SUBJECT
  ========================= */
  const handleDelete = async (id, name) => {

    if (!window.confirm(`Delete "${name}"?`)) return;

    try {

      await API.delete(`/subjects/${id}`);

      setSubjects(prev => prev.filter(s => s._id !== id));

    } catch {
      setError("Delete failed");
    }
  };

  const selectedClassObj = classes.find(c => c._id === selectedClass);

  /* =========================
     UI
  ========================= */
  return (

    <div className="p-4 md:p-6">

      <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
        <BookOpen className="text-blue-600" /> Manage Subjects
      </h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* CLASS */}
      <select
        value={selectedClass}
        onChange={(e) => handleClassChange(e.target.value)}
        className="border p-3 rounded-lg mb-4"
      >
        {classes.map(cls => (
          <option key={cls._id} value={cls._id}>
            Class {cls.name}
          </option>
        ))}
      </select>

      {/* STREAM */}
      {selectedClassObj?.hasStreams && (
        <select
          value={selectedStream}
          onChange={(e) => handleStreamChange(e.target.value)}
          className="border p-3 rounded-lg mb-6"
        >
          <option value="">Select Stream</option>
          {streams.map(s => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      )}

      {/* ADD */}
      <div className="flex gap-3 mb-6">

        <input
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="Enter subject"
          className="border p-3 rounded flex-1"
        />

        <button
          onClick={handleAddSubject}
          disabled={adding}
          className="bg-blue-600 text-white px-4 rounded"
        >
          {adding ? <Loader2 className="animate-spin" /> : <Plus />}
        </button>

      </div>

      {/* LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : subjects.length === 0 ? (
        <p>No subjects</p>
      ) : (

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

          {subjects.map(s => (
            <div key={s._id} className="bg-white p-4 rounded shadow flex justify-between">

              <span>{s.name}</span>

              <button onClick={() => handleDelete(s._id, s.name)}>
                <Trash2 className="text-red-500" />
              </button>

            </div>
          ))}

        </div>

      )}

    </div>
  );
}

export default ManageSubjects;