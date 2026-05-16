import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import {
  FileText, Download, Eye, Search, ChevronLeft, ChevronRight,
  Clock, BookOpen, X, Loader2, AlertCircle, Sparkles
} from "lucide-react";
import { getPDFsBySubject } from "../services/pdfService";
import API from "../services/api";

const TABS = [
  { key: "all", label: "All" },
  { key: "notes", label: "Notes" },
  { key: "sample", label: "Sample Paper" },
  { key: "pyq", label: "PYQ" },
  { key: "assignment", label: "Assignment" },
];

const CATEGORY_COLORS = {
  notes: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  sample: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  pyq: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  assignment: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
};

const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

function PDFCard({ pdf, onPreview, previewLoading }) {
  const cat = CATEGORY_COLORS[pdf.category] || CATEGORY_COLORS.notes;
  const label = TABS.find((t) => t.key === pdf.category)?.label || pdf.category;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <FileText size={20} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{pdf.title}</h3>
          <span className={"inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full mt-1.5 " + cat.bg + " " + cat.text}>
            <span className={"w-1.5 h-1.5 rounded-full " + cat.dot} />{label}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
        <span className="flex items-center gap-1"><Clock size={11} />{formatDate(pdf.createdAt)}</span>
        <span>{formatFileSize(pdf.fileSize)}</span>
      </div>
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onPreview(pdf)}
          disabled={previewLoading}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium transition disabled:opacity-50"
        >
          {previewLoading ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />} Preview
        </button>
        <a
          href={pdf.fileUrl}
          download
          target="_blank"
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-medium transition"
        >
          <Download size={13} /> Download
        </a>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-full mb-4" />
      <div className="flex gap-2">
        <div className="flex-1 h-8 bg-gray-100 rounded-xl" />
        <div className="flex-1 h-8 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

function SubjectPDFs() {
  const { subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const batchId = searchParams.get("batchId");
  const subjectName = searchParams.get("subject") || "Subject";
  const batchName = searchParams.get("batch") || "Batch";

  const [pdfs, setPdfs] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const handlePreview = async (pdf) => {
    try {
      setPreviewLoading(true);
      const res = await API.post("/pdf/token/" + pdf._id);
      window.open(res.data.url, "_blank");
    } catch (e) {
      alert("PDF load failed. Please try Download instead.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const fetchPDFs = useCallback(async () => {
    if (!batchId) { setError("Batch ID missing"); setLoading(false); return; }
    try {
      setLoading(true);
      setError("");
      const res = await getPDFsBySubject(subjectId, {
        batchId,
        category: activeTab === "all" ? undefined : activeTab,
        search: search || undefined,
        page,
        limit: 12,
      });
      setPdfs(res.data?.pdfs || []);
      setRecent(res.data?.recent || []);
      setPagination(res.data?.pagination || {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load PDFs");
    } finally {
      setLoading(false);
    }
  }, [subjectId, batchId, activeTab, search, page]);

  useEffect(() => { fetchPDFs(); }, [fetchPDFs]);
  useEffect(() => { setPage(1); }, [activeTab, search]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput.trim()); };
  const handleTabChange = (key) => { setActiveTab(key); setSearch(""); setSearchInput(""); };
  const tabCounts = pdfs.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition">
              <ChevronLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 capitalize">{subjectName}</h1>
              <p className="text-xs text-gray-400">{batchName} · Study Materials</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {recent.length > 0 && !loading && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} />
              <span className="text-sm font-semibold">Recently Added</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {recent.map((r) => (
                <div key={r._id} className="bg-white/15 rounded-xl px-3 py-2 text-sm font-medium truncate">{r.title}</div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search PDFs..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(""); setSearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <X size={14} />
              </button>
            )}
          </div>
          <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">Search</button>
        </form>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={"flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all " + (activeTab === tab.key ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300")}
            >
              {tab.label}
              {tab.key !== "all" && tabCounts[tab.key] > 0 && (
                <span className={"ml-1.5 text-xs " + (activeTab === tab.key ? "opacity-80" : "text-gray-400")}>({tabCounts[tab.key]})</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <p className="text-gray-500 mb-2">{error}</p>
            {error.includes("Purchase") && (
              <Link to="/batches" className="text-blue-600 text-sm font-medium hover:underline">Back to Batches</Link>
            )}
          </div>
        ) : pdfs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No PDFs found</p>
            <p className="text-gray-400 text-sm mt-1">{search ? "No results for " + search : "No materials uploaded yet"}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">{pagination.total || pdfs.length} PDF{(pagination.total || pdfs.length) !== 1 ? "s" : ""} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pdfs.map((pdf) => (
                <PDFCard key={pdf._id} pdf={pdf} onPreview={handlePreview} previewLoading={previewLoading} />
              ))}
            </div>
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-gray-400 text-sm">...</span>}
                      <button onClick={() => setPage(p)} className={"w-9 h-9 rounded-xl text-sm font-medium transition " + (p === page ? "bg-blue-600 text-white" : "border border-gray-200 hover:bg-gray-50 text-gray-700")}>
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
                <button disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SubjectPDFs;
