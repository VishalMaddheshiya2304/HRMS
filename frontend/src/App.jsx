import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";

export default function App() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur border-b border-border px-4 md:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted flex-wrap">
            <span>HRMS Lite</span>
            <span>/</span>
            <Routes>
              <Route path="/" element={<span className="text-gray-700 font-medium">Dashboard</span>} />
              <Route path="/employees" element={<span className="text-gray-700 font-medium">Employees</span>} />
              <Route path="/attendance" element={<span className="text-gray-700 font-medium">Attendance</span>} />
            </Routes>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-sidebar flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-600">Admin</span>
          </div>
        </header>

        <div className="px-4 md:px-8 py-6 md:py-7">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/attendance" element={<Attendance />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}