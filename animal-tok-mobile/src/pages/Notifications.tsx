import { useState, useMemo } from "react";
import { Settings, Heart, MessageCircle, UserPlus, Calendar, ShoppingBag, Bell, Check, CheckCheck } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";
import DesktopSidebar from "@/components/DesktopSidebar";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: number;
  type: "like" | "comment" | "follow" | "event" | "order" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatar: string;
  profileId?: string; // which profile this notification belongs to
}

const allNotifications: Notification[] = [];

const iconMap = {
  like: <Heart className="w-4 h-4 text-red-400" />,
  comment: <MessageCircle className="w-4 h-4 text-blue-400" />,
  follow: <UserPlus className="w-4 h-4 text-green-400" />,
  event: <Calendar className="w-4 h-4 text-purple-400" />,
  order: <ShoppingBag className="w-4 h-4 text-orange-400" />,
  system: <Bell className="w-4 h-4 text-primary" />,
};

const Notifications = () => {
  const { activeProfile } = useAuth();
  const [notifications, setNotifications] = useState(allNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const profileId = activeProfile?.type === "animal" ? activeProfile.id : "handler";
  const profileLabel = activeProfile ? activeProfile.name : "You";

  const scopedNotifications = useMemo(() => {
    return notifications.filter((n) => n.profileId === profileId);
  }, [notifications, profileId]);

  const unreadCount = scopedNotifications.filter((n) => !n.read).length;
  const filtered = filter === "unread" ? scopedNotifications.filter((n) => !n.read) : scopedNotifications;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => n.profileId === profileId ? { ...n, read: true } : n));
  };

  const markRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 lg:pb-4">
      <DesktopSidebar onEventsOpen={() => {}} />
      <MobileHeader />

      <main className="lg:ml-60">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 pt-[max(3.5rem,calc(env(safe-area-inset-top)+3rem))] lg:pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary font-medium flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button className="p-2 rounded-lg bg-secondary">
                <Settings className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-2">Showing for {profileLabel}</p>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === "unread" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                {filter === "unread" ? "No unread notifications" : `No notifications for ${profileLabel}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">You're all caught up! 🎉</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/30 ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg flex-shrink-0 relative">
                    {n.avatar}
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center">
                      {iconMap[n.type]}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.message}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{n.time}</p>
                  </div>
                  {!n.read && (
                    <Check className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Notifications;
