import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Loader from "../components/ui/Loader";
import FilterBar from "../components/ui/FilterBar";
import ProductCard from "../components/cards/ProductCard";
import API from "../services/api";

function StudyMaterials() {

  const { classId, subjectId } = useParams();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {

    let isMounted = true;

    const fetchMaterials = async () => {

      try {

        /* 🔥 SAFETY */
        if (!classId || !subjectId) {
          setError("Invalid route");
          return;
        }

        setLoading(true);
        setError("");


        /* ✅ FINAL FIX */
        const res = await API.get(
          `/materials/${classId}/${subjectId}`
        );

        if (!isMounted) return;

        const list = res.data?.data || [];


        setMaterials(list);

      } catch (error) {

        if (!isMounted) return;


        setError("Failed to load materials");
        setMaterials([]);

      } finally {

        if (isMounted) setLoading(false);

      }

    };

    fetchMaterials();

    return () => {
      isMounted = false;
    };

  }, [classId, subjectId]);


  /* 🎯 FILTERS */

  const filters = ["All", "Notes", "Sample Paper", "PYQ", "Assignment"];

  const normalize = (str) => str?.toLowerCase().replace(/\s+/g, "");

  const filteredMaterials =
    activeFilter === "All"
      ? materials
      : materials.filter(
          (m) => normalize(m.type) === normalize(activeFilter)
        );

  /* 🔄 LOADING */

  if (loading) return <Loader />;

  /* ❌ ERROR */

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-red-600 mb-2">
          {error}
        </h2>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (

    <div className="max-w-6xl mx-auto px-4">

      {/* HEADER */}
      <div className="text-center mb-8">

        <h1 className="text-3xl md:text-4xl font-bold">
          Study Materials
        </h1>

        <p className="text-gray-600 mt-2">
          Notes, Sample Papers & Previous Year Questions
        </p>

      </div>

      {/* FILTER */}
      <FilterBar
        filters={filters}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      {/* EMPTY */}
      {filteredMaterials.length === 0 ? (

        <div className="text-center py-16">

          <h2 className="text-xl font-semibold mb-2">
            No materials found
          </h2>

          <p className="text-gray-600">
            Study content for this subject is being prepared.
          </p>

        </div>

      ) : (

        /* GRID */
        <div className="grid md:grid-cols-3 gap-6 mt-6">

          {filteredMaterials.map((item) => (

            <ProductCard
              key={item._id}
              {...item}
            />

          ))}

        </div>

      )}

    </div>

  );

}

export default StudyMaterials;