import React, { useEffect, useState, useCallback } from "react";
import { Plus, Edit, Trash2, BookOpen, RefreshCw, X, ChevronDown } from "lucide-react";
import API from "../../services/api";

function ManageBatches() {
  const [batches, setBatches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbPreview, setThumbPreview] = useState("");

  const emptyForm = { name: "", description: "", classId: "", streamId: "", subjects: [], price: "", originalPrice: "", isFeatured: false, order: 0 };
  const [form, setForm] = useState(emptyForm);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [br, cr, sr, subr] = await Promise.all([
        API.get("/batches?limit=50"),
        API.get("/classes"),
        API.get("/streams"),
        API.get("/subjects"),
      ]);
      setBatches(br.data?.batches || []);
      setClasses(cr.data?.classes || cr.data?.data || []);
      setStreams(sr.data?.streams || sr.data?.data || []);
      setSubjects(subr.data?.subjects || subr.data?.data || []);
    } catch { showMsg("Failed to load data", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredStreams = streams.filter((s) =>
    s.classId?._id === form.classId || s.classId === form.classId
  );

  const filteredSubjects = subjects.filter((s) => {
    if (!form.classId) return true;
    const cId = s.classId?._id || s.classId;
    if (cId?.toString() !== form.classId?.toString()) return false;
    if (form.streamId) {
      const sId = s.streamId?._id || s.streamId;
      return !sId || sId?.toString() === form.streamId?.toString();
    }
    return true;
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setThumbnail(null); setThumbPreview(""); setModalOpen(true); };
  const openEdit = (b) => {
    setEditing(b);
    setForm({
      name: b.name || "",
      description: b.description || "",
      classId: b.classId?._id || b.classId || "",
      streamId: b.streamId?._id || b.streamId || "",
      subjects: b.subjects?.map(s => s._id || s) || [],
      price: b.price || "",
      originalPrice: b.originalPrice || "",
      isFeatured: b.isFeatured || false,
      order: b.order || 0,
    });
    setThumbPreview(b.thumbnail || "");
    setThumbnail(null);
    setModalOpen(true);
  };

  const handleThumbChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const toggleSubject = (id) => {
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(id)
        ? f.subjects.filter((s) => s !== id)
        : [...f.subjects, id],
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.classId || form.price === "") {
      showMsg("Name, class, and price are required", "error"); return;
    }

    const selectedClass = classes.find(c => c._id === form.classId);
    if (selectedClass?.hasStreams && !form.streamId) {
      showMsg("Stream is required for this class", "error"); return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "subjects") {
          v.forEach((s) => fd.append("subjects", s));
        } else {
          fd.append(k, v);
        }
      });
      if (thumbnail) fd.append("thumbnail", thumbnail);

      if (editing) {
        await API.put(`/batches/${editing._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        showMsg("Batch updated successfully");
      } else {
        await API.post("/batches", fd, { headers: { "Content-Type": "multipart/form-data" } });
        showMsg("Batch created successfully");
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      showMsg(err.response?.data?.message || "Save failed", "error");
    } finally { setSaving(false); }
  };

  const handleDelete = async (b) => {
    if (!window.confirm(`Delete batch "${b.name}"? This cannot be undone.`)) return;
    setDeleting(b._id);
    try {
      await API.delete(`/batches/${b._id}`);
      showMsg("Batch deleted");
      fetchAll();
    } catch { showMsg("Delete failed", "error"); }
    finally { setDeleting(null); }
  };

  const formatPrice = (p) => `₹${Number(p).toLocaleString("en-IN")}`;

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Batches</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage study batch packages</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchAll} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition shadow-sm">
            <Plus size={18} /> New Batch
          </button>
        </div>
      </div>

      {/* Messages */}
      {msg.text && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${msg.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
          {msg.text}
        </div>
      )}

      {/* Batches Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="bg-gray-100 h-48 rounded-2xl animate-pulse" />)}
        </div>
      ) : batches.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium mb-2">No batches yet</p>
          <button onClick={openCreate}
            className="text-blue-600 font-medium hover:text-blue-700 text-sm">
            + Create your first batch
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {batches.map((b) => (
            <div key={b._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="h-32 bg-gradient-to-br from-blue-100 to-indigo-100 relative overflow-hidden">
                {b.thumbnail ? (
                  <img src={b.thumbnail} alt={b.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="text-blue-300" size={40} />
                  </div>
                )}
                {b.isFeatured && (
                  <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold">⭐ Featured</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  {b.classId && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Class {b.classId.classNumber}</span>}
                  {b.streamId && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{b.streamId.name}</span>}
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{b.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-600">{formatPrice(b.price)}</span>
                  <span className="text-xs text-gray-400">{b.subjects?.length || 0} subjects</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(b)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs border border-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-50 transition font-medium">
                    <Edit size={12} /> Edit
                  </button>
                  <button onClick={() => handleDelete(b)} disabled={deleting === b._id}
                    className="flex-1 flex items-center justify-center gap-1 text-xs border border-red-200 text-red-500 py-2 rounded-xl hover:bg-red-50 transition font-medium disabled:opacity-50">
                    <Trash2 size={12} /> {deleting === b._id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editing ? "Edit Batch" : "Create New Batch"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={22} />
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Thumbnail</label>
                <div className="flex items-center gap-4">
                  {thumbPreview && <img src={thumbPreview} alt="preview" className="w-20 h-20 rounded-xl object-cover border border-gray-200" />}
                  <label className="cursor-pointer flex items-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl px-4 py-3 text-sm text-gray-500 hover:text-blue-600 transition">
                    <Plus size={16} /> Upload Image
                    <input type="file" accept="image/*" onChange={handleThumbChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Batch Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Class 11 PCM Complete Notes"
                  className="w-full border-2 border-gray-200 focus:border-blue-500 p-3 rounded-xl outline-none transition text-sm" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What does this batch include?"
                  rows={3}
                  className="w-full border-2 border-gray-200 focus:border-blue-500 p-3 rounded-xl outline-none transition text-sm resize-none" />
              </div>

              {/* Class + Stream */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Class *</label>
                  <select value={form.classId}
                    onChange={(e) => setForm({ ...form, classId: e.target.value, streamId: "", subjects: [] })}
                    className="w-full border-2 border-gray-200 focus:border-blue-500 p-3 rounded-xl outline-none transition text-sm bg-white">
                    <option value="">Select Class</option>
                    {classes.map(c => (
                      <option key={c._id} value={c._id}>Class {c.classNumber || c.name}</option>
                    ))}
                  </select>
                </div>
                {filteredStreams.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Stream *</label>
                    <select value={form.streamId}
                      onChange={(e) => setForm({ ...form, streamId: e.target.value, subjects: [] })}
                      className="w-full border-2 border-gray-200 focus:border-blue-500 p-3 rounded-xl outline-none transition text-sm bg-white">
                      <option value="">Select Stream</option>
                      {filteredStreams.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Subjects */}
              {filteredSubjects.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subjects Included</label>
                  <div className="flex flex-wrap gap-2">
                    {filteredSubjects.map((sub) => (
                      <button key={sub._id} type="button"
                        onClick={() => toggleSubject(sub._id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition capitalize ${
                          form.subjects.includes(sub._id)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                        }`}>
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹) *</label>
                  <input type="number" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="e.g. 999"
                    className="w-full border-2 border-gray-200 focus:border-blue-500 p-3 rounded-xl outline-none transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Original Price (₹)</label>
                  <input type="number" value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    placeholder="e.g. 1499 (for discount)"
                    className="w-full border-2 border-gray-200 focus:border-blue-500 p-3 rounded-xl outline-none transition text-sm" />
                </div>
              </div>

              {/* Featured + Order */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Featured Batch</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Sort Order:</label>
                  <input type="number" value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                    className="w-16 border-2 border-gray-200 p-2 rounded-lg text-sm outline-none text-center" />
                </div>
              </div>

            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                {saving ? "Saving..." : editing ? "Update Batch" : "Create Batch"}
              </button>
              <button onClick={() => setModalOpen(false)}
                className="px-6 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageBatches;
