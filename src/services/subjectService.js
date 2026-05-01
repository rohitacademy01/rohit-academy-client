import API from "./api";

/* =====================================
   🔧 HELPER → BUILD QUERY SAFELY
===================================== */
const buildQuery = (params) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  return query.toString();
};

/* =====================================
   📚 GET SUBJECTS BY CLASS
===================================== */
export const getSubjectsByClass = async (classId) => {
  if (!classId) throw new Error("classId is required");

  const query = buildQuery({ classId });

  const res = await API.get(`/subjects?${query}`);
  return res.data;
};

/* =====================================
   🎓 GET SUBJECTS BY STREAM
===================================== */
export const getSubjectsByStream = async (classId, stream) => {
  if (!classId) throw new Error("classId is required");

  const query = buildQuery({ classId, stream });

  const res = await API.get(`/subjects?${query}`);
  return res.data;
};

/* =====================================
   ➕ CREATE SUBJECT
===================================== */
export const createSubject = async (subjectData) => {
  if (!subjectData) throw new Error("Subject data required");

  const res = await API.post("/subjects", subjectData);
  return res.data;
};

/* =====================================
   ✏ UPDATE SUBJECT
===================================== */
export const updateSubject = async (id, subjectData) => {
  if (!id) throw new Error("Subject ID required");

  const res = await API.put(`/subjects/${id}`, subjectData);
  return res.data;
};

/* =====================================
   ❌ DELETE SUBJECT
===================================== */
export const deleteSubject = async (id) => {
  if (!id) throw new Error("Subject ID required");

  const res = await API.delete(`/subjects/${id}`);
  return res.data;
};

/* =====================================
   📄 GET ALL SUBJECTS
===================================== */
export const getAllSubjects = async () => {
  const res = await API.get("/subjects");
  return res.data;
};