import api from "./api";

const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

const getDocuments = async () => {
  const response = await api.get("/documents");
  return response.data;
};

const getDocumentStatus = async (id) => {
  const response = await api.get(`/documents/${id}/status`);
  return response.data;
};

const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};

const documentService = {
  uploadDocument,
  getDocuments,
  getDocumentStatus,
  deleteDocument,
};

export default documentService;
