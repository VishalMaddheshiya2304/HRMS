import { useEffect, useState } from "react";
import { getEmployees, createEmployee, deleteEmployee } from "../api/client";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import { LoadingSpinner, EmptyState, ErrorBanner, FormError } from "../components/States";

const DEPARTMENTS = [
  "Engineering", "Product", "Design", "Marketing",
  "Sales", "Finance", "HR", "Operations", "Legal", "Customer Support",
];

function AddEmployeeForm({ onSuccess, onClose }) {
  const [form, setForm] = useState({ id: "", full_name: "", email: "", department: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.id.trim()) e.id = "Employee ID is required";
    else if (!/^[A-Za-z0-9_\-]+$/.test(form.id)) e.id = "Only letters, digits, hyphens, underscores";
    if (!form.full_name.trim()) e.full_name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.department) e.department = "Department is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setApiError("");
    try {
      await createEmployee(form);
      onSuccess();
    } catch (err) {
      setApiError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = "text", placeholder = "") => (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => { setForm((p) => ({ ...p, [key]: e.target.value })); setErrors((p) => ({ ...p, [key]: "" })); }}
        className={`input ${errors[key] ? "border-red-400 ring-1 ring-red-400" : ""}`}
        placeholder={placeholder}
      />
      <FormError message={errors[key]} />
    </div>
  );

  return (
    <div className="space-y-4">
      {apiError && <ErrorBanner message={apiError} />}

      {field("id", "Employee ID", "text", "e.g. EMP-001")}
      {field("full_name", "Full Name", "text", "e.g. Jane Smith")}
      {field("email", "Email Address", "email", "e.g. jane@company.com")}

      <div>
        <label className="label">Department</label>
        <select
          value={form.department}
          onChange={(e) => { setForm((p) => ({ ...p, department: e.target.value })); setErrors((p) => ({ ...p, department: "" })); }}
          className={`input ${errors.department ? "border-red-400 ring-1 ring-red-400" : ""}`}
        >
          <option value="">Select department…</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <FormError message={errors.department} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
        <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 justify-center">
          {loading ? "Adding…" : "Add Employee"}
        </button>
      </div>
    </div>
  );
}

function ConfirmDelete({ employee, onConfirm, onClose, loading }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-gray-900">{employee.full_name}</span>?
        This will also remove all their attendance records.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      setEmployees(await getEmployees());
    } catch {
      setError("Could not load employees. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteEmployee(toDelete.id);
      setToDelete(null);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.detail || "Delete failed.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = employees.filter(
    (e) =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <PageHeader
        title="Employees"
        subtitle={`${employees.length} total employee${employees.length !== 1 ? "s" : ""}`}
        action={
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </button>
        }
      />

      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={fetchEmployees} /></div>}

      {/* Search */}
      {employees.length > 0 && (
        <div className="relative mb-4 w-full sm:max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search employees…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
      )}

      {loading && <LoadingSpinner message="Loading employees…" />}

      {!loading && employees.length === 0 && !error && (
        <EmptyState
          title="No employees yet"
          description="Add your first employee to get started."
          action={
            <button onClick={() => setShowAdd(true)} className="btn-primary">
              Add First Employee
            </button>
          }
        />
      )}

      {!loading && employees.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Employee ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-sm text-muted">
                    No employees match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-surface/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted">{emp.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{emp.full_name}</td>
                    <td className="px-4 py-3 text-gray-600">{emp.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-accent">
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(emp.created_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setToDelete(emp)}
                        className="btn-danger"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <Modal title="Add New Employee" onClose={() => setShowAdd(false)}>
          <AddEmployeeForm
            onClose={() => setShowAdd(false)}
            onSuccess={() => { setShowAdd(false); fetchEmployees(); }}
          />
        </Modal>
      )}

      {toDelete && (
        <Modal title="Confirm Deletion" onClose={() => setToDelete(null)}>
          <ConfirmDelete
            employee={toDelete}
            onClose={() => setToDelete(null)}
            onConfirm={handleDelete}
            loading={deleteLoading}
          />
        </Modal>
      )}
    </div>
  );
}