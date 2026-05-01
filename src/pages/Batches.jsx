import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Filter, BookOpen, ChevronRight } from "lucide-react";
import API from "../services/api";

function Batches() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [batches, setBatches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState(searchParams.get("classId") || "");
  const [selectedStream, setSelectedStream] = useState(searchParams.get("streamId") || "");
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [cr, sr] = await Promise.all([
          API.get("/classes"),
          API.get("/streams"),
        ]);
        setClasses(cr.data?.classes || cr.data?.data || []);
        setStreams(sr.data?.streams || sr.data?.data || []);
      } catch {}
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedClass) params.set("classId", selectedClass);
        if (selectedStream) params.set("streamId", selectedStream);
        params.set("limit", "12");
        const res = await API.get(`/batches?${params.toString()}`);
        setBatches(res.data?.batches || []);
        setPagination(res.data?.pagination || {});
      } catch {
        setBatches([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, [selectedClass, selectedStream]);

  const filteredBatches = batches.filter((b) =>
    !search || b.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (p) => `₹${Number(p).toLocaleString("en-IN")}`;

  const filteredStreams = selectedClass
    ? streams.filter((s) => s.classId?._id === selectedClass || s.classId === selectedClass)
    : streams;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Study Batches</h1>
        <p className="text-gray-500">Complete subject packages — buy once, access all PDFs</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search batches..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl outline-none transition" />
          </div>
          <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedStream(""); }}
            className="px-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl outline-none transition bg-white min-w-40">
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>Class {c.classNumber || c.name}</option>
            ))}
          </select>
          {filteredStreams.length > 0 && (
            <select value={selectedStream} onChange={(e) => setSelectedStream(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl outline-none transition bg-white min-w-40">
              <option value="">All Streams</option>
              {filteredStreams.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          )}
          {(selectedClass || selectedStream || search) && (
            <button onClick={() => { setSelectedClass(""); setSelectedStream(""); setSearch(""); }}
              className="px-4 py-3 text-sm text-red-500 border-2 border-red-200 rounded-xl hover:bg-red-50 transition whitespace-nowrap">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 h-72 rounded-2xl animate-pulse" />)}
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Batches Found</h3>
          <p className="text-gray-400">Try adjusting your filters or check back later</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4 font-medium">{filteredBatches.length} batch{filteredBatches.length !== 1 ? "es" : ""} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBatches.map((batch) => (
              <BatchCard key={batch._id} batch={batch} formatPrice={formatPrice} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BatchCard({ batch, formatPrice }) {
  const disc = batch.originalPrice && batch.originalPrice > batch.price
    ? Math.round(((batch.originalPrice - batch.price) / batch.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/batches/${batch._id}`}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100 group block">
      <div className="relative h-44 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
        {batch.thumbnail ? (
          <img src={batch.thumbnail} alt={batch.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="text-blue-400" size={48} />
          </div>
        )}
        {disc > 0 && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
            {disc}% OFF
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {batch.classId && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
              Class {batch.classId.classNumber || batch.classId.name}
            </span>
          )}
          {batch.streamId && (
            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {batch.streamId.name}
            </span>
          )}
        </div>
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm leading-snug">{batch.name}</h3>
        {batch.subjects?.length > 0 && (
          <p className="text-xs text-gray-400 mb-3">{batch.subjects.slice(0, 3).map(s => s.name).join(" · ")}
            {batch.subjects.length > 3 && ` +${batch.subjects.length - 3} more`}
          </p>
        )}
        {batch.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{batch.description}</p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-xl font-extrabold text-blue-600">{formatPrice(batch.price)}</span>
            {batch.originalPrice > batch.price && (
              <span className="text-sm text-gray-400 line-through ml-2">{formatPrice(batch.originalPrice)}</span>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:gap-2 transition-all">
            View <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default Batches;
