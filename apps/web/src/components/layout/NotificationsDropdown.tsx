import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle2, Check, ExternalLink } from "lucide-react";
import { notificationsService } from "../../services/api";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsService.getNotifications() as any;
      if (res.success) {
        setNotifications(res.data.list);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Polling every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await notificationsService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-[40px] w-[40px] items-center justify-center rounded-[8px] border border-[#EAE5E0] text-[#77706D] transition-colors hover:bg-[#FAF5EE] hover:text-[#242124]"
      >
        <Bell className="h-[20px] w-[20px]" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#781529] px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[380px] rounded-[12px] border border-[#EAE5E0] bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-[#EAE5E0] px-4 py-3">
            <h3 className="font-semibold text-[#242124]">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-[12px] font-medium text-[#781529] hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex flex-col border-b border-[#EAE5E0] last:border-0 px-4 py-3 hover:bg-[#FAF5EE] ${!notification.read ? 'bg-[#FEF7F0]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-[14px] font-medium text-[#242124]">{notification.title}</p>
                      <p className="mt-1 text-[13px] text-[#77706D]">{notification.description}</p>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-[#9A9491]">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        
                        <div className="flex gap-2">
                          {notification.link && (
                            <Link 
                              to={notification.link}
                              onClick={() => setIsOpen(false)}
                              className="text-[#781529] hover:text-[#5c1020] text-[12px] font-medium flex items-center gap-1"
                            >
                              View <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                          {!notification.read && (
                            <button 
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className="text-[#77706D] hover:text-[#242124]"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF5EE]">
                  <CheckCircle2 className="h-6 w-6 text-[#781529]" />
                </div>
                <p className="mt-3 text-[14px] font-medium text-[#242124]">All caught up!</p>
                <p className="mt-1 text-[13px] text-[#77706D]">You have no new notifications.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
