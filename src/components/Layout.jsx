// src/components/Layout.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Circle, TrendingUp, Zap } from "lucide-react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

const Layout = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogoutAndRedirect = useCallback(() => {
    try {
      // ensure parent handler runs as well
      onLogout?.();
    } catch (e) {
      // fallback: clear storage & redirect
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userId");
    }
    navigate("/login", { replace: true });
  }, [onLogout, navigate]);

  const fetchTasks = useCallback(async (signal) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No auth token found in localStorage — logging out");
        handleLogoutAndRedirect();
        return;
      }

      // Explicitly pass Authorization header to be sure it's sent
      // (also keeps behavior robust if interceptor isn't set for some reason)
      const { data } = await axiosInstance.get(API_PATHS.TASK.GET_ALL, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });

      // normalize possible response shapes
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.tasks)
        ? data.tasks
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setTasks(arr);
    } catch (err) {
      // Abort doesn't mean error we want to show to user
      if (axiosInstance.isCancel?.(err)) {
        // canceled by AbortController
        return;
      }

      console.error("Fetch tasks error:", err);

      // HTTP errors with response
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        // token missing/invalid/expired -> force logout and redirect
        console.warn(`Auth error ${status} — logging out`);
        setError(`Request failed with status code ${status}`);
        handleLogoutAndRedirect();
        return;
      }

      // Generic error message
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Could not load tasks. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [handleLogoutAndRedirect]);

  useEffect(() => {
    const controller = new AbortController();
    // fetch only when component mounts and token present
    fetchTasks(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchTasks]);

  useEffect(() => {
    console.log("Fetched Tasks: ", tasks);
  }, [tasks]);

  const stats = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
    const totalCount = tasks.length;
    const pendingCount = totalCount - completedTasks;
    const completionPercentage = totalCount
      ? Math.round((completedTasks / totalCount) * 100)
      : 0;

    return {
      totalCount,
      completedTasks,
      pendingCount,
      completionPercentage,
    };
  }, [tasks]);

  const StatCard = ({ title, value, icon }) => (
    <div className="p-2 sm:p-3 rounded-xl bg-white shadow-sm border border-red-100 hover:shadow-md transition-all duration-300 hover:border-red-200 group">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/10 to-red-500/10 group-hover:from-amber-500/20 group-hover:to-red-500/20">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-500 to-red-600 bg-clip-text text-transparent">
            {value}
          </p>
          <p className="text-xs text-gray-500 font-medium">{title}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 max-w-md">
          <p className="font-medium mb-2">Error loading tasks</p>
          <p className="text-sm">{error}</p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => {
                // retry
                const controller = new AbortController();
                fetchTasks(controller.signal);
              }}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>

            <button
              onClick={() => {
                // logout button in case of persistent auth problem
                handleLogoutAndRedirect();
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      <Sidebar user={user} tasks={tasks} />

      <div className="ml-0 xl:ml-64 lg:ml-64 md:ml-16 pt-16 p-3 sm:p-4 md:p-4 transition-all duration-300">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <div className="xl:col-span-2 space-y-3 sm:space-y-4">
            <Outlet context={{ tasks, refreshTasks: fetchTasks }} />
          </div>

          <div className="xl:col-span-1 space-y-4 sm:space-y-6">
            {/* Stats Section */}
            <div className="sticky top-25 bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-red-100">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                Task Statistics
              </h3>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <StatCard
                  title="Total Tasks"
                  value={stats.totalCount}
                  icon={<Circle className="w-4 h-4 text-purple-500" />}
                />
                <StatCard
                  title="Completed"
                  value={stats.completedTasks}
                  icon={<Circle className="w-4 h-4 text-emerald-500" />}
                />
                <StatCard
                  title="Pending"
                  value={stats.pendingCount}
                  icon={<Circle className="w-4 h-4 text-amber-500" />}
                />
                <StatCard
                  title="Completion Rate"
                  value={`${stats.completionPercentage}%`}
                  icon={<Zap className="w-4 h-4 text-red-500" />}
                />
              </div>

              <hr className="my-3 sm:my-4 border-red-100" />

              {/* Progress Bar */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between text-gray-700">
                  <span className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                    <Circle className="w-3 h-3 text-red-500 fill-red-500" />
                    Task Progress
                  </span>
                  <span className="text-xs bg-red-100 text-red-500 px-1.5 py-0.5 sm:px-2 rounded-full">
                    {stats.completedTasks}/{stats.totalCount}
                  </span>
                </div>
                <div className="relative pt-1">
                  <div className="flex gap-1.5 items-center">
                    <div className="flex-1 h-2 sm:h-3 bg-red-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-300 to-red-500 transition-all duration-500"
                        style={{ width: `${stats.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* end stats */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
