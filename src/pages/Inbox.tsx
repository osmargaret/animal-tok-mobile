import { useNavigate } from "react-router-dom";
import { useCallback, useMemo, useState } from "react";
import DesktopSidebar from "@/components/DesktopSidebar";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { Send, MessageCircle, Search, X } from "lucide-react";
import BackButton from "@/components/BackButton";
import { useAuth } from "@/contexts/AuthContext";
import { useMessaging } from "@/contexts/MessagingContext";
import { previewForMessage } from "@/lib/messagePreview";

const formatTime = (ts: number) => {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

type Filter = "all" | "unread" | "recent";

const Inbox = () => {
  const navigate = useNavigate();
  const { activeProfile } = useAuth();
  const { conversationsFor } = useMessaging();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const handleRefresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 800));
  }, []);

  const { containerRef, pullDistance, isRefreshing } = usePullToRefresh({ onRefresh: handleRefresh });

  const myId = activeProfile?.id || "";
  const all = useMemo(() => (myId ? conversationsFor(myId) : []), [myId, conversationsFor]);

  const conversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return all.filter(({ contact, lastMessage, unread }) => {
      if (filter === "unread" && unread === 0) return false;
      if (filter === "recent" && (lastMessage?.createdAt ?? 0) < dayAgo) return false;
      if (!q) return true;
      const inName = contact.name.toLowerCase().includes(q);
      const inMsg = (lastMessage?.text || "").toLowerCase().includes(q);
      return inName || inMsg;
    });
  }, [all, query, filter]);

  const totalUnread = all.reduce((s, c) => s + c.unread, 0);

  const FilterChip = ({ value, label, badge }: { value: Filter; label: string; badge?: number }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
        filter === value
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground"
      }`}
    >
      {label}
      {badge ? (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === value ? "bg-primary-foreground/20" : "bg-background/60"}`}>
          {badge}
        </span>
      ) : null}
    </button>
  );

  return (
    <div className="h-[100dvh] overflow-hidden bg-background">
      <DesktopSidebar onEventsOpen={() => {}} />
      <MobileHeader />

      <main ref={containerRef} className="h-full lg:ml-60 overflow-y-auto pb-20 lg:pb-0 relative pt-14 lg:pt-0">
        <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />

        <div className="px-5 pt-4 pb-2 flex items-center gap-3">
          <BackButton />
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xl border border-primary/40">
            {activeProfile?.avatar || "🐾"}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground leading-tight">Inbox</h1>
            <p className="text-xs text-muted-foreground">
              Chatting as {activeProfile?.name || "Guest"}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 mt-3">
          <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2.5">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or message"
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery("")} className="p-0.5 rounded-full hover:bg-background/60">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar">
            <FilterChip value="all" label="All" badge={all.length || undefined} />
            <FilterChip value="unread" label="Unread" badge={totalUnread || undefined} />
            <FilterChip value="recent" label="Recent" />
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Send className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Messages</span>
          </div>

          {conversations.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-3">
                <MessageCircle className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {query ? "No matches" : "No conversations yet"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
                {query
                  ? "Try a different name or keyword."
                  : `When ${activeProfile?.name || "you"} chats with other pets or handlers, those messages will show up here.`}
              </p>
              {!query && (
                <button
                  onClick={() => navigate("/explore")}
                  className="mt-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
                >
                  Find profiles to chat
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {conversations.map(({ contact, lastMessage, unread }) => {
                const preview = previewForMessage(lastMessage);
                return (
                  <button
                    key={contact.id}
                    onClick={() => navigate(`/message/${contact.id}`)}
                    className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-secondary/60 transition-colors w-full text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl border border-border shrink-0">
                      {contact.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{contact.name}</p>
                        {lastMessage && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {formatTime(lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs truncate ${
                          unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {lastMessage?.senderId === myId ? "You: " : ""}
                        {preview}
                      </p>
                    </div>
                    {unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Inbox;
