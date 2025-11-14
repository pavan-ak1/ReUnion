// frontend/lib/notify.ts
export interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

const STORAGE_KEY = "notifications";

export const getNotifications = (): Notification[] => {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
};

export const saveNotifications = (list: Notification[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

export const addNotification = (title: string, message: string) => {
  const existing = getNotifications();

  const newNotif: Notification = {
    id: Date.now(),
    title,
    message,
    created_at: new Date().toISOString(),
    read: false,
  };

  const updated = [newNotif, ...existing];
  saveNotifications(updated);
};

export const markAsRead = (id: number) => {
  const list = getNotifications().map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  saveNotifications(list);
};

export const markAllAsRead = () => {
  const list = getNotifications().map((n) => ({ ...n, read: true }));
  saveNotifications(list);
};

export const deleteNotification = (id: number) => {
  const list = getNotifications().filter((n) => n.id !== id);
  saveNotifications(list);
};

export const clearNotifications = () => {
  saveNotifications([]);
};
