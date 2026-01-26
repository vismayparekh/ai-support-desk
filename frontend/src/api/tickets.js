import api from "./client";

export async function listTickets() {
  const res = await api.get("/api/tickets/");
  return res.data;
}

export async function getTicket(id) {
  const res = await api.get(`/api/tickets/${id}/`);
  return res.data;
}

export async function createTicket(payload) {
  const res = await api.post("/api/tickets/", payload);
  return res.data;
}

export async function updateTicket(id, payload) {
  const res = await api.patch(`/api/tickets/${id}/`, payload);
  return res.data;
}

export async function listComments(ticketId) {
  const res = await api.get(`/api/comments/?ticket=${ticketId}`);
  return res.data;
}

export async function createComment(ticketId, message) {
  const res = await api.post(`/api/comments/`, { ticket: ticketId, message });
  return res.data;
}

export async function analyticsSummary() {
  const res = await api.get(`/api/analytics/summary/`);
  return res.data;
}
