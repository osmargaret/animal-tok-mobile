import { useRef, useState } from "react";
import DesktopSidebar from "@/components/DesktopSidebar";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";
import { ArrowLeft, Upload, MapPin, Loader2, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useIpLocation } from "@/hooks/useIpLocation";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement } from "@/contexts/EngagementContext";

type PostType = "image" | "video" | "text";

const CreatePost = () => {
  const navigate = useNavigate();
  const { activeProfile } = useAuth();
  const { addPost } = useEngagement();
  const [postType, setPostType] = useState<PostType>("image");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [textContent, setTextContent] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { location, loading: locLoading, refresh } = useIpLocation();

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 25 * 1024 * 1024) return toast.error("File too large (max 25MB)");
    const reader = new FileReader();
    reader.onload = () => setMediaUrl(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handlePost = () => {
    if (!activeProfile) return toast.error("Sign in to post");
    if (postType === "text" && !textContent.trim()) {
      toast.error("Write something before posting");
      return;
    }
    if (postType !== "text" && !mediaUrl) {
      toast.error(`Add ${postType === "image" ? "an image" : "a video"} first`);
      return;
    }
    addPost({
      type: postType,
      caption: caption.trim(),
      textContent: postType === "text" ? textContent.trim() : undefined,
      hashtags: hashtags.split(/\s+/).filter(Boolean),
      mediaUrl: mediaUrl || undefined,
      isPublic,
      authorId: activeProfile.id,
      authorName: activeProfile.name,
      authorAvatar: activeProfile.avatar,
      authorUsername: activeProfile.username,
      location: location ? { city: location.city, country: location.country } : null,
    });
    toast.success(location ? `Posted from ${location.city || location.country || "your location"}` : "Posted to your feed");
    navigate("/feed");
  };

  const tabs: { type: PostType; label: string; icon: string }[] = [
    { type: "image", label: "Image", icon: "📷" },
    { type: "video", label: "Video", icon: "🎬" },
    { type: "text", label: "Text", icon: "📝" },
  ];

  return (
    <div className="h-[100dvh] overflow-hidden bg-background">
      <DesktopSidebar onEventsOpen={() => {}} />
      <MobileHeader />

      <main className="h-full lg:ml-60 overflow-y-auto pb-20 lg:pb-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Create new post</h1>
          </div>
          <button className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-muted-foreground hover:bg-secondary/80 transition-colors">
            Draft
          </button>
        </div>

        <div className="px-5 mt-2 flex flex-col gap-5">
          {/* Post Type Tabs */}
          <div className="flex gap-2 p-1 rounded-xl bg-secondary/50">
            {tabs.map((tab) => (
              <button
                key={tab.type}
                onClick={() => setPostType(tab.type)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  postType === tab.type
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* Upload Area (image/video) */}
          {postType !== "text" && (
            mediaUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-border">
                {postType === "image" ? (
                  <img src={mediaUrl} alt="upload preview" className="w-full max-h-80 object-cover" />
                ) : (
                  <video src={mediaUrl} controls className="w-full max-h-80 bg-black" />
                )}
                <button
                  onClick={() => setMediaUrl("")}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
                  aria-label="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Tap to upload</p>
                <p className="text-xs text-muted-foreground">
                  {postType === "image" ? "JPG, PNG, GIF · Max 25MB" : "MP4, MOV · Max 25MB"}
                </p>
                <span className="mt-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/20">
                  Browse files
                </span>
              </button>
            )
          )}
          <input
            ref={fileRef}
            type="file"
            accept={postType === "image" ? "image/*" : "video/*"}
            className="hidden"
            onChange={onFile}
          />


          {/* Text Post Area */}
          {postType === "text" && (
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Write your text post</label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full min-h-[120px] rounded-xl bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/50 transition-colors"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Max 2200 characters · No media required</p>
            </div>
          )}

          {/* Caption */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="w-full min-h-[80px] rounded-xl bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/50 transition-colors"
            />
            <p className="text-[11px] text-muted-foreground mt-1">🐾 Max 2200 characters</p>
          </div>

          {/* Hashtags */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Hashtags</label>
            <input
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#pets #animaltok #cute"
              className="w-full h-10 rounded-xl bg-card border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Auto-detected location */}
          <div className="rounded-2xl bg-card border border-border px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">Location · auto-detected</p>
              {locLoading ? (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Loader2 className="w-3 h-3 animate-spin" /> Detecting from your network…
                </p>
              ) : location ? (
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {[location.city, location.region, location.country].filter(Boolean).join(", ") || "Detected"}
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground mt-0.5">Couldn't detect — post will be unlisted by location</p>
              )}
            </div>
            <button
              onClick={refresh}
              disabled={locLoading}
              className="p-1.5 rounded-full hover:bg-secondary transition-colors disabled:opacity-50"
              aria-label="Refresh location"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${locLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Footer: Visibility + Actions */}
          <div className="flex items-center justify-between py-3 border-t border-border mt-1 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={() => setIsPublic(!isPublic)}
                className="w-4 h-4 rounded border-border text-primary accent-primary"
              />
              <span className="text-sm text-foreground font-medium">Public</span>
            </label>
            <div className="flex gap-2">
              <button className="px-4 py-2.5 rounded-xl bg-secondary text-sm font-medium text-muted-foreground hover:bg-secondary/80 transition-colors">
                Save draft
              </button>
              <button onClick={handlePost} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                Post
              </button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default CreatePost;
