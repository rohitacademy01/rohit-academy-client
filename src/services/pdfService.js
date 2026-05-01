import API from "./api";

/* =====================================
   STUDENT APIs
===================================== */
export const getPDFsBySubject = (subjectId, params = {}) =>
  API.get(`/pdf/${subjectId}`, { params });

/* =====================================
   ADMIN APIs
===================================== */
export const adminGetAllPDFs = (params = {}) =>
  API.get("/admin/pdf", { params });

export const adminUploadPDF = (formData, onUploadProgress) =>
  API.post("/admin/pdf/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });

export const adminUpdatePDF = (id, formData) =>
  API.put(`/admin/pdf/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const adminDeletePDF = (id) =>
  API.delete(`/admin/pdf/${id}`);
