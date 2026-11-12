import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import DesktopSidebar from "@/components/DesktopSidebar";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";
import VideoPost from "@/components/VideoPost";
import ActionIcons from "@/components/ActionIcons";
import CommentsPanel from "@/components/CommentsPanel";
import EventsModal from "@/components/EventsModal";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { feedPosts } from "@/data/feedData";
import { animalFeeds } from "@/data/animalFeedData";
import { useAuth } from "@/contexts/AuthContext";

const Feed = () => {
  const { activeProfile } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // Scope feed to active profile
  const posts = useMemo(() => {
    if (activeProfile?.type === "animal") {
      const profileFeed = animalFeeds[activeProfile.id] || [];
      // Mix profile's own feed with general feed
      return [...profileFeed, ...feedPosts];
    }
    return feedPosts;
  }, [activeProfile]);

  const handleRefresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 1200));
  }, []);

  const { containerRef: pullRef, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  useEffect(() => {
    setActiveIndex(0);
    if (feedRef.current) feedRef.current.scrollTop = 0;
  }, [activeProfile?.id]);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;

    const handleScroll = () => {
      const scrollTop = feed.scrollTop;
      const height = feed.clientHeight;
      const index = Math.round(scrollTop / height);
      setActiveIndex(Math.min(index, posts.length - 1));
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

      <main className="h-full lg:ml-60 relative">
        <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />
        <div
          ref={setRefs}
          className="h-full overflow-y-auto snap-y-mandatory scrollbar-hide"
        >
          {posts.map((post, i) => (
            <div key={post.id} className="h-[100dvh] relative">
              <VideoPost post={post} isActive={i === activeIndex} />
              <ActionIcons post={post} onCommentOpen={() => setCommentsOpen(true)} />
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
      <CommentsPanel post={posts[activeIndex]} open={commentsOpen} onClose={() => setCommentsOpen(false)} />
      <EventsModal open={eventsOpen} onClose={() => setEventsOpen(false)} />
    </div>
  );
};

export default Feed;
