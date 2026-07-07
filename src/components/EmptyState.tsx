import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  emoji?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState = ({ icon, emoji, title, description, actionLabel, onAction, className = "" }: EmptyStateProps) => {
  return (
    <div className={`flex flex-col items-center text-center px-6 py-12 ${className}`}>
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" aria-hidden />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 border border-border flex items-center justify-center text-4xl">
          {icon ?? <span aria-hidden>{emoji ?? "✨"}</span>}
        </div>
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground mt-1.5 max-w-[280px] leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
