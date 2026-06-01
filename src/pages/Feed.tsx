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

const Feed = () => {
  const { activeProfile } = useAuth();
  const { userPosts } = useEngagement();
  const [activeIndex, setActiveIndex] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // Scope feed to active profile; prepend the user's own posts.
  const posts = useMemo(() => {
    const mine = userPosts
      .filter((p) => p.isPublic || p.authorId === activeProfile?.id)
      .map(userPostToFeed);
    if (activeProfile?.type === "animal") {
      const profileFeed = animalFeeds[activeProfile.id] || [];
      return [...mine, ...profileFeed, ...feedPosts];
    }
    return [...mine, ...feedPosts];
  }, [activeProfile, userPosts]);

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
