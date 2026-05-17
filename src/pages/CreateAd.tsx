import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, Video, Type, Upload, Megaphone, X, Check, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement, type AdMedia } from "@/contexts/EngagementContext";
import { useIpLocation } from "@/hooks/useIpLocation";
import { validateCtaUrl } from "@/lib/ctaUrl";

const types: { id: AdMedia; label: string; icon: typeof ImageIcon; color: string; hint: string }[] = [
  { id: "image", label: "Image", icon: ImageIcon, color: "text-emerald-400", hint: "JPG, PNG, WebP — under 10MB" },
  { id: "video", label: "Video", icon: Video, color: "text-blue-400", hint: "MP4 / MOV — keep it under 30s" },
  { id: "text", label: "Text", icon: Type, color: "text-purple-400", hint: "Bold headline on a colored card" },
];

const ctaPresets = ["Learn more", "Shop now", "Book", "Sign up", "Watch", "Get offer"];
const bgPresets = [
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#f97316,#ec4899)",
  "linear-gradient(135deg,#10b981,#06b6d4)",
  "linear-gradient(135deg,#0f172a,#334155)",
  "linear-gradient(135deg,#facc15,#f97316)",
];

const TITLE_MAX = 60;
const BODY_MAX = 220;
const MAX_BYTES = 10 * 1024 * 1024;

