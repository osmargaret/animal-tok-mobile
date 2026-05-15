import { ExternalLink, Bookmark, UserPlus, UserCheck, Megaphone, Phone, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement, type Ad } from "@/contexts/EngagementContext";
import { validateCtaUrl, openCta, ctaActionLabel } from "@/lib/ctaUrl";
import { toast } from "sonner";

const AdCard = ({ ad }: { ad: Ad }) => {
  const { activeProfile } = useAuth();
  const { isSaved, toggleSave, isFollowing, toggleFollow } = useEngagement();
  const profileId = activeProfile?.id || "";
  const saved = profileId ? isSaved(profileId, ad.id) : false;
  const following = profileId ? isFollowing(profileId, ad.createdBy) : false;
  const isOwner = profileId === ad.createdBy;

  const requireAuth = () => {
    if (!profileId) {
      toast.error("Sign in to interact with ads");
      return false;
    }
    return true;
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-base shrink-0">
            {ad.createdByAvatar || "📢"}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold truncate">{ad.createdByName || "Sponsored"}</p>
              <span className="text-[9px] uppercase tracking-wide text-primary font-bold shrink-0">Sponsored</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{new Date(ad.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        {!isOwner && (
          <button
            onClick={() => requireAuth() && toggleFollow(profileId, ad.createdBy)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
              following ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
            }`}
          >
            {following ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
            {following ? "Following" : "Follow"}
          </button>
        )}
      </div>

      {ad.type === "image" && ad.mediaUrl && (
        <img src={ad.mediaUrl} alt={ad.title} className="w-full max-h-80 object-cover" />
      )}
      {ad.type === "video" && ad.mediaUrl && (
        <video src={ad.mediaUrl} controls playsInline className="w-full max-h-80 bg-black" />
      )}
      {ad.type === "text" && (
        <div
          className="px-5 py-10 text-center"
          style={{ background: ad.bgColor || "linear-gradient(135deg, hsl(var(--primary)/0.15), hsl(var(--accent)/0.15))" }}
        >
          <Megaphone className="w-6 h-6 mx-auto mb-3 text-primary" />
          <p className="text-lg font-bold leading-tight">{ad.title}</p>
        </div>
      )}

      <div className="p-3 space-y-2">
        {ad.type !== "text" && <p className="text-sm font-bold leading-tight">{ad.title}</p>}
        {ad.body && <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{ad.body}</p>}

        <div className="flex items-center gap-2 pt-1">
          {(() => {
            const cta = validateCtaUrl(ad.ctaUrl || "");
            if (cta.valid) {
              const Icon = cta.kind === "tel" ? Phone : cta.kind === "mail" ? Mail : ExternalLink;
              return (
                <button
                  onClick={() => openCta(cta)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {ad.ctaLabel || ctaActionLabel(cta)}
                </button>
              );
            }
            return (
              <div className="flex-1 text-[11px] text-muted-foreground text-center py-2">No link attached</div>
            );
          })()}
          <button
            onClick={() => requireAuth() && toggleSave(profileId, ad.id)}
            className={`p-2 rounded-full border transition-colors ${
              saved ? "bg-primary/10 border-primary text-primary" : "border-border bg-secondary"
            }`}
            aria-label={saved ? "Saved" : "Save"}
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-primary" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdCard;
