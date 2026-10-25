import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  timeout: 120000,
  headers: { "Content-Type": "application/json" }
});

export async function sendMessage(payload) {
  const { data } = await api.post("/chat", payload);
  return data;
}
export async function getSessions() {
  const { data } = await api.get("/sessions");
  return data;
}
export async function getMessages(sessionId) {
  const { data } = await api.get(`/sessions/${sessionId}/messages`);
  return data;
}
export async function createSession(title = "New conversation") {
  const { data } = await api.post("/sessions", { title });
  return data;
}
export async function deleteSession(sessionId) {
  await api.delete(`/sessions/${sessionId}`);
}
export default api;