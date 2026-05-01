import API from "./api";

/* =====================================
   🔧 RESPONSE HANDLER
===================================== */
const handleResponse = (res) => res?.data?.data || res?.data;

/* =====================================
   📚 GET MATERIALS (FILTER BY SUBJECT)
===================================== */
export const getMaterialsBySubject = async (subjectId) => {
  if (!subjectId) throw new Error("Subject ID required");

  const res = await API.get(`/materials?subjectId=${subjectId}`);
  return handleResponse(res);
};

/* =====================================
   📄 GET MATERIAL BY ID
===================================== */
export const getMaterialById = async (id) => {
  if (!id) throw new Error("Material ID required");

  const res = await API.get(`/materials/${id}`);
  return handleResponse(res);
};

/* =====================================
   🔍 SEARCH MATERIALS (FRONTEND FILTER)
   ⚠️ Backend me search API nahi hai
===================================== */
export const searchMaterials = async (query) => {
  if (!query) return [];

  const res = await API.get(`/materials`);
  const materials = handleResponse(res) || [];

  return materials.filter((m) =>
    m.title.toLowerCase().includes(query.toLowerCase())
  );
};

/* =====================================
   ➕ UPLOAD MATERIAL (ADMIN)
===================================== */
export const uploadMaterial = async (formData) => {
  if (!formData) throw new Error("Form data required");

  const res = await API.post("/materials", formData);
  return handleResponse(res);
};

/* =====================================
   ✏ UPDATE MATERIAL
===================================== */
export const updateMaterial = async (id, formData) => {
  if (!id) throw new Error("Material ID required");

  const res = await API.put(`/materials/${id}`, formData);
  return handleResponse(res);
};

/* =====================================
   ❌ DELETE MATERIAL
===================================== */
export const deleteMaterial = async (id) => {
  if (!id) throw new Error("Material ID required");

  const res = await API.delete(`/materials/${id}`);
  return handleResponse(res);
};