const CreateAd = () => {
  const navigate = useNavigate();
  const { activeProfile } = useAuth();
  const { addAd } = useEngagement();
  const [type, setType] = useState<AdMedia>("image");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [ctaLabel, setCtaLabel] = useState("Learn more");
  const [bgColor, setBgColor] = useState(bgPresets[0]);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const titleErr = title.trim().length > 0 && title.trim().length < 3 ? "Title is too short" : "";
  const ctaInfo = validateCtaUrl(ctaUrl);
  const urlErr = ctaUrl && !ctaInfo.valid ? "Enter a valid URL, phone number or email" : "";

  const canPublish =
    !!activeProfile &&
    title.trim().length >= 3 &&
    title.length <= TITLE_MAX &&
    body.length <= BODY_MAX &&
    !urlErr &&
    (type === "text" || !!mediaUrl);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_BYTES) {
      toast.error("File too large (max 10MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setMediaUrl(reader.result as string);
    reader.readAsDataURL(f);
  };

  const publish = () => {
    if (!activeProfile) return toast.error("Sign in to create an ad");
    if (!title.trim()) return toast.error("Add a title");
    if (title.length > TITLE_MAX) return toast.error(`Title must be under ${TITLE_MAX} chars`);
    if (body.length > BODY_MAX) return toast.error(`Description must be under ${BODY_MAX} chars`);
    if (urlErr) return toast.error(urlErr);
    if ((type === "image" || type === "video") && !mediaUrl)
      return toast.error(`Pick ${type === "image" ? "an image" : "a video"} for your ad`);
    const ad = addAd(
      activeProfile.id,
      {
        type,
        title: title.trim(),
        body: body.trim(),
        mediaUrl,
        ctaUrl: ctaUrl.trim() || undefined,
        ctaLabel: ctaUrl.trim() ? ctaLabel : undefined,
        bgColor: type === "text" ? bgColor : undefined,
      },
      { name: activeProfile.name, avatar: activeProfile.avatar }
    );
    setPublishedId(ad.id);
    toast.success("Ad published");
  };

  if (publishedId) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-9 h-9 text-primary" />
        </div>
        <h1 className="text-xl font-bold">Your ad is live</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          It now appears in the Marketplace Ads feed for everyone to discover.
        </p>
        <div className="flex gap-2 mt-6 w-full max-w-xs">
          <button
            onClick={() => {
              setPublishedId(null);
              setTitle("");
              setBody("");
              setCtaUrl("");
              setMediaUrl("");
            }}
            className="flex-1 py-3 rounded-xl bg-secondary text-sm font-semibold"
          >
            Create another
          </button>
          <button onClick={() => navigate("/marketplace")} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
            View in Ads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-32">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Megaphone className="w-4 h-4 text-primary" />
          <h1 className="text-base font-semibold">Create Ad</h1>
        </div>
        <button
          onClick={publish}
          disabled={!canPublish}
          className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Publish
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Type selector */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Ad type</p>
          <div className="grid grid-cols-3 gap-2">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setType(t.id);
                  if (t.id === "text") setMediaUrl("");
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${
                  type === t.id ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <t.icon className={`w-6 h-6 ${t.color}`} />
                <span className="text-xs font-medium">{t.label}</span>
                {type === t.id && <Check className="w-3 h-3 text-primary" />}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">{types.find((t) => t.id === type)?.hint}</p>
        </div>

        {/* Media uploader */}
        {(type === "image" || type === "video") && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Media *</p>
            {mediaUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                {type === "image" ? (
                  <img src={mediaUrl} alt="ad media" className="w-full max-h-72 object-cover" />
                ) : (
                  <video src={mediaUrl} controls className="w-full max-h-72" />
                )}
                <button
                  onClick={() => setMediaUrl("")}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center gap-2 py-10 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors"
              >
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tap to upload {type}</span>
                <span className="text-[10px] text-muted-foreground">Max 10MB</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept={type === "image" ? "image/*" : "video/*"} className="hidden" onChange={handleFile} />
          </div>
        )}

        {/* Background picker for text ads */}
        {type === "text" && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Background</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {bgPresets.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setBgColor(bg)}
                  className={`shrink-0 w-12 h-12 rounded-xl border-2 transition-all ${bgColor === bg ? "border-primary scale-105" : "border-transparent"}`}
                  style={{ background: bg }}
                  aria-label="Background"
                />
              ))}
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Title *</label>
            <span className={`text-[10px] ${title.length > TITLE_MAX ? "text-destructive" : "text-muted-foreground"}`}>
              {title.length}/{TITLE_MAX}
            </span>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Catchy headline"
            maxLength={TITLE_MAX + 20}
            className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary"
          />
          {titleErr && <p className="text-[11px] text-destructive mt-1">{titleErr}</p>}
        </div>

        {/* Body */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Description</label>
            <span className={`text-[10px] ${body.length > BODY_MAX ? "text-destructive" : "text-muted-foreground"}`}>
              {body.length}/{BODY_MAX}
            </span>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell people about your ad"
            rows={4}
            className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        {/* CTA */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Call-to-action (optional)</label>
          <input
            value={ctaUrl}
            onChange={(e) => setCtaUrl(e.target.value)}
            placeholder="https://your-link.com, +1 555 0100, or you@email.com"
            className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary"
          />
          {urlErr && <p className="text-[11px] text-destructive mt-1">{urlErr}</p>}
          {!urlErr && ctaInfo.valid && (
            <p className="text-[11px] text-primary mt-1">
              Detected: {ctaInfo.kind === "tel" ? "Phone — opens dialer" : ctaInfo.kind === "mail" ? "Email — opens mail app" : "Web link"}
            </p>
          )}
          {ctaUrl && (
            <div className="flex gap-1.5 flex-wrap mt-2">
              {ctaPresets.map((p) => (
                <button
                  key={p}
                  onClick={() => setCtaLabel(p)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                    ctaLabel === p ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preview */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Live preview</p>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-base">
                {activeProfile?.avatar || "📢"}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold">{activeProfile?.name || "You"}</p>
                  <span className="text-[9px] uppercase tracking-wide text-primary font-bold">Sponsored</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Just now</p>
              </div>
            </div>
            {type === "image" && mediaUrl && <img src={mediaUrl} alt="" className="w-full max-h-64 object-cover" />}
            {type === "video" && mediaUrl && <video src={mediaUrl} className="w-full max-h-64 object-cover" muted autoPlay loop playsInline />}
            {type === "text" && (
              <div className="px-5 py-10 text-center" style={{ background: bgColor }}>
                <Megaphone className="w-6 h-6 mx-auto mb-3 text-white" />
                <p className="text-lg font-bold leading-tight text-white">{title || "Your headline here"}</p>
              </div>
            )}
            <div className="p-3">
              {type !== "text" && <p className="text-sm font-bold">{title || "Your ad title"}</p>}
              {body && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{body}</p>}
              {ctaUrl && (
                <button className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  <ExternalLink className="w-3.5 h-3.5" />
                  {ctaLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAd;
