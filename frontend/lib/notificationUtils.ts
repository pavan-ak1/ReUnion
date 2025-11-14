// Save a new notification
export function addNotification(title: string, message: string) {
  try {
    const existing = JSON.parse(localStorage.getItem("notifications") || "[]");

    const newNotif = {
      id: Date.now(),
      title,
      message,
      created_at: new Date().toISOString(),
      read: false,
    };

    const updated = [newNotif, ...existing];
    localStorage.setItem("notifications", JSON.stringify(updated));
  } catch (err) {
    console.log("Error saving notification:", err);
  }
}

// Get all notifications
export function getNotifications() {
  return JSON.parse(localStorage.getItem("notifications") || "[]");
}

// Mark one as read
export function markAsRead(id: number) {
  const notifications = getNotifications().map((n: any) =>
    n.id === id ? { ...n, read: true } : n
  );
  localStorage.setItem("notifications", JSON.stringify(notifications));
}

// Mark all as read
export function markAllAsRead() {
  const notifications = getNotifications().map((n: any) => ({
    ...n,
    read: true,
  }));
  localStorage.setItem("notifications", JSON.stringify(notifications));
  return notifications;
}
