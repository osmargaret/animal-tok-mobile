import { useNavigate } from "react-router-dom";
import { useCallback, useMemo } from "react";
import DesktopSidebar from "@/components/DesktopSidebar";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { Plus, ChevronRight, Users, Activity, Bell, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const stories = [
  { name: "Create", emoji: "➕", isCreate: true },
  { name: "DatLadyPre...", emoji: "👩", gradient: "from-pink-500/30 to-rose-500/30" },
  { name: "Queen_of_ti...", emoji: "👑", gradient: "from-purple-500/30 to-violet-500/30" },
  { name: "JARVIS AI", emoji: "🤖", gradient: "from-blue-500/30 to-cyan-500/30" },
];

const allMessages: Record<string, { name: string; status: string; subtitle?: string; emoji: string; hasUnread?: boolean; badge?: number; slug: string }[]> = {
  handler: [
    { name: "THE CREATIVE GIFTSHOP", status: "Sent", subtitle: "BHXITBYLOLA", emoji: "🎁", hasUnread: false, slug: "the-creative-giftshop" },
    { name: "Anuadenuga channel 🎉", status: "Active yesterday", emoji: "🎊", hasUnread: false, slug: "anuadenuga-channel" },
  ],
  bella: [
    { name: "Luna the Cat", status: "Let's meet at the park!", emoji: "🐈", badge: 2, slug: "luna-cat" },
    { name: "Coco Parrot", status: "Sent a photo", emoji: "🦜", hasUnread: false, slug: "coco-parrot" },
    { name: "Max the Husky", status: "Woof! 🐾", emoji: "🐕", badge: 1, slug: "max-husky" },
  ],
  whiskers: [
    { name: "Mittens", status: "Found a new box!", emoji: "🐱", badge: 3, slug: "mittens" },
    { name: "Shadow", status: "Nap time?", emoji: "🐈‍⬛", hasUnread: false, slug: "shadow" },
  ],
  spirit: [
    { name: "Thunder", status: "Race you tomorrow!", emoji: "🐴", badge: 1, slug: "thunder" },
    { name: "Star", status: "Great show today!", emoji: "⭐", hasUnread: false, slug: "star" },
    { name: "Rider Club", status: "New event posted", emoji: "🏇", badge: 4, slug: "rider-club" },
  ],
};

const Inbox = () => {
  const navigate = useNavigate();
  const { activeProfile } = useAuth();

  const handleRefresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 1200));
  }, []);

  const { containerRef, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  const profileId = activeProfile?.id || "handler";
  const profileType = activeProfile?.type || "handler";
  const messages = useMemo(() => {
    if (profileType === "handler") return allMessages.handler;
    return allMessages[profileId] || [];
  }, [profileId, profileType]);

  const profileLabel = activeProfile ? activeProfile.name : "You";

  return (
    <div className="h-[100dvh] overflow-hidden bg-background">
      <DesktopSidebar onEventsOpen={() => {}} />
      <MobileHeader />

      <main ref={containerRef} className="h-full lg:ml-60 overflow-y-auto pb-20 lg:pb-0 relative">
        <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />
        {/* Header */}
        <div className="px-5 pt-4 pb-2">
          <h1 className="text-xl font-bold text-foreground">Inbox</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Messages for {profileLabel}</p>
        </div>

        {/* Stories Row */}
        <div className="px-5 py-3">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {stories.map((s) => (
              <div key={s.name} className="flex flex-col items-center gap-1.5 min-w-[60px]">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 ${
                    s.isCreate
                      ? "border-dashed border-border bg-secondary"
                      : `border-primary/40 bg-gradient-to-br ${s.gradient}`
                  }`}
                >
                  {s.isCreate ? <Plus className="w-5 h-5 text-muted-foreground" /> : s.emoji}
                </div>
                <span className="text-[10px] text-muted-foreground text-center truncate w-full">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* New Followers */}
        <NotificationSection
          icon={<Users className="w-4 h-4" />}
          title="New followers"
          badge={2}
          items={[
            { emoji: "✨", name: "FABULOUS", text: `started following ${profileLabel}.` },
          ]}
        />

        {/* Activity */}
        <NotificationSection
          icon={<Activity className="w-4 h-4" />}
          title="Activity"
          badge={1}
          items={[
            { emoji: "📺", name: "Pulse Nigeria", text: "sent a video and invited..." },
          ]}
        />

        {/* System Notifications */}
        <NotificationSection
          icon={<Bell className="w-4 h-4" />}
          title="System notifications"
          badge={1}
          items={[
            { emoji: "⚙️", name: "Effects: Your AI generation is ...", text: "Feb 12" },
          ]}
        />

        {/* Messages */}
        <div className="px-5 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <Send className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Messages</span>
          </div>

          {messages.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Send className="w-10 h-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No messages yet for {profileLabel}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {messages.map((m) => (
                <button
                  key={m.slug}
                  onClick={() => navigate(`/message/${m.slug}`)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/60 transition-colors w-full text-left"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl border border-border shrink-0">
                    {m.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{m.name}</p>
                    {m.status && (
                      <p className="text-xs text-muted-foreground truncate">{m.status}</p>
                    )}
                    {m.subtitle && (
                      <p className="text-[11px] text-muted-foreground/60">{m.subtitle}</p>
                    )}
                  </div>
                  {m.badge && (
                    <span className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                      {m.badge}
                    </span>
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

const NotificationSection = ({
  icon,
  title,
  badge,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  badge: number;
  items: { emoji: string; name: string; text: string }[];
}) => (
  <div className="px-5 mt-3">
    <button className="w-full flex items-center gap-2 px-3 py-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
      <span className="text-primary">{icon}</span>
      <span className="text-sm font-semibold text-foreground flex-1 text-left">{title}</span>
      <span className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
        {badge}
      </span>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>

    {items.map((item) => (
      <div key={item.name} className="flex items-center gap-3 px-3 py-2.5 mt-1">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg border border-border shrink-0">
          {item.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">
            <span className="font-semibold">{item.name}</span>{" "}
            <span className="text-muted-foreground">{item.text}</span>
          </p>
        </div>
      </div>
    ))}
  </div>
);

export default Inbox;
