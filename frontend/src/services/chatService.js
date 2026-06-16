import api from "./api";

const sendMessage = async (message, conversationId = null) => {
  const response = await api.post("/chat/message", { message, conversationId });
  return response.data;
};

const getConversations = async () => {
  const response = await api.get("/chat/conversations");
  return response.data;
};

const getConversationMessages = async (conversationId) => {
  const response = await api.get(
    `/chat/conversations/${conversationId}/messages`,
  );
  return response.data;
};

const deleteConversation = async (conversationId) => {
  const response = await api.delete(`/chat/conversations/${conversationId}`);
  return response.data;
};

const renameConversation = async (conversationId, title) => {
  const response = await api.put(`/chat/conversations/${conversationId}`, {
    title,
  });
  return response.data;
};

const chatService = {
  sendMessage,
  getConversations,
  getConversationMessages,
  deleteConversation,
  renameConversation,
};

export default chatService;
