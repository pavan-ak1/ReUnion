"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { getNotifications } from "@/lib/notificationUtils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/lib/auth";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Initial load
    updateNotifications();
    
    // Set up storage event listener to sync across tabs
    const handleStorageChange = () => {
      updateNotifications();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateNotifications = () => {
    const role = getUserRole();
    const currentRole = (role === "alumni" || role === "student") ? role : "student";
    setNotifications(getNotifications(currentRole));
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasUnread = unreadCount > 0;

  const handleClick = () => {
    router.push('/notifications');
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative rounded-full"
      onClick={handleClick}
      aria-label="View notifications"
    >
      {hasUnread ? (
        <BellRing className="h-5 w-5" />
      ) : (
        <Bell className="h-5 w-5" />
      )}
      {hasUnread && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center text-white font-semibold">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  );
}
