import { useRef, useEffect } from "react";
import type { FeedPost } from "@/data/feedData";

interface VideoPostProps {
  post: FeedPost;
  isActive: boolean;
}

const VideoPost = ({ post, isActive }: VideoPostProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  return (
    <div className="snap-start w-full h-full flex-shrink-0 relative bg-background">
      {/* Video / poster fallback */}
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

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/90 to-transparent pointer-events-none" />

      {/* Caption overlay */}
      <div className="absolute bottom-20 lg:bottom-6 left-4 right-16 z-10">
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
