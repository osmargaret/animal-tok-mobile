import { Loader2 } from "lucide-react";

interface Props {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

const PullToRefreshIndicator = ({ pullDistance, isRefreshing, threshold = 80 }: Props) => {
  if (pullDistance === 0 && !isRefreshing) return null;

  const progress = Math.min(pullDistance / threshold, 1);
  const ready = progress >= 1;

  return (
    <div
      className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none transition-transform duration-200"
      style={{ transform: `translateY(${pullDistance - 40}px)`, opacity: progress }}
    >
      <div className={`w-9 h-9 rounded-full bg-card border border-border shadow-lg flex items-center justify-center ${isRefreshing || ready ? "text-primary" : "text-muted-foreground"}`}>
        <Loader2
          className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
          style={!isRefreshing ? { transform: `rotate(${progress * 360}deg)` } : undefined}
        />
      </div>
    </div>
  );
};

export default PullToRefreshIndicator;
