import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EventsModalProps {
  open: boolean;
  onClose: () => void;
}

const events = [
  { emoji: "🐕", title: "Agility Masters", date: "May 15, 2026", cta: "Register" },
  { emoji: "🐈", title: "Cat Cafe Meetup", date: "June 8, 2026", cta: "RSVP" },
];

const EventsModal = ({ open, onClose }: EventsModalProps) => (
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-4 m-auto z-50 glass rounded-2xl border border-border max-w-lg"
          style={{ height: "fit-content" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Animal Events</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-muted-foreground mb-4">Mating events, games, sports, pet hangouts</p>
            <div className="space-y-3">
              {events.map((ev, i) => (
                <div key={i} className="flex items-center justify-between bg-secondary rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {ev.emoji} {ev.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{ev.date}</p>
                  </div>
                  <button className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
                    {ev.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default EventsModal;
