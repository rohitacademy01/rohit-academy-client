import API from "./api";

/* =====================================
   🔧 RESPONSE HANDLER
===================================== */
const handleResponse = (res) => res?.data?.data || res?.data;

/* =====================================
   📚 GET ALL CLASSES
===================================== */
export const getAllClasses = async () => {
  const res = await API.get("/classes");
  return handleResponse(res);
};

/* =====================================
   ➕ CREATE CLASS (ADMIN)
===================================== */
export const createClass = async (classData) => {
  if (!classData?.name) {
    throw new Error("Class name required");
  }

  const res = await API.post("/classes", classData);
  return handleResponse(res);
};

/* =====================================
   ✏ UPDATE CLASS
===================================== */
export const updateClass = async (id, classData) => {
  if (!id) throw new Error("Class ID required");
  if (!classData?.name) throw new Error("Class name required");

  const res = await API.put(`/classes/${id}`, classData);
  return handleResponse(res);
};

/* =====================================
   ❌ DELETE CLASS
===================================== */
export const deleteClass = async (id) => {
  if (!id) throw new Error("Class ID required");

  const res = await API.delete(`/classes/${id}`);
  return handleResponse(res);
};