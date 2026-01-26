import api from "./client";

export async function register(username, password) {
  const res = await api.post("/api/auth/register/", { username, password });
  return res.data;
}

export async function login(username, password) {
  const res = await api.post("/api/auth/token/", { username, password });
  localStorage.setItem("access", res.data.access);
  localStorage.setItem("refresh", res.data.refresh);
  return res.data;
}

export async function me() {
  const res = await api.get("/api/auth/me/");
  return res.data;
}

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}
