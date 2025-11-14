"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { getNotifications, markAllAsRead } from "@/lib/notificationUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
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
    setNotifications(getNotifications());
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasUnread = unreadCount > 0;

  const handleMarkAllAsRead = () => {
    const updated = markAllAsRead();
    setNotifications(updated);
  };

  const handleNotificationClick = (id: number) => {
    // You can add navigation logic here if needed
    // For now, just mark as read
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-full"
          onClick={() => setIsOpen(!isOpen)}
        >
          {hasUnread ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {hasUnread && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-[400px] overflow-y-auto" align="end">
        <div className="flex justify-between items-center p-2 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {hasUnread && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          <div className="divide-y">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className={`cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="w-full">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{notification.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message.length > 60 
                      ? `${notification.message.substring(0, 60)}...` 
                      : notification.message}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
            {notifications.length > 10 && (
              <div className="p-2 text-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/notifications');
                  }}
                >
                  View all notifications
                </Button>
              </div>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
