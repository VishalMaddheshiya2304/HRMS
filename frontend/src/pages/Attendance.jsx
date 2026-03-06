import { useEffect, useState } from "react";
import { getEmployees, getAttendance, markAttendance } from "../api/client";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import { LoadingSpinner, EmptyState, ErrorBanner, FormError } from "../components/States";

function MarkAttendanceForm({ employees, onSuccess, onClose }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ employee_id: "", date: today, status: "Present" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.employee_id) e.employee_id = "Select an employee";
    if (!form.date) e.date = "Date is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setApiError("");
    try {
      await markAttendance(form);
      onSuccess();
    } catch (err) {
      setApiError(err.response?.data?.detail || "Failed to mark attendance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {apiError && <ErrorBanner message={apiError} />}

      <div>
        <label className="label">Employee</label>
        <select
          value={form.employee_id}
          onChange={(e) => { setForm((p) => ({ ...p, employee_id: e.target.value })); setErrors((p) => ({ ...p, employee_id: "" })); }}
          className={`input ${errors.employee_id ? "border-red-400 ring-1 ring-red-400" : ""}`}
        >
          <option value="">Select employee…</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.full_name} ({emp.id})
            </option>
          ))}
        </select>
        <FormError message={errors.employee_id} />
      </div>

      <div>
        <label className="label">Date</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => { setForm((p) => ({ ...p, date: e.target.value })); setErrors((p) => ({ ...p, date: "" })); }}
          className={`input ${errors.date ? "border-red-400 ring-1 ring-red-400" : ""}`}
        />
        <FormError message={errors.date} />
      </div>

      <div>
        <label className="label">Status</label>
        <div className="flex gap-3">
          {["Present", "Absent"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setForm((p) => ({ ...p, status: s }))}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-colors ${
                form.status === s
                  ? s === "Present"
                    ? "border-present bg-green-50 text-present"
                    : "border-absent bg-red-50 text-absent"
                  : "border-border bg-white text-muted hover:bg-surface"
              }`}
            >
              {s === "Present" ? "✓ Present" : "✗ Absent"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
        <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 justify-center">
          {loading ? "Saving…" : "Mark Attendance"}
        </button>
      </div>
    </div>
  );
}

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMark, setShowMark] = useState(false);

  // Filters
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filterEmployee) params.employee_id = filterEmployee;
      if (filterDate) params.date = filterDate;
      const [recs, emps] = await Promise.all([getAttendance(params), getEmployees()]);
      setRecords(recs);
      setEmployees(emps);
    } catch {
      setError("Could not load attendance records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterEmployee, filterDate]);

  const presentCount = records.filter((r) => r.status === "Present").length;
  const absentCount = records.filter((r) => r.status === "Absent").length;

  return (
    <div className="fade-in">
      <PageHeader
        title="Attendance"
        subtitle={`${records.length} record${records.length !== 1 ? "s" : ""} found`}
        action={
          <button onClick={() => setShowMark(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Mark Attendance
          </button>
        }
      />

      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={fetchData} /></div>}

      {/* Summary badges */}
      {records.length > 0 && (
        <div className="flex gap-3 mb-4">
          <span className="badge-present">✓ {presentCount} Present</span>
          <span className="badge-absent">✗ {absentCount} Absent</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex-1 min-w-36">
          <select
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            className="input"
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.full_name}</option>
            ))}
          </select>
        </div>
        <div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input"
          />
        </div>
        {(filterEmployee || filterDate) && (
          <button
            onClick={() => { setFilterEmployee(""); setFilterDate(""); }}
            className="btn-ghost text-xs"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading && <LoadingSpinner message="Loading attendance records…" />}

      {!loading && records.length === 0 && !error && (
        <EmptyState
          title="No records found"
          description={
            filterEmployee || filterDate
              ? "Try adjusting your filters."
              : "Start by marking attendance for your employees."
          }
          action={
            !filterEmployee && !filterDate ? (
              <button onClick={() => setShowMark(true)} className="btn-primary">
                Mark First Attendance
              </button>
            ) : null
          }
        />
      )}

      {!loading && records.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Employee ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Logged At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-surface/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{rec.employee_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{rec.employee_id}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(rec.date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "short", year: "numeric", month: "short", day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {rec.status === "Present" ? (
                      <span className="badge-present">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" /></svg>
                        Present
                      </span>
                    ) : (
                      <span className="badge-absent">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" /></svg>
                        Absent
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {new Date(rec.created_at).toLocaleString("en-US", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showMark && (
        <Modal title="Mark Attendance" onClose={() => setShowMark(false)}>
          <MarkAttendanceForm
            employees={employees}
            onClose={() => setShowMark(false)}
            onSuccess={() => { setShowMark(false); fetchData(); }}
          />
        </Modal>
      )}
    </div>
  );
}
