import { useState } from "react";
import { X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement } from "@/contexts/EngagementContext";
import type { FeedPost } from "@/data/feedData";

interface CommentsPanelProps {
  post: FeedPost | null;
  open: boolean;
  onClose: () => void;
}

const timeAgo = (ts: number) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const CommentsPanel = ({ post, open, onClose }: CommentsPanelProps) => {
  const [text, setText] = useState("");
  const { activeProfile } = useAuth();
  const { commentsFor, addComment } = useEngagement();

  if (!post) return null;
  const liveComments = commentsFor(post.id);
  const ownerId = (post.username || "").replace(/^@/, "").split(".")[0];

  const handleSend = () => {
    if (!activeProfile || !text.trim()) return;
    addComment(activeProfile.id, activeProfile.name, activeProfile.avatar, post.id, text, ownerId);
    setText("");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/40" onClick={onClose} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass rounded-t-2xl max-h-[60vh] flex flex-col border-t border-border lg:left-60"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">
                Comments {activeProfile && <span className="text-xs text-muted-foreground font-normal">· as {activeProfile.name}</span>}
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-hide">
              {post.commentsList.map((c, i) => (
                <div key={`s-${i}`} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm flex-shrink-0">{c.avatar}</div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{c.user}</p>
                    <p className="text-sm text-foreground/80">{c.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{c.time}</p>
                  </div>
                </div>
              ))}
              {liveComments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-sm flex-shrink-0">{c.authorAvatar}</div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{c.authorName}</p>
                    <p className="text-sm text-foreground/80">{c.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(c.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={activeProfile ? `Comment as ${activeProfile.name}...` : "Sign in to comment"}
                className="flex-1 bg-secondary text-foreground text-sm px-3 py-2 rounded-full outline-none placeholder:text-muted-foreground"
                disabled={!activeProfile}
              />
              <button onClick={handleSend} disabled={!text.trim() || !activeProfile} className="w-8 h-8 rounded-full bg-primary disabled:opacity-50 flex items-center justify-center text-primary-foreground">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommentsPanel;
