import { useState } from "react";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import type { FeedPost } from "@/data/feedData";

interface ActionIconsProps {
  post: FeedPost;
  onCommentOpen: () => void;
}

const ActionIcons = ({ post, onCommentOpen }: ActionIconsProps) => {
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    action();
  };

  return (
    <>
      <div className="absolute right-3 bottom-24 lg:bottom-10 z-20 flex flex-col items-center gap-5">
        <button onClick={() => requireAuth(() => setLiked(!liked))} className="flex flex-col items-center gap-1">
          <Heart className={`w-7 h-7 transition-colors ${liked ? "fill-like text-like" : "text-foreground"}`} />
          <span className="text-[11px] text-foreground/80">{(liked ? post.likes + 1 : post.likes).toLocaleString()}</span>
        </button>
        <button onClick={() => requireAuth(onCommentOpen)} className="flex flex-col items-center gap-1">
          <MessageCircle className="w-7 h-7 text-foreground" />
          <span className="text-[11px] text-foreground/80">{post.comments.toLocaleString()}</span>
        </button>
        <button onClick={() => requireAuth(() => setSaved(!saved))} className="flex flex-col items-center gap-1">
          <Bookmark className={`w-7 h-7 transition-colors ${saved ? "fill-primary text-primary" : "text-foreground"}`} />
          <span className="text-[11px] text-foreground/80">{post.saves.toLocaleString()}</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Share2 className="w-7 h-7 text-foreground" />
        </button>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default ActionIcons;
