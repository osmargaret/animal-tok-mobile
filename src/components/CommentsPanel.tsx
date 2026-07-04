import { useState, useRef, type ChangeEvent } from "react";
import { X, Send, Smile, Paperclip, Reply, Trash2, MoreHorizontal, Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement, type Comment } from "@/contexts/EngagementContext";
import type { FeedPost } from "@/data/feedData";

interface CommentsPanelProps {
  post: FeedPost | null;
  open: boolean;
  onClose: () => void;
}

const REACTIONS = ["❤️", "😂", "😮", "😢", "🔥", "👏"];

const timeAgo = (ts: number) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

interface CommentRowProps {
  c: Comment;
  activeProfileId: string;
  replies: Comment[];
  onReply: (c: Comment) => void;
  onDelete: (c: Comment) => void;
  onReact: (c: Comment, emoji: string) => void;
  onReport: () => void;
  depth?: number;
}

const CommentRow = ({ c, activeProfileId, replies, onReply, onDelete, onReact, onReport, depth = 0 }: CommentRowProps) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const isMine = c.authorId === activeProfileId;
  const reactionEntries = Object.entries(c.reactions || {}).filter(([, ids]) => ids.length > 0);

  return (
    <div className={depth > 0 ? "ml-10 mt-3" : ""}>
      <div className="flex gap-3 group">
        <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-sm flex-shrink-0">
          {c.authorAvatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-foreground">{c.authorName}</p>
            <span className="text-[10px] text-muted-foreground">{timeAgo(c.createdAt)}</span>
          </div>
          {c.text && <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">{c.text}</p>}
          {c.attachmentUrl && (
            <img src={c.attachmentUrl} alt="attachment" className="mt-1.5 max-h-40 rounded-lg border border-border" />
          )}

          {reactionEntries.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {reactionEntries.map(([emoji, ids]) => {
                const active = ids.includes(activeProfileId);
                return (
                  <button
                    key={emoji}
                    onClick={() => onReact(c, emoji)}
                    className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${
                      active ? "bg-primary/15 border-primary/40 text-foreground" : "bg-secondary border-border text-muted-foreground"
                    }`}
                  >
                    {emoji} {ids.length}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
            <button onClick={() => setShowReactions((v) => !v)} className="hover:text-foreground flex items-center gap-1">
              <Smile className="w-3 h-3" /> React
            </button>
            <button onClick={() => onReply(c)} className="hover:text-foreground flex items-center gap-1">
              <Reply className="w-3 h-3" /> Reply
            </button>
            <div className="relative ml-auto">
              <button onClick={() => setShowMenu((v) => !v)} className="p-1 hover:text-foreground" aria-label="More">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-6 z-10 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[140px]">
                  {isMine ? (
                    <button
                      onClick={() => { setShowMenu(false); onDelete(c); }}
                      className="w-full text-left text-xs px-3 py-2 hover:bg-secondary flex items-center gap-2 text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  ) : (
                    <button
                      onClick={() => { setShowMenu(false); onReport(); }}
                      className="w-full text-left text-xs px-3 py-2 hover:bg-secondary flex items-center gap-2"
                    >
                      <Flag className="w-3.5 h-3.5" /> Report
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {showReactions && (
            <div className="flex gap-1 mt-1.5 p-1 bg-secondary rounded-full w-fit animate-in fade-in zoom-in-95 duration-150">
              {REACTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => { onReact(c, e); setShowReactions(false); }}
                  className="w-7 h-7 rounded-full hover:bg-background flex items-center justify-center text-base"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {replies.length > 0 && (
        <div className="mt-2 border-l border-border pl-3 ml-4">
          {replies.map((r) => (
            <CommentRow
              key={r.id}
              c={r}
              activeProfileId={activeProfileId}
              replies={[]}
              onReply={onReply}
              onDelete={onDelete}
              onReact={onReact}
              onReport={onReport}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentsPanel = ({ post, open, onClose }: CommentsPanelProps) => {
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { activeProfile } = useAuth();
  const { commentsFor, addComment, deleteComment, toggleCommentReaction } = useEngagement();

  if (!post) return null;
  const all = commentsFor(post.id);
  const roots = all.filter((c) => !c.parentId);
  const ownerId = (post.username || "").replace(/^@/, "").split(".")[0];

  const handleSend = () => {
    if (!activeProfile) return;
    if (!text.trim() && !attachment) return;
    addComment(activeProfile.id, activeProfile.name, activeProfile.avatar, post.id, text, ownerId, {
      parentId: replyTo?.id ?? null,
      attachmentUrl: attachment ?? undefined,
    });
    setText("");
    setAttachment(null);
    setReplyTo(null);
  };

  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setAttachment(String(reader.result));
    reader.readAsDataURL(f);
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
            className="fixed bottom-0 left-0 right-0 z-50 glass rounded-t-2xl max-h-[70vh] flex flex-col border-t border-border lg:left-60"
            role="dialog"
            aria-label="Comments"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">
                Comments · {all.length}
                {activeProfile && <span className="text-xs text-muted-foreground font-normal"> · as {activeProfile.name}</span>}
              </h3>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary" aria-label="Close comments">
                <X className="w-5 h-5 text-muted-foreground" />
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
              {roots.length === 0 && post.commentsList.length === 0 && (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  Be the first to comment ✨
                </div>
              )}
              {roots.map((c) => (
                <CommentRow
                  key={c.id}
                  c={c}
                  activeProfileId={activeProfile?.id || ""}
                  replies={all.filter((r) => r.parentId === c.id)}
                  onReply={(t) => setReplyTo(t)}
                  onDelete={(t) => { deleteComment(t.id); toast.success("Comment deleted"); }}
                  onReact={(t, e) => activeProfile && toggleCommentReaction(t.id, e, activeProfile.id)}
                  onReport={() => toast.success("Reported. Thanks for the heads-up.")}
                />
              ))}
            </div>

            {replyTo && (
              <div className="px-4 py-1.5 text-xs text-muted-foreground border-t border-border flex items-center justify-between bg-secondary/40">
                <span>Replying to <span className="text-foreground font-medium">{replyTo.authorName}</span></span>
                <button onClick={() => setReplyTo(null)} className="text-primary">Cancel</button>
              </div>
            )}
            {attachment && (
              <div className="px-4 py-2 border-t border-border flex items-center gap-2">
                <img src={attachment} alt="preview" className="w-12 h-12 rounded-md object-cover" />
                <button onClick={() => setAttachment(null)} className="text-xs text-destructive">Remove</button>
              </div>
            )}
            {showEmoji && (
              <div className="px-4 py-2 border-t border-border flex gap-2 flex-wrap">
                {["😀","😂","🥰","😍","😎","🤔","👍","🙏","🎉","🐶","🐱","🔥","❤️","✨","🎈","📸"].map((e) => (
                  <button key={e} onClick={() => setText((t) => t + e)} className="text-xl hover:scale-110 transition-transform">{e}</button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
              <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" />
              <button onClick={() => fileRef.current?.click()} disabled={!activeProfile} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center disabled:opacity-50" aria-label="Attach image">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => setShowEmoji((v) => !v)} disabled={!activeProfile} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center disabled:opacity-50" aria-label="Emoji">
                <Smile className="w-4 h-4 text-muted-foreground" />
              </button>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder={activeProfile ? (replyTo ? `Reply to ${replyTo.authorName}...` : `Comment as ${activeProfile.name}...`) : "Sign in to comment"}
                className="flex-1 bg-secondary text-foreground text-sm px-3 py-2 rounded-full outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                disabled={!activeProfile}
              />
              <button onClick={handleSend} disabled={(!text.trim() && !attachment) || !activeProfile} className="w-8 h-8 rounded-full bg-primary disabled:opacity-50 flex items-center justify-center text-primary-foreground" aria-label="Send comment">
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
