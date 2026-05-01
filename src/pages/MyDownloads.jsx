import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Download, FileText, BookOpen, ExternalLink, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

function MyDownloads() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [batchMaterials, setBatchMaterials] = useState({});
  const [matLoading, setMatLoading] = useState({});

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const res = await API.get("/batches/user/my-batches");
        setBatches(res.data?.batches || []);
      } catch { setBatches([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const loadBatchMaterials = async (batchId) => {
    if (batchMaterials[batchId]) { setExpandedBatch(batchId === expandedBatch ? null : batchId); return; }
    try {
      setMatLoading((prev) => ({ ...prev, [batchId]: true }));
      const res = await API.get(`/batches/${batchId}/materials`);
      setBatchMaterials((prev) => ({ ...prev, [batchId]: res.data?.materials || [] }));
      setExpandedBatch(batchId);
    } catch { }
    finally { setMatLoading((prev) => ({ ...prev, [batchId]: false })); }
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Downloads</h1>
            <p className="text-gray-500 text-sm mt-1">Access all PDFs from your purchased batches</p>
          </div>
          <Link to="/batches"
            className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition font-medium">
            + Buy More
          </Link>
        </div>

        {batches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No purchases yet</h3>
            <p className="text-gray-400 mb-6">Buy a batch to get instant access to premium PDFs</p>
            <Link to="/batches"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition shadow-lg">
              Browse Batches <ChevronRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {batches.map((batch) => (
              <div key={batch._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Batch Header */}
                <button
                  onClick={() => loadBatchMaterials(batch._id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition group">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="text-white" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{batch.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {batch.classId && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          Class {batch.classId.classNumber}
                        </span>
                      )}
                      {batch.streamId && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          {batch.streamId.name}
                        </span>
                      )}
                      {batch.subjects?.length > 0 && (
                        <span className="text-xs text-gray-400">{batch.subjects.length} subjects</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {matLoading[batch._id] ? (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ChevronRight size={18} className={`text-gray-400 transition-transform ${expandedBatch === batch._id ? "rotate-90" : ""}`} />
                    )}
                  </div>
                </button>

                {/* Materials List */}
                {expandedBatch === batch._id && batchMaterials[batch._id] && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {batchMaterials[batch._id].length === 0 ? (
                      <div className="p-8 text-center text-gray-400">
                        <FileText size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No materials uploaded yet for this batch</p>
                      </div>
                    ) : (
                      batchMaterials[batch._id].map((mat) => (
                        <div key={mat._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition">
                          <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="text-red-500" size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{mat.title}</p>
                            <p className="text-xs text-gray-400">
                              {mat.subjectId?.name && <span className="capitalize">{mat.subjectId.name}</span>}
                              {mat.type && <span> · {mat.type}</span>}
                              {mat.pages > 0 && <span> · {mat.pages} pages</span>}
                            </p>
                          </div>
                          <a
                            href={mat.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-blue-600 text-white text-xs px-4 py-2 rounded-xl hover:bg-blue-700 transition font-medium flex-shrink-0"
                          >
                            <Download size={13} /> Download
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyDownloads;
