import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../api/client";
import StatCard from "../components/StatCard";
import PageHeader from "../components/PageHeader";
import { LoadingSpinner, ErrorBanner } from "../components/States";

const icons = {
  employees: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  present: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  absent: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  records: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch {
      setError("Failed to load dashboard data. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="fade-in">
      <PageHeader
        title="Dashboard"
        subtitle={today}
      />

      {loading && <LoadingSpinner message="Fetching statistics…" />}
      {error && <ErrorBanner message={error} onRetry={fetchStats} />}

      {stats && (
        <>
          {/* Stat grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Employees"
              value={stats.total_employees}
              icon={icons.employees}
              color="blue"
            />
            <StatCard
              label="Present Today"
              value={stats.present_today}
              sub={`of ${stats.total_employees} employees`}
              icon={icons.present}
              color="green"
            />
            <StatCard
              label="Absent Today"
              value={stats.absent_today}
              icon={icons.absent}
              color="red"
            />
            <StatCard
              label="Total Records"
              value={stats.total_records}
              sub="All attendance entries"
              icon={icons.records}
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Departments */}
            <div className="card p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Employees by Department</h2>
              {stats.departments.length === 0 ? (
                <p className="text-sm text-muted text-center py-6">No departments yet</p>
              ) : (
                <div className="space-y-3">
                  {stats.departments.map((d) => {
                    const pct = stats.total_employees
                      ? Math.round((d.count / stats.total_employees) * 100)
                      : 0;
                    return (
                      <div key={d.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{d.name}</span>
                          <span className="text-muted font-mono text-xs">{d.count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top attendance */}
            <div className="card p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Top Attendance (Present Days)</h2>
              {stats.top_attendance.length === 0 ? (
                <p className="text-sm text-muted text-center py-6">No attendance records yet</p>
              ) : (
                <div className="space-y-2">
                  {stats.top_attendance.map((emp, i) => (
                    <div key={emp.name} className="flex items-center gap-3 py-2 border-b border-border last:border-0 flex-wrap sm:flex-nowrap">
                      <span className="w-6 h-6 rounded-full bg-surface flex items-center justify-center text-xs font-bold text-muted shrink-0">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm font-medium text-gray-800">{emp.name}</span>
                      <span className="badge-present">{emp.present_days} days</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/employees"
              className="card p-4 flex items-center gap-3 hover:border-accent transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                {icons.employees}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Manage Employees</p>
                <p className="text-xs text-muted">Add, view or remove staff</p>
              </div>
            </Link>

            <Link
              to="/attendance"
              className="card p-4 flex items-center gap-3 hover:border-accent transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-present group-hover:bg-present group-hover:text-white transition-colors">
                {icons.present}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Mark Attendance</p>
                <p className="text-xs text-muted">Track daily presence</p>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}