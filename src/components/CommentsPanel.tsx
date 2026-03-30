import { useState } from "react";
import { X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { FeedPost } from "@/data/feedData";

interface CommentsPanelProps {
  post: FeedPost | null;
  open: boolean;
  onClose: () => void;
}

const CommentsPanel = ({ post, open, onClose }: CommentsPanelProps) => {
  const [commentText, setCommentText] = useState("");

  if (!post) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass rounded-t-2xl max-h-[60vh] flex flex-col border-t border-border lg:left-60"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Comments</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-hide">
              {post.commentsList.map((c, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm flex-shrink-0">
                    {c.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{c.user}</p>
                    <p className="text-sm text-foreground/80">{c.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{c.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-secondary text-foreground text-sm px-3 py-2 rounded-full outline-none placeholder:text-muted-foreground"
              />
              <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
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
