import { useEffect, useState } from "react";
import { getEmployees, markAttendance } from "../api/client";
import PageHeader from "../components/PageHeader";
import { LoadingSpinner, ErrorBanner } from "../components/States";

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const fetchEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch {
      setError("Could not load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const setStatus = (employeeId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [employeeId]: status,
    }));
  };

  const saveAttendance = async () => {
    try {
      const requests = Object.entries(attendance).map(([employee_id, status]) =>
        markAttendance({
          employee_id,
          status,
          date: today,
        })
      );

      await Promise.all(requests);

      alert("Attendance saved successfully!");
      setAttendance({});
    } catch {
      alert("Failed to save attendance.");
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Attendance"
        subtitle={`Mark attendance for ${today}`}
      />

      {error && <ErrorBanner message={error} onRetry={fetchEmployees} />}

      {loading && <LoadingSpinner message="Loading employees…" />}

      {!loading && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-4 py-3">Employee</th>
                <th className="text-left px-4 py-3">Present</th>
                <th className="text-left px-4 py-3">Absent</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="px-4 py-3 font-medium">
                    {emp.full_name}
                    <span className="text-xs text-muted ml-2">({emp.id})</span>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => setStatus(emp.id, "Present")}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        attendance[emp.id] === "Present"
                          ? "bg-green-500 text-white"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      ✓ Present
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => setStatus(emp.id, "Absent")}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        attendance[emp.id] === "Absent"
                          ? "bg-red-500 text-white"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      ✗ Absent
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 border-t flex justify-end">
            <button
              onClick={saveAttendance}
              className="btn-primary"
            >
              Save Attendance
            </button>
          </div>
        </div>
      )}
    </div>
  );
}