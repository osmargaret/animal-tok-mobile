import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, Video, Type, Upload, Megaphone, X, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement, type AdMedia } from "@/contexts/EngagementContext";

const types: { id: AdMedia; label: string; icon: typeof ImageIcon; color: string }[] = [
  { id: "image", label: "Image", icon: ImageIcon, color: "text-emerald-400" },
  { id: "video", label: "Video", icon: Video, color: "text-blue-400" },
  { id: "text", label: "Text", icon: Type, color: "text-purple-400" },
];

const CreateAd = () => {
  const navigate = useNavigate();
  const { activeProfile } = useAuth();
  const { addAd } = useEngagement();
  const [type, setType] = useState<AdMedia>("image");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setMediaUrl(reader.result as string);
    reader.readAsDataURL(f);
  };

  const publish = () => {
    if (!activeProfile) return toast.error("Sign in to create an ad");
    if (!title.trim()) return toast.error("Add a title");
    if ((type === "image" || type === "video") && !mediaUrl)
      return toast.error(`Pick ${type === "image" ? "an image" : "a video"} for your ad`);
    addAd(activeProfile.id, { type, title: title.trim(), body: body.trim(), mediaUrl, ctaUrl: ctaUrl.trim() || undefined });
    toast.success("Ad published");
    navigate("/feed");
  };

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
        <button onClick={publish} className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
          Publish
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
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
        </div>

        {(type === "image" || type === "video") && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Media</p>
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
              </button>
            )}
            <input ref={fileRef} type="file" accept={type === "image" ? "image/*" : "video/*"} className="hidden" onChange={handleFile} />
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Catchy headline"
            className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Description</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell people about your ad"
            rows={4}
            className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Call-to-action URL (optional)</label>
          <input
            value={ctaUrl}
            onChange={(e) => setCtaUrl(e.target.value)}
            placeholder="https://your-link.com"
            className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Preview */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Preview</p>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {type === "image" && mediaUrl && <img src={mediaUrl} alt="" className="w-full h-48 object-cover" />}
            {type === "video" && mediaUrl && <video src={mediaUrl} className="w-full h-48 object-cover" muted autoPlay loop />}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-wide text-primary font-bold">Sponsored</span>
                <span className="text-[10px] text-muted-foreground">· by {activeProfile?.name || "You"}</span>
              </div>
              <p className="text-sm font-bold">{title || "Your ad title"}</p>
              <p className="text-xs text-muted-foreground mt-1">{body || "Your description appears here."}</p>
              {ctaUrl && (
                <button className="mt-3 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  Learn more
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
