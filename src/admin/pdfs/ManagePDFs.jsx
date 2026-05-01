import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Upload, Trash2, Pencil, FileText, Search, RefreshCw,
  X, CheckCircle, AlertCircle, Loader2, Eye, ChevronLeft, ChevronRight, Filter
} from "lucide-react";
import API from "../../services/api";
import { adminGetAllPDFs, adminUploadPDF, adminUpdatePDF, adminDeletePDF } from "../../services/pdfService";

/* =====================================
   CONSTANTS
===================================== */
const CATEGORIES = [
  { value: "notes", label: "Notes" },
  { value: "sample", label: "Sample Paper" },
  { value: "pyq", label: "PYQ" },
  { value: "assignment", label: "Assignment" },
];

const CATEGORY_BADGE = {
  notes: "bg-blue-100 text-blue-700",
  sample: "bg-purple-100 text-purple-700",
  pyq: "bg-amber-100 text-amber-700",
  assignment: "bg-green-100 text-green-700",
};

const formatSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

/* =====================================
   TOAST
===================================== */
function Toast({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all animate-fade-in ${
            t.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {t.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {t.message}
          <button onClick={() => onRemove(t.id)} className="ml-2 opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* =====================================
   UPLOAD MODAL
===================================== */
function UploadModal({ onClose, onSuccess, addToast }) {
  const fileRef = useRef(null);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState({ batchId: "", subjectId: "", title: "", category: "" });
  const [file, setFile] = useState(null);

  useEffect(() => {
    API.get("/batches?limit=100").then((r) => setBatches(r.data?.batches || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.batchId) { setSubjects([]); return; }
    const batch = batches.find((b) => b._id === form.batchId);
    if (batch?.subjects?.length) setSubjects(batch.subjects);
    else setSubjects([]);
    setForm((p) => ({ ...p, subjectId: "" }));
  }, [form.batchId, batches]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { addToast("Please select a PDF file", "error"); return; }
    if (!form.batchId || !form.subjectId || !form.title || !form.category) {
      addToast("All fields are required", "error"); return;
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", form.title);
    fd.append("batchId", form.batchId);
    fd.append("subjectId", form.subjectId);
    fd.append("category", form.category);

    try {
      setLoading(true);
      await adminUploadPDF(fd, (ev) => setProgress(Math.round((ev.loaded / ev.total) * 100)));
      addToast("PDF uploaded successfully", "success");
      onSuccess();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || "Upload failed", "error");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Upload size={18} className="text-blue-600" /> Upload PDF
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Batch */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Batch *</label>
            <select
              value={form.batchId}
              onChange={(e) => setForm((p) => ({ ...p, batchId: e.target.value }))}
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Batch</option>
              {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject *</label>
            <select
              value={form.subjectId}
              onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value }))}
              required
              disabled={!form.batchId}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            {form.batchId && subjects.length === 0 && (
              <p className="text-xs text-amber-500 mt-1">No subjects linked to this batch. Please add subjects first.</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Chapter 1 — Motion Notes"
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* File */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">PDF File * (max 20MB)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
                file ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <FileText size={18} />
                  <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-blue-400">({formatSize(file.size)})</span>
                </div>
              ) : (
                <div className="text-gray-400">
                  <Upload size={24} className="mx-auto mb-2" />
                  <p className="text-sm">Click to select PDF</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          {loading && progress > 0 && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Uploading...</span><span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : <><Upload size={16} /> Upload PDF</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =====================================
   EDIT MODAL
===================================== */
function EditModal({ pdf, onClose, onSuccess, addToast }) {
  const fileRef = useRef(null);
  const [form, setForm] = useState({ title: pdf.title, category: pdf.category });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("category", form.category);
    if (file) fd.append("file", file);

    try {
      setLoading(true);
      await adminUpdatePDF(pdf._id, fd);
      addToast("PDF updated successfully", "success");
      onSuccess();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Pencil size={16} className="text-blue-600" /> Edit PDF
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Replace PDF File (optional)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                file ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files[0] || null)} />
              {file ? (
                <span className="text-sm text-blue-600 font-medium">{file.name}</span>
              ) : (
                <span className="text-sm text-gray-400">Click to replace file</span>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =====================================
   MAIN COMPONENT
===================================== */
function ManagePDFs() {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [editPdf, setEditPdf] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  const fetchPDFs = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await adminGetAllPDFs({
        category: filterCategory || undefined,
        search: search || undefined,
        page,
        limit: 15,
      });
      setPdfs(res.data?.pdfs || []);
      setPagination(res.data?.pagination || {});
    } catch {
      addToast("Failed to load PDFs", "error");
    } finally {
      setLoading(false);
    }
  }, [filterCategory, search, page, addToast]);

  useEffect(() => { fetchPDFs(); }, [fetchPDFs]);

  const handleDelete = async (pdf) => {
    if (!window.confirm(`Delete "${pdf.title}"? This cannot be undone.`)) return;
    try {
      setDeletingId(pdf._id);
      await adminDeletePDF(pdf._id);
      addToast("PDF deleted successfully", "success");
      fetchPDFs(true);
    } catch (err) {
      addToast(err.response?.data?.message || "Delete failed", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <span className="font-semibold text-sm text-gray-700">PDF Preview</span>
              <button onClick={() => setPreviewUrl(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1">
              <iframe src={previewUrl} className="w-full h-full border-0" title="Preview" />
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => fetchPDFs(true)}
          addToast={addToast}
        />
      )}

      {/* Edit Modal */}
      {editPdf && (
        <EditModal
          pdf={editPdf}
          onClose={() => setEditPdf(null)}
          onSuccess={() => fetchPDFs(true)}
          addToast={addToast}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Study Materials</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {pagination.total ?? pdfs.length} PDFs uploaded
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
        >
          <Upload size={16} /> Upload PDF
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search PDFs..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <button
          onClick={() => fetchPDFs(true)}
          className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition flex-shrink-0"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      ) : pdfs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <FileText size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">No PDFs found</p>
          <p className="text-gray-400 text-sm mt-1">Upload your first PDF to get started</p>
          <button
            onClick={() => setShowUpload(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            Upload PDF
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/60">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Subject</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Batch</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Category</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Size</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Date</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pdfs.map((pdf) => (
                  <tr key={pdf._id} className="hover:bg-gray-50/50 transition group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText size={14} className="text-blue-500" />
                        </div>
                        <span className="font-medium text-gray-800 truncate max-w-[200px]">{pdf.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 capitalize">{pdf.subjectId?.name || "—"}</td>
                    <td className="px-4 py-3.5 text-gray-600 truncate max-w-[120px]">{pdf.batchId?.name || "—"}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_BADGE[pdf.category] || "bg-gray-100 text-gray-600"}`}>
                        {CATEGORIES.find((c) => c.value === pdf.category)?.label || pdf.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{formatSize(pdf.fileSize)}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">{formatDate(pdf.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewUrl(pdf.fileUrl)}
                          title="Preview"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setEditPdf(pdf)}
                          title="Edit"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(pdf)}
                          disabled={deletingId === pdf._id}
                          title="Delete"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:opacity-40 transition"
                        >
                          {deletingId === pdf._id
                            ? <Loader2 size={15} className="animate-spin" />
                            : <Trash2 size={15} />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-50">
              <p className="text-xs text-gray-400">
                Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-sm text-gray-600 px-2">{page} / {pagination.pages}</span>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ManagePDFs;
