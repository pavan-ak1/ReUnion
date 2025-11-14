// Add a new notification
export function addNotification(title: string, message: string, forRole?: "student" | "alumni") {
  try {
    const key = forRole === "alumni" ? "alumni_notifications" : "notifications";

    const existing = JSON.parse(localStorage.getItem(key) || "[]");

    const newNotif = {
      id: Date.now(),
      title,
      message,
      created_at: new Date().toISOString(),
      read: false,
    };

    const updated = [newNotif, ...existing];
    localStorage.setItem(key, JSON.stringify(updated));

    // Trigger bell update
    window.dispatchEvent(new Event("storage"));
  } catch (err) {
    console.log("Error saving notification:", err);
  }
}

// Get notifications
export function getNotifications(role: "student" | "alumni" = "student") {
  const key = role === "alumni" ? "alumni_notifications" : "notifications";
  return JSON.parse(localStorage.getItem(key) || "[]");
}

// Mark single notif as read
export function markAsRead(id: number, role: "student" | "alumni" = "student") {
  const key = role === "alumni" ? "alumni_notifications" : "notifications";

  const updated = getNotifications(role).map((n: any) =>
    n.id === id ? { ...n, read: true } : n
  );

  localStorage.setItem(key, JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));
}

// Mark all notifications as read
export function markAllAsRead(role: "student" | "alumni" = "student") {
  const key = role === "alumni" ? "alumni_notifications" : "notifications";

  const updated = getNotifications(role).map((n: any) => ({
    ...n,
    read: true,
  }));

  localStorage.setItem(key, JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));

  return updated;
}

// Get unread count
export function getUnreadCount(role: "student" | "alumni" = "student") {
  return getNotifications(role).filter((n: any) => !n.read).length;
}
