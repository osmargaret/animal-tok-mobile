import { useRef, useEffect, useState } from "react";
import { Heart } from "lucide-react";
import type { FeedPost } from "@/data/feedData";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement } from "@/contexts/EngagementContext";

interface VideoPostProps {
  post: FeedPost;
  isActive: boolean;
}

const VideoPost = ({ post, isActive }: VideoPostProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTap = useRef<number>(0);
  const [burst, setBurst] = useState<{ x: number; y: number; id: number } | null>(null);
  const { activeProfile, isAuthenticated } = useAuth();
  const { isLiked, toggleLike } = useEngagement();
  const ownerId = (post.username || "").replace(/^@/, "").split(".")[0];

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  const handleTap = (e: React.PointerEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastTap.current < 320) {
      // double tap
      const rect = e.currentTarget.getBoundingClientRect();
      setBurst({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: now });
      if (isAuthenticated && activeProfile && !isLiked(activeProfile.id, post.id)) {
        toggleLike(activeProfile.id, post.id, ownerId);
      }
      setTimeout(() => setBurst(null), 800);
    }
    lastTap.current = now;
  };

  return (
    <div className="snap-start w-full h-full flex-shrink-0 relative bg-background">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={post.videoUrl}
        poster={post.posterUrl}
        loop
        muted
        playsInline
        preload="metadata"
      />

      {/* Double-tap catcher */}
      <div className="absolute inset-0 z-[5]" onPointerDown={handleTap} aria-hidden />

      {burst && (
        <Heart
          key={burst.id}
          className="absolute z-10 w-24 h-24 text-red-500 fill-red-500 pointer-events-none animate-heart-burst"
          style={{ left: burst.x - 48, top: burst.y - 48 }}
        />
      )}

      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/90 to-transparent pointer-events-none" />

      <div className="absolute bottom-20 lg:bottom-6 left-4 right-16 z-10 pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center text-lg border-2 border-primary">
            {post.avatar}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{post.displayName}</p>
            <p className="text-[11px] text-muted-foreground">{post.time}</p>
          </div>
        </div>
        <p className="text-sm text-foreground/90 mb-1">{post.caption}</p>
        <p className="text-xs text-primary">{post.hashtags}</p>
      </div>
    </div>
  );
};

export default VideoPost;
