import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SubjectCard from "../components/cards/SubjectCard";
import SubjectsSkeleton from "../components/ui/SubjectsSkeleton";
import API from "../services/api";

function Subjects() {

  const { classId, streamId } = useParams();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* 🔥 NORMALIZE */
  const normalizedClass = classId?.toLowerCase();
  const normalizedStream = streamId?.toLowerCase();

  const comingSoonCourses = ["ba", "bsc", "bcom"];

  /* 🚧 Coming Soon */

  if (comingSoonCourses.includes(normalizedClass)) {
    return (
      <div className="text-center py-24 max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4 uppercase">
          {normalizedClass} Study Materials
        </h1>

        <p className="text-gray-600 text-lg mb-6">
          Important Questions & Answers for all semesters will be available soon.
        </p>

        <div className="inline-block bg-yellow-100 text-yellow-800 px-6 py-3 rounded-full font-semibold shadow">
          🚧 Coming Soon
        </div>
      </div>
    );
  }

  /* 📦 LOAD SUBJECTS */

  useEffect(() => {

    let isMounted = true;

    const fetchSubjects = async () => {
      try {
        setLoading(true);
        setError("");

        /* 🔥 SAFETY CHECK */
        if (!classId) return;

        let url = `/subjects?classId=${classId}`;

        if (normalizedStream) {
          url += `&stream=${normalizedStream.toUpperCase()}`;
        }

        const res = await API.get(url);

        if (!isMounted) return;

        const subjectList = res.data?.data || [];

        setSubjects(subjectList);

      } catch (err) {

        if (!isMounted) return;

        console.error("Subjects fetch error:", err);
        setError("Failed to load subjects");
        setSubjects([]);

      } finally {

        if (isMounted) setLoading(false);

      }
    };

    fetchSubjects();

    return () => {
      isMounted = false;
    };

  }, [classId, normalizedStream]);

  /* 🎨 STREAM UI */

  const streamNameMap = {
    pcb: "PCB (Biology)",
    pcm: "PCM (Maths)",
    arts: "Arts Stream"
  };

  const streamBadgeStyle = {
    pcb: "bg-green-100 text-green-700",
    pcm: "bg-blue-100 text-blue-700",
    arts: "bg-pink-100 text-pink-700"
  };

  /* ⏳ LOADING */

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <SubjectsSkeleton />
      </div>
    );
  }

  /* ❌ ERROR */

  if (error) {
    return (
      <div className="text-center py-24 px-4">
        <h1 className="text-2xl font-bold mb-3 text-red-600">
          {error}
        </h1>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  /* ❌ EMPTY */

  if (!subjects.length) {
    return (
      <div className="text-center py-24 px-4">
        <h1 className="text-3xl font-bold mb-3">
          Subjects Not Available
        </h1>

        <p className="text-gray-600">
          Content for this class is currently under preparation.
        </p>
      </div>
    );
  }

  return (

    <div className="max-w-6xl mx-auto px-4">

      {/* HEADER */}

      <div className="text-center mb-10">

        <h1 className="text-3xl md:text-4xl font-bold">
          Subjects
        </h1>

        {normalizedStream && streamNameMap[normalizedStream] && (

          <span
            className={`inline-block mt-3 px-4 py-1 rounded-full text-sm font-semibold ${streamBadgeStyle[normalizedStream]}`}
          >
            {streamNameMap[normalizedStream]}
          </span>

        )}

      </div>

      {/* GRID */}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">

        {subjects.map((subject) => (
          <SubjectCard
            key={subject._id}
            subject={subject}
            classId={classId} // ✅ FIXED (IMPORTANT)
            streamId={normalizedStream}
          />
        ))}

      </div>

    </div>

  );

}

export default Subjects;