import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, BookOpen } from "lucide-react";
import API from "../services/api";

function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get("/classes");
        setClasses(res.data?.classes || res.data?.data || []);
      } catch { setClasses([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const gradients = [
    "from-blue-500 to-cyan-500",
    "from-indigo-500 to-blue-600",
    "from-purple-500 to-indigo-600",
    "from-pink-500 to-rose-600",
    "from-orange-500 to-amber-500",
    "from-green-500 to-emerald-600",
    "from-teal-500 to-cyan-600",
  ];

  const getRoute = (cls) =>
    cls.hasStreams ? `/streams/${cls._id}` : `/batches?classId=${cls._id}`;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Select Your Class</h1>
        <p className="text-gray-500">Browse study materials by class</p>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400">No classes available yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {classes.map((cls, i) => (
            <Link
              key={cls._id}
              to={getRoute(cls)}
              className={`relative group bg-gradient-to-br ${gradients[i % gradients.length]} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center`}
            >
              <div className="text-3xl mb-3">
                {cls.classNumber ? `${cls.classNumber}` : "🎓"}
              </div>
              <h3 className="font-bold text-base mb-1">
                {cls.classNumber ? `Class ${cls.classNumber}` : cls.name}
              </h3>
              {cls.hasStreams && (
                <p className="text-xs text-white/70 mb-2">PCM · PCB · Arts</p>
              )}
              <div className="flex items-center justify-center gap-1 text-xs text-white/80 group-hover:text-white transition">
                Explore <ChevronRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Classes;
