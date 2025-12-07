import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../features/auth/store/authStore";
import { ProjectList } from "../features/projects/components/ProjectList";
import { Bell } from "lucide-react";

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isNotificationsPage = location.pathname === "/dashboard/notifications";

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Task Manager</h1>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ProjectList />
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => navigate("/dashboard/notifications")}
            className={`w-full flex items-center gap-2 px-4 py-2 text-sm rounded-md text-left transition-colors ${
              isNotificationsPage
                ? "bg-purple-50 text-purple-600 font-medium"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Bell className="w-4 h-4" />
            Notifications
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md text-left"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm p-4 md:hidden flex justify-between items-center">
          <h1 className="text-lg font-bold text-blue-600">Task Manager</h1>
          <button onClick={handleLogout} className="text-sm text-red-600">
            Logout
          </button>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
