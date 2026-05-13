import { useState } from "react";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement } from "@/contexts/EngagementContext";
import AuthModal from "@/components/AuthModal";
import { toast } from "sonner";
import type { FeedPost } from "@/data/feedData";

interface ActionIconsProps {
  post: FeedPost;
  onCommentOpen: () => void;
}

const ActionIcons = ({ post, onCommentOpen }: ActionIconsProps) => {
  const { isAuthenticated, activeProfile } = useAuth();
  const { isLiked, toggleLike, isSaved, toggleSave, likeCountFor, commentsFor } = useEngagement();
  const [authOpen, setAuthOpen] = useState(false);

  const profileId = activeProfile?.id || "";
  const liked = profileId ? isLiked(profileId, post.id) : false;
  const saved = profileId ? isSaved(profileId, post.id) : false;
  const totalLikes = likeCountFor(post.id, post.likes);
  const totalComments = post.comments + commentsFor(post.id).length;

  // Best-effort: derive post owner profile id from username (e.g. @bella.lab -> bella)
  const ownerId = (post.username || "").replace(/^@/, "").split(".")[0];

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) return setAuthOpen(true);
    action();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: post.displayName, text: post.caption, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied");
      }
    } catch {}
  };

  return (
    <>
      <div className="absolute right-3 bottom-24 lg:bottom-10 z-20 flex flex-col items-center gap-5">
        <button onClick={() => requireAuth(() => toggleLike(profileId, post.id, ownerId))} className="flex flex-col items-center gap-1">
          <Heart className={`w-7 h-7 transition-colors ${liked ? "fill-like text-like" : "text-foreground"}`} />
          <span className="text-[11px] text-foreground/80">{totalLikes.toLocaleString()}</span>
        </button>
        <button onClick={() => requireAuth(onCommentOpen)} className="flex flex-col items-center gap-1">
          <MessageCircle className="w-7 h-7 text-foreground" />
          <span className="text-[11px] text-foreground/80">{totalComments.toLocaleString()}</span>
        </button>
        <button onClick={() => requireAuth(() => toggleSave(profileId, post.id))} className="flex flex-col items-center gap-1">
          <Bookmark className={`w-7 h-7 transition-colors ${saved ? "fill-primary text-primary" : "text-foreground"}`} />
          <span className="text-[11px] text-foreground/80">{post.saves.toLocaleString()}</span>
        </button>
        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          <Share2 className="w-7 h-7 text-foreground" />
        </button>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default ActionIcons;
