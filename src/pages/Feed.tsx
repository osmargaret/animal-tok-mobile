import { useState, useRef, useEffect } from "react";
import DesktopSidebar from "@/components/DesktopSidebar";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";
import VideoPost from "@/components/VideoPost";
import ActionIcons from "@/components/ActionIcons";
import CommentsPanel from "@/components/CommentsPanel";
import EventsModal from "@/components/EventsModal";
import { feedPosts } from "@/data/feedData";

const Feed = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;

    const handleScroll = () => {
      const scrollTop = feed.scrollTop;
      const height = feed.clientHeight;
      const index = Math.round(scrollTop / height);
      setActiveIndex(Math.min(index, feedPosts.length - 1));
    };

    feed.addEventListener("scroll", handleScroll, { passive: true });
    return () => feed.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="h-[100dvh] overflow-hidden bg-background">
      <DesktopSidebar onEventsOpen={() => setEventsOpen(true)} />
      <MobileHeader />

      <main className="h-full lg:ml-60">
        <div
          ref={feedRef}
          className="h-full overflow-y-auto snap-y-mandatory scrollbar-hide"
        >
          {feedPosts.map((post, i) => (
            <div key={post.id} className="h-[100dvh] relative">
              <VideoPost post={post} isActive={i === activeIndex} />
              <ActionIcons post={post} onCommentOpen={() => setCommentsOpen(true)} />
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
      <CommentsPanel post={feedPosts[activeIndex]} open={commentsOpen} onClose={() => setCommentsOpen(false)} />
      <EventsModal open={eventsOpen} onClose={() => setEventsOpen(false)} />
    </div>
  );
};

export default Feed;
