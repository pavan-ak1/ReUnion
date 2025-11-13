"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Aurora from "@/components/Aurora";
import Header from "@/components/Header";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("student"); // default

  useEffect(() => {
    const storedRole =
      localStorage.getItem("role") || sessionStorage.getItem("role") || "student";
    setRole(storedRole);
    fetchNotifications(storedRole);
  }, []);

  const fetchNotifications = async (userRole: string) => {
    try {
      const endpoint =
        userRole === "alumni"
          ? "/alumni/notifications"
          : "/student/notifications";
      const res = await api.get(endpoint);
      const data = res.data.data || res.data;

      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setNotifications(sorted);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      toast.error("Unable to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const endpoint =
        role === "alumni"
          ? "/alumni/notifications/mark-read"
          : "/student/notifications/mark-read";

      await api.put(endpoint);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Error marking as read:", err);
      toast.error("Could not update notifications");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#0B0B0B] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 -z-10 bg-[#0B0B0B]">
        <Aurora
          colorStops={["#2563eb", "#6A5AE0", "#b5aada", "#ffffff"]}
          blend={0.85}
          amplitude={1.4}
          speed={0.25}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0B]/60 to-[#0B0B0B]" />
      </div>

      {/* Header */}
      <Header
        logoText={
          role === "alumni" ? "ReUnion Alumni" : "ReUnion Student"
        }
        accent="from-cyan-400 to-blue-500"
        dashboardLinks
      />

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-24 sm:py-32">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Notifications</h1>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-5 py-2 text-sm border border-white/20 rounded-md hover:bg-white hover:text-black transition"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {notifications.length > 0 ? (
          <ul className="space-y-4">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`p-5 rounded-lg border transition-all ${
                  n.read
                    ? "border-white/10 bg-white/5"
                    : "border-cyan-400/40 bg-cyan-500/10"
                }`}
              >
                <h3 className="text-lg font-semibold text-white mb-1">
                  {n.title}
                </h3>
                <p className="text-gray-300 mb-2">{n.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-center mt-20 text-lg">
            No notifications yet.
          </p>
        )}
      </main>

      <ToastContainer position="bottom-right" autoClose={2000} theme="dark" />
    </div>
  );
}
