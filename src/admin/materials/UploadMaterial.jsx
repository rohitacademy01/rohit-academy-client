import React, { useEffect, useState, useRef } from "react";
import { UploadCloud, FileText, Image, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function UploadMaterial() {

  const navigate = useNavigate();
  const fileRef = useRef(null);
  const thumbRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [streams, setStreams] = useState([]);

  const [formData, setFormData] = useState({
    classId: "",
    streamId: "",
    subjectId: "",
    type: "",
    title: "",
    pages: "",
    price: "",
    description: "",
    file: null,
    thumbnail: null
  });

  /* ================= ADMIN CHECK ================= */
  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin") || "{}");
    if (!admin?.token) navigate("/admin-login");
  }, []);

  /* ================= FETCH CLASSES ================= */
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await API.get("/classes");
        setClasses(res.data?.data || []);
      } catch {
        setError("Failed to load classes");
      }
    };
    fetchClasses();
  }, []);

  /* ================= FETCH STREAMS ================= */
  useEffect(() => {

    if (!formData.classId) return;

    const cls = classes.find(c => c._id === formData.classId);

    if (!cls?.hasStreams) {
      setStreams([]);
      setFormData(prev => ({ ...prev, streamId: "", subjectId: "" }));
      return;
    }

    const fetchStreams = async () => {
      try {
        const res = await API.get(`/streams?classId=${formData.classId}`);
        setStreams(res.data?.data || []);
      } catch {
        setError("Failed to load streams");
      }
    };

    fetchStreams();

  }, [formData.classId]);

  /* ================= FETCH SUBJECTS (🔥 NEW ROUTE) ================= */
  useEffect(() => {

    if (!formData.classId) return;

    const cls = classes.find(c => c._id === formData.classId);

    const fetchSubjects = async () => {
      try {

        let url = `/subjects/${formData.classId}`;

        if (cls?.hasStreams) {

          if (!formData.streamId) {
            setSubjects([]);
            return;
          }

          url = `/subjects/${formData.classId}/${formData.streamId}`;
        }

        const res = await API.get(url);

        setSubjects(res.data?.data || []);

      } catch {
        setError("Failed to load subjects");
      }
    };

    fetchSubjects();

  }, [formData.classId, formData.streamId]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {

    const { name, value, files } = e.target;

    if (files) {

      const file = files[0];

      if (name === "file" && file.size > 10 * 1024 * 1024) {
        return setError("PDF must be under 10MB");
      }

      if (name === "thumbnail" && file.size > 2 * 1024 * 1024) {
        return setError("Thumbnail must be under 2MB");
      }

      if (name === "thumbnail") {
        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
        setThumbnailPreview(URL.createObjectURL(file));
      }

      setFormData(prev => ({ ...prev, [name]: file }));
      return;
    }

    // 🔥 RESET DEPENDENCIES
    if (name === "classId") {
      setFormData(prev => ({
        ...prev,
        classId: value,
        streamId: "",
        subjectId: ""
      }));
      return;
    }

    if (name === "streamId") {
      setFormData(prev => ({
        ...prev,
        streamId: value,
        subjectId: ""
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {

    e.preventDefault();

    const cls = classes.find(c => c._id === formData.classId);

    if (!formData.title || !formData.price || !formData.type) {
      return setError("Fill all required fields");
    }

    if (!formData.file) {
      return setError("PDF required");
    }

    if (cls?.hasStreams && !formData.streamId) {
      return setError("Stream required for this class");
    }

    try {

      setLoading(true);
      setProgress(0);
      setError("");
      setSuccess(false);

      const data = new FormData();

      Object.entries(formData).forEach(([k, v]) => {
        if (v !== null && v !== "") data.append(k, v);
      });

      await API.post("/materials", data, {
        onUploadProgress: (e) => {
          if (!e.total) return;
          setProgress(Math.round((e.loaded * 100) / e.total));
        }
      });

      setSuccess(true);

      // RESET
      setFormData({
        classId: "",
        streamId: "",
        subjectId: "",
        type: "",
        title: "",
        pages: "",
        price: "",
        description: "",
        file: null,
        thumbnail: null
      });

      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
        setThumbnailPreview(null);
      }

      fileRef.current.value = "";
      thumbRef.current.value = "";

      setTimeout(() => navigate("/admin/materials"), 1200);

    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedClass = classes.find(c => c._id === formData.classId);

  /* ================= UI ================= */

  return (
    <div className="max-w-2xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <UploadCloud className="text-blue-600" />
        Upload Material
      </h1>

      {success && <p className="text-green-600 mb-3">Uploaded successfully</p>}
      {error && <p className="text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* CLASS */}
        <select name="classId" value={formData.classId} onChange={handleChange} className="input">
          <option value="">Select Class</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* STREAM */}
        {selectedClass?.hasStreams && (
          <select name="streamId" value={formData.streamId} onChange={handleChange} className="input">
            <option value="">Select Stream</option>
            {streams.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        )}

        {/* SUBJECT */}
        <select name="subjectId" value={formData.subjectId} onChange={handleChange} className="input">
          <option value="">Select Subject</option>
          {subjects.map(s => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>

        {/* TYPE */}
        <select name="type" value={formData.type} onChange={handleChange} className="input">
          <option value="">Type</option>
          <option value="Notes">Notes</option>
          <option value="PYQ">PYQ</option>
        </select>

        <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" className="input" />
        <input name="price" value={formData.price} onChange={handleChange} type="number" placeholder="Price" className="input" />

        {/* FILE */}
        <input ref={fileRef} type="file" name="file" accept=".pdf" onChange={handleChange} />

        {/* THUMB */}
        <input ref={thumbRef} type="file" name="thumbnail" accept="image/*" onChange={handleChange} />

        {thumbnailPreview && <img src={thumbnailPreview} className="h-40 rounded" />}

        <button className="bg-blue-600 text-white w-full py-3 rounded">
          {loading ? `Uploading ${progress}%` : "Upload"}
        </button>

      </form>

    </div>
  );
}

export default UploadMaterial;