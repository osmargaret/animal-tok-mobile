import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Sparkles, UserCheck, RotateCcw } from "lucide-react";
import DesktopSidebar from "@/components/DesktopSidebar";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";
import VideoPost from "@/components/VideoPost";
import ActionIcons from "@/components/ActionIcons";
import CommentsPanel from "@/components/CommentsPanel";
import EventsModal from "@/components/EventsModal";
import WelcomeTour from "@/components/WelcomeTour";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";
import { Skeleton } from "@/components/ui/skeleton";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { feedPosts, type FeedPost } from "@/data/feedData";
import { animalFeeds } from "@/data/animalFeedData";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement, type UserPost } from "@/contexts/EngagementContext";

const TEXT_POSTER = "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=700&fit=crop";

const userPostToFeed = (p: UserPost): FeedPost => ({
  id: p.id,
  username: p.authorUsername,
  displayName: p.authorName,
  avatar: p.authorAvatar,
  time: "just now",
  caption: p.type === "text" ? (p.textContent || "") : p.caption,
  hashtags: p.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" "),
  videoUrl: p.type === "video" ? p.mediaUrl || "" : "",
  posterUrl: p.type === "image" ? p.mediaUrl || TEXT_POSTER : TEXT_POSTER,
  likes: 0,
  comments: 0,
  saves: 0,
  commentsList: [],
});

type FeedTab = "foryou" | "following";

const FeedSkeleton = () => (
  <div className="h-[100dvh] relative bg-background">
    <Skeleton className="absolute inset-0" />
    <div className="absolute bottom-24 lg:bottom-10 left-4 right-16 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

const Feed = () => {
  const { activeProfile } = useAuth();
  const { userPosts, isFollowing } = useEngagement();
  const [activeIndex, setActiveIndex] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [tab, setTab] = useState<FeedTab>("foryou");
  const [loading, setLoading] = useState(true);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const allPosts = useMemo(() => {
    const mine = userPosts
      .filter((p) => p.isPublic || p.authorId === activeProfile?.id)
      .map(userPostToFeed);
    if (activeProfile?.type === "animal") {
      const profileFeed = animalFeeds[activeProfile.id] || [];
      return [...mine, ...profileFeed, ...feedPosts];
    }
    return [...mine, ...feedPosts];
  }, [activeProfile, userPosts]);

  const posts = useMemo(() => {
    if (tab === "foryou" || !activeProfile) return allPosts;
    return allPosts.filter((p) => {
      const owner = (p.username || "").replace(/^@/, "").split(".")[0];
      return owner === activeProfile.id || isFollowing(activeProfile.id, owner);
    });
  }, [allPosts, tab, activeProfile, isFollowing]);

  const handleRefresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 1200));
  }, []);

  const { containerRef: pullRef, pullDistance, isRefreshing } = usePullToRefresh({ onRefresh: handleRefresh });

  useEffect(() => {
    setActiveIndex(0);
    if (feedRef.current) feedRef.current.scrollTop = 0;
  }, [activeProfile?.id, tab]);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    const handleScroll = () => {
      const scrollTop = feed.scrollTop;
      const height = feed.clientHeight;
      const index = Math.round(scrollTop / height);
      setActiveIndex(Math.min(index, posts.length));
    };
    feed.addEventListener("scroll", handleScroll, { passive: true });
    return () => feed.removeEventListener("scroll", handleScroll);
  }, [posts.length]);

  const setRefs = useCallback(
    (el: HTMLDivElement | null) => {
      feedRef.current = el;
      (pullRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    },
    [pullRef]
  );

  return (
    <div className="h-[100dvh] overflow-hidden bg-background">
      <DesktopSidebar onEventsOpen={() => setEventsOpen(true)} />
      <MobileHeader />

      {/* Feed tabs — pinned above content */}
      <div className="fixed top-[max(3rem,calc(env(safe-area-inset-top)+2.5rem))] lg:top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-background/40 backdrop-blur-md rounded-full p-1 border border-border/50 lg:left-auto lg:right-6 lg:translate-x-0">
        <button
          onClick={() => setTab("foryou")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            tab === "foryou" ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-foreground"
          }`}
        >
          <Sparkles className="w-3 h-3" /> For You
        </button>
        <button
          onClick={() => setTab("following")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            tab === "following" ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-foreground"
          }`}
        >
          <UserCheck className="w-3 h-3" /> Following
        </button>
      </div>

      <main className="h-full lg:ml-60 relative">
        <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />
        <div ref={setRefs} className="h-full overflow-y-auto snap-y-mandatory scrollbar-hide">
          {loading ? (
            <FeedSkeleton />
          ) : posts.length === 0 ? (
            <div className="h-[100dvh] flex flex-col items-center justify-center px-8 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UserCheck className="w-10 h-10 text-primary" />
              </div>
              <p className="text-lg font-semibold">
                {tab === "following" ? "No posts from people you follow" : "Nothing to show"}
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                {tab === "following" ? "Follow more creators to fill your feed." : "Check back later for fresh content."}
              </p>
              {tab === "following" && (
                <button
                  onClick={() => setTab("foryou")}
                  className="mt-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
                >
                  Explore For You
                </button>
              )}
            </div>
          ) : (
            <>
              {posts.map((post, i) => (
                <div key={post.id} className="h-[100dvh] relative">
                  <VideoPost post={post} isActive={i === activeIndex} />
                  <ActionIcons post={post} onCommentOpen={() => setCommentsOpen(true)} />
                </div>
              ))}
              {/* End-of-feed marker */}
              <div className="h-[100dvh] snap-start flex flex-col items-center justify-center px-8 text-center bg-background">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <p className="text-lg font-semibold">You're all caught up 🎉</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  You've seen every post in your {tab === "following" ? "Following" : "For You"} feed.
                </p>
                <button
                  onClick={() => { if (feedRef.current) feedRef.current.scrollTop = 0; }}
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
                >
                  <RotateCcw className="w-4 h-4" /> Back to top
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <BottomNav />
      <CommentsPanel post={posts[activeIndex] || null} open={commentsOpen} onClose={() => setCommentsOpen(false)} />
      <EventsModal open={eventsOpen} onClose={() => setEventsOpen(false)} />
      <WelcomeTour />
    </div>
  );
};

export default Feed;
