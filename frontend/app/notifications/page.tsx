"use client";

import { useEffect, useState } from "react";
import { getNotifications, markAsRead, markAllAsRead } from "@/lib/notificationUtils";
import Header from "@/components/Header";
import Aurora from "@/components/Aurora";
import { Check, Bell, BellRing } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    updateNotifications();
    // Mark all notifications as read when the page loads
    markAllAsRead();
    
    // Set up storage event listener to sync across tabs
    const handleStorageChange = () => {
      updateNotifications();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateNotifications = () => {
    setNotifications(getNotifications());
  };

  const filteredNotifications = notifications.filter(n => 
    activeFilter === "all" || !n.read
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRead = (id: number) => {
    markAsRead(id);
    updateNotifications();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    updateNotifications();
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[#0B0B0B]">
        <Aurora
          colorStops={["#2563eb", "#6A5AE0", "#FFFFFF"]}
          amplitude={1.3}
          speed={0.3}
        />
      </div>

      <Header logoText="Notifications" accent="from-blue-400 to-cyan-500" dashboardLinks />

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-gray-400 text-sm mt-1">
                {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
              </p>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex rounded-lg bg-white/5 border border-white/10 p-1">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    activeFilter === "all" 
                      ? "bg-white/10 text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter("unread")}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${
                    activeFilter === "unread" 
                      ? "bg-white/10 text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Unread
                  {unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
              
              <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  unreadCount === 0
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-blue-400 hover:text-blue-300"
                }`}
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-1">
              {activeFilter === "all" 
                ? "No notifications yet" 
                : "No unread notifications"}
            </h3>
            <p className="text-gray-500 max-w-md">
              {activeFilter === "all"
                ? "When you get notifications, they'll appear here."
                : "You're all caught up! No unread notifications."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleRead(n.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-cyan-400/50 ${
                  n.read 
                    ? "border-white/5 bg-white/2.5 hover:bg-white/5" 
                    : "border-cyan-400/30 bg-cyan-900/20 hover:bg-cyan-900/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex-shrink-0 ${
                    n.read ? "text-cyan-500/50" : "text-cyan-400"
                  }`}>
                    {n.read ? (
                      <Bell className="h-5 w-5" />
                    ) : (
                      <BellRing className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className={`text-base font-medium ${
                        n.read ? "text-gray-300" : "text-white"
                      }`}>
                        {n.title}
                      </h3>
                      {!n.read && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-900/50 text-cyan-300">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(n.created_at).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
