import { useState } from "react";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement } from "@/contexts/EngagementContext";
import AuthModal from "@/components/AuthModal";
import ShareSheet from "@/components/ShareSheet";
import type { FeedPost } from "@/data/feedData";

interface ActionIconsProps {
  post: FeedPost;
  onCommentOpen: () => void;
}

const ActionIcons = ({ post, onCommentOpen }: ActionIconsProps) => {
  const { isAuthenticated, activeProfile } = useAuth();
  const { isLiked, toggleLike, isSaved, toggleSave, likeCountFor, commentsFor } = useEngagement();
  const [authOpen, setAuthOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const profileId = activeProfile?.id || "";
  const liked = profileId ? isLiked(profileId, post.id) : false;
  const saved = profileId ? isSaved(profileId, post.id) : false;
  const totalLikes = likeCountFor(post.id, post.likes);
  const totalComments = post.comments + commentsFor(post.id).length;

  const ownerId = (post.username || "").replace(/^@/, "").split(".")[0];

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) return setAuthOpen(true);
    action();
  };

  return (
    <>
      <div className="absolute right-3 bottom-24 lg:bottom-10 z-20 flex flex-col items-center gap-5">
        <button
          onClick={() => requireAuth(() => toggleLike(profileId, post.id, ownerId))}
          className="flex flex-col items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full p-1 -m-1"
          aria-label={liked ? "Unlike" : "Like"}
        >
          <Heart className={`w-7 h-7 transition-all ${liked ? "fill-like text-like scale-110" : "text-foreground"}`} />
          <span className="text-[11px] text-foreground/80">{totalLikes.toLocaleString()}</span>
        </button>
        <button
          onClick={() => requireAuth(onCommentOpen)}
          className="flex flex-col items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full p-1 -m-1"
          aria-label="Open comments"
        >
          <MessageCircle className="w-7 h-7 text-foreground" />
          <span className="text-[11px] text-foreground/80">{totalComments.toLocaleString()}</span>
        </button>
        <button
          onClick={() => requireAuth(() => toggleSave(profileId, post.id))}
          className="flex flex-col items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full p-1 -m-1"
          aria-label={saved ? "Unsave" : "Save"}
        >
          <Bookmark className={`w-7 h-7 transition-colors ${saved ? "fill-primary text-primary" : "text-foreground"}`} />
          <span className="text-[11px] text-foreground/80">{post.saves.toLocaleString()}</span>
        </button>
        <button
          onClick={() => setShareOpen(true)}
          className="flex flex-col items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full p-1 -m-1"
          aria-label="Share"
        >
          <Share2 className="w-7 h-7 text-foreground" />
          <span className="text-[11px] text-foreground/80">Share</span>
        </button>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={`${post.displayName} on AnimalTok`}
        text={post.caption}
      />
    </>
  );
};

export default ActionIcons;
