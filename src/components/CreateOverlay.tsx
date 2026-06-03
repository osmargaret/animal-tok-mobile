import { X, Camera, Calendar, Radio, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useEffect } from "react";

interface CreateOverlayProps {
  open: boolean;
  onClose: () => void;
}

const CreateOverlay = ({ open, onClose }: CreateOverlayProps) => {
  const navigate = useNavigate();

  const handleOption = (path: string) => {
    onClose();
    navigate(path);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            role="dialog" aria-label="Create" aria-modal="true"
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t border-border p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold">Create</h2>
              <button onClick={onClose} aria-label="Close create menu" className="p-1.5 rounded-full hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <X className="w-5 h-5 text-muted-foreground" aria-hidden />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOption("/create")}
                className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Post</span>
              </button>

              <button
                onClick={() => handleOption("/events")}
                className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-500" />
                </div>
                <span className="text-sm font-medium">Event</span>
              </button>

              <button
                onClick={() => handleOption("/create-ad")}
                className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-sm font-medium">Ad</span>
              </button>

              <button
                className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-destructive" />
                </div>
                <span className="text-sm font-medium">Live</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateOverlay;
