import axios from "axios";

// ✅ Fixed: Use relative base URL so Vite proxy handles /api/* in dev
// In production, VITE_API_URL is set in Vercel environment variables
const BASE_URL = import.meta.env.VITE_API_URL || "";

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ✅ Consistent with allow_credentials=True on backend
});

// ── Employees ──────────────────────────────────────────────────────────────

export const getEmployees = () => client.get("/api/employees").then((r) => r.data);

export const createEmployee = (data) =>
  client.post("/api/employees", data).then((r) => r.data);

export const deleteEmployee = (id) =>
  client.delete(`/api/employees/${id}`).then((r) => r.data);

// ── Attendance ─────────────────────────────────────────────────────────────

export const getAttendance = (params = {}) =>
  client.get("/api/attendance", { params }).then((r) => r.data);

export const markAttendance = (data) =>
  client.post("/api/attendance", data).then((r) => r.data);

// ── Dashboard ──────────────────────────────────────────────────────────────

export const getDashboardStats = () =>
  client.get("/api/dashboard/stats").then((r) => r.data);

export default client;