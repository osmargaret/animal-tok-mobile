import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Heart, MessageCircle, UserPlus, Calendar, ShoppingBag, Bell, CheckCheck, Megaphone, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";
import DesktopSidebar from "@/components/DesktopSidebar";
import { SwipeableRow } from "@/components/SwipeableRow";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement, type AppNotification } from "@/contexts/EngagementContext";

const iconMap: Record<AppNotification["type"], JSX.Element> = {
  like: <Heart className="w-4 h-4 text-red-400" />,
  comment: <MessageCircle className="w-4 h-4 text-blue-400" />,
  follow: <UserPlus className="w-4 h-4 text-green-400" />,
  event: <Calendar className="w-4 h-4 text-purple-400" />,
  order: <ShoppingBag className="w-4 h-4 text-orange-400" />,
  system: <Bell className="w-4 h-4 text-primary" />,
  message: <Send className="w-4 h-4 text-primary" />,
  ad: <Megaphone className="w-4 h-4 text-amber-400" />,
  booking: <Calendar className="w-4 h-4 text-emerald-400" />,
};

type FilterKey = "all" | "messages" | "likes" | "follows" | "system";

const FILTERS: { key: FilterKey; label: string; match: (t: AppNotification["type"]) => boolean }[] = [
  { key: "all", label: "All", match: () => true },
  { key: "messages", label: "Messages", match: (t) => t === "message" || t === "comment" },
  { key: "likes", label: "Likes", match: (t) => t === "like" },
  { key: "follows", label: "Follows", match: (t) => t === "follow" },
  { key: "system", label: "System", match: (t) => t === "system" || t === "order" || t === "ad" || t === "event" || t === "booking" },
];

const timeAgo = (ts: number) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const bucketOf = (ts: number) => {
  const today = startOfDay();
  const yesterday = today - 86400_000;
  const weekAgo = today - 7 * 86400_000;
  if (ts >= today) return "Today";
  if (ts >= yesterday) return "Yesterday";
  if (ts >= weekAgo) return "This week";
  return "Earlier";
};

const Notifications = () => {
  const navigate = useNavigate();
  const { activeProfile } = useAuth();
  const { notifications, markAllRead, markNotificationRead, removeNotification, clearAllNotifications, clearMessageNotifications } = useEngagement();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const profileId = activeProfile?.id || "";
  const profileLabel = activeProfile?.name || "You";

  const scoped = useMemo(
    () => notifications.filter((n) => n.profileId === profileId),
    [notifications, profileId]
  );
  const unreadCount = scoped.filter((n) => !n.read).length;
  const activeFilter = FILTERS.find((f) => f.key === filter)!;
  const filtered = scoped.filter((n) => activeFilter.match(n.type)).filter((n) => (showUnreadOnly ? !n.read : true));

  const grouped = useMemo(() => {
    const map: Record<string, AppNotification[]> = {};
    for (const n of filtered) {
      const b = bucketOf(n.time);
      (map[b] ||= []).push(n);
    }
    return ["Today", "Yesterday", "This week", "Earlier"].map((k) => [k, map[k] || []] as const).filter(([, v]) => v.length > 0);
  }, [filtered]);

  const handleClick = (n: AppNotification) => {
    markNotificationRead(n.id);
    if (n.type === "message" && n.contactId) {
      clearMessageNotifications(profileId, n.contactId);
      navigate(`/message/${n.contactId}`);
    }
  };

  const handleDismiss = (n: AppNotification) => {
    removeNotification(n.id);
    toast.success("Removed");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 lg:pb-4">
      <DesktopSidebar onEventsOpen={() => {}} />
      <MobileHeader />

      <main className="lg:ml-60">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 pt-[max(3.5rem,calc(env(safe-area-inset-top)+3rem))] lg:pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BackButton />
              <h1 className="text-lg font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button onClick={() => markAllRead(profileId)} className="text-xs text-primary font-medium flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-primary/10">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              {scoped.length > 0 && (
                <button
                  onClick={() => { clearAllNotifications(profileId); toast.success("All cleared"); }}
                  className="p-2 rounded-lg bg-secondary hover:bg-secondary/70"
                  aria-label="Clear all notifications"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              <button onClick={() => navigate("/profile")} className="p-2 rounded-lg bg-secondary hover:bg-secondary/70" aria-label="Notification settings">
                <Settings className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-2">Showing for {profileLabel}</p>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  filter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                }`}
              >
                {f.label}
              </button>
            ))}
            <button
              onClick={() => setShowUnreadOnly((v) => !v)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ml-auto ${
                showUnreadOnly ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto pb-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-primary" />
              </div>
              <p className="text-base font-semibold text-foreground">
                {showUnreadOnly ? "No unread notifications" : `Nothing here yet`}
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                {showUnreadOnly ? "You're all caught up! 🎉" : `When people interact with ${profileLabel}, you'll see it here.`}
              </p>
            </div>
          ) : (
            <div className="px-2 pt-2 space-y-4">
              {grouped.map(([bucket, list]) => (
                <div key={bucket}>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold px-3 mb-1.5">{bucket}</p>
                  <div className="space-y-1.5">
                    {list.map((n) => (
                      <SwipeableRow
                        key={n.id}
                        ariaLabel={n.title}
                        onTap={() => handleClick(n)}
                        actions={[
                          { key: "read", label: n.read ? "Unread" : "Read", icon: <CheckCheck className="w-4 h-4" />, onClick: () => markNotificationRead(n.id), bg: "bg-primary" },
                          { key: "delete", label: "Delete", icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDismiss(n), bg: "bg-destructive" },
                        ]}
                      >
                        <div className={`flex items-start gap-3 px-3 py-3 ${!n.read ? "bg-primary/5" : "bg-card"} border border-border`}>
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
                            <p className="text-[11px] text-muted-foreground mt-1">{timeAgo(n.time)}</p>
                          </div>
                        </div>
                      </SwipeableRow>
                    ))}
                  </div>
                </div>
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
