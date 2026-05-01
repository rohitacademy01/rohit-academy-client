import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";
import API from "../services/api";

function Streams() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [streams, setStreams] = useState([]);
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sr, cr] = await Promise.all([
          API.get(`/streams?classId=${classId}`),
          API.get(`/classes/${classId}`),
        ]);
        setStreams(sr.data?.streams || sr.data?.data || []);
        setCls(cr.data?.class || cr.data?.data || null);
      } catch { }
      finally { setLoading(false); }
    };
    fetch();
  }, [classId]);

  const streamConfig = {
    PCM: { icon: "⚗️", color: "from-blue-500 to-indigo-600", subjects: "Physics · Chemistry · Maths" },
    PCB: { icon: "🧬", color: "from-green-500 to-emerald-600", subjects: "Physics · Chemistry · Biology" },
    ARTS: { icon: "🎭", color: "from-orange-500 to-pink-600", subjects: "History · Geography · Civics" },
  };

  const getConfig = (name) => {
    const key = name?.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
    return streamConfig[key] || { icon: "📚", color: "from-purple-500 to-indigo-600", subjects: "Complete Notes" };
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition text-sm">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          {cls ? `Class ${cls.classNumber || cls.name}` : "Select Stream"}
        </h1>
        <p className="text-gray-500">Choose your stream to see available batches</p>
      </div>

      {streams.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <p className="text-gray-400 mb-4">No streams found for this class</p>
          <Link to="/classes" className="text-blue-600 hover:underline">← Back to Classes</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {streams.map((stream) => {
            const config = getConfig(stream.name);
            return (
              <Link
                key={stream._id}
                to={`/batches?classId=${classId}&streamId=${stream._id}`}
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 p-6 transition-all hover:-translate-y-1"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  {config.icon}
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-1">{stream.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{config.subjects}</p>
                <div className="flex items-center text-blue-600 text-sm font-medium gap-1 group-hover:gap-2 transition-all">
                  View Batches <ChevronRight size={16} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Streams;
