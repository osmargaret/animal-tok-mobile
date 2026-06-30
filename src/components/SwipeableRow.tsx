import { useRef, useState, type ReactNode, type PointerEvent as RPointerEvent } from "react";
import { BellOff, Bell, Trash2, MailOpen, Mail } from "lucide-react";

interface SwipeAction {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  bg: string; // tailwind bg class
}

interface Props {
  onTap: () => void;
  actions: SwipeAction[];
  children: ReactNode;
  /** Optional aria label for the row */
  ariaLabel?: string;
}

/**
 * Touch-swipe row: swipe left to reveal action buttons.
 * Falls back to a long-press menu trigger via the contextmenu button.
 */
const SwipeableRow = ({ onTap, actions, children, ariaLabel }: Props) => {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const [dx, setDx] = useState(0);
  const [open, setOpen] = useState(false);
  const dragging = useRef(false);

  const revealWidth = Math.max(64 * actions.length, 64);

  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return; // mouse can use the menu button
    startX.current = e.clientX;
    startY.current = e.clientY;
    dragging.current = false;
  };

  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (startX.current == null || startY.current == null) return;
    const deltaX = e.clientX - startX.current;
    const deltaY = e.clientY - startY.current;
    if (!dragging.current) {
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
        dragging.current = true;
      } else if (Math.abs(deltaY) > 8) {
        startX.current = null;
        return;
      }
    }
    if (dragging.current) {
      e.preventDefault();
      const base = open ? -revealWidth : 0;
      const next = Math.min(0, Math.max(-revealWidth - 20, base + deltaX));
      setDx(next);
    }
  };

  const onPointerUp = () => {
    if (dragging.current) {
      const threshold = revealWidth / 2;
      if (-dx >= threshold) {
        setDx(-revealWidth);
        setOpen(true);
      } else {
        setDx(0);
        setOpen(false);
      }
    }
    startX.current = null;
    startY.current = null;
    dragging.current = false;
  };

  const close = () => {
    setDx(0);
    setOpen(false);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Action layer */}
      <div className="absolute inset-y-0 right-0 flex items-stretch">
        {actions.map((a) => (
          <button
            key={a.key}
            onClick={(e) => {
              e.stopPropagation();
              a.onClick();
              close();
            }}
            className={`w-16 flex flex-col items-center justify-center text-white text-[10px] font-semibold ${a.bg} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset`}
            aria-label={a.label}
          >
            {a.icon}
            <span className="mt-1">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Content layer */}
      <div
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => {
          if (open) {
            close();
            return;
          }
          if (Math.abs(dx) < 4) onTap();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onTap();
          }
        }}
        className="relative bg-background transition-transform touch-pan-y select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
        style={{
          transform: `translateX(${dx}px)`,
          transitionDuration: dragging.current ? "0ms" : "180ms",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export { SwipeableRow, type SwipeAction };
export { BellOff, Bell, Trash2, MailOpen, Mail };
export default SwipeableRow;
