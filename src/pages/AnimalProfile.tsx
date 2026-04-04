import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Heart, MessageCircle, Share2, Bookmark, Grid3X3, Lock, BookmarkCheck, ThumbsUp, CalendarDays, FileText } from "lucide-react";
import DesktopSidebar from "@/components/DesktopSidebar";
import BottomNav from "@/components/BottomNav";
import { animalProfiles } from "@/data/animalProfiles";
import { useState } from "react";

const tabs = [
  { id: "posts", label: "All posts", icon: Grid3X3 },
  { id: "lock", label: "Lock", icon: Lock },
  { id: "saves", label: "Saves", icon: BookmarkCheck },
  { id: "likes", label: "Likes", icon: ThumbsUp },
  { id: "events", label: "Events", icon: CalendarDays },
];

const AnimalProfile = () => {
  const { animalId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");

  const animal = animalProfiles.find((a) => a.id === animalId);

  if (!animal) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-4xl mb-4">🐾</p>
          <p className="text-foreground font-semibold">Animal not found</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-primary text-sm">Go back</button>
        </div>
      </div>
    );
  }

  const totalViews = animal.posts.reduce((s, p) => s + p.views, 0);
  const totalLikes = animal.posts.reduce((s, p) => s + p.likes, 0);
  const totalComments = animal.posts.reduce((s, p) => s + p.comments, 0);
  const totalShares = animal.posts.reduce((s, p) => s + p.shares, 0);
  const totalSaves = animal.posts.reduce((s, p) => s + p.saves, 0);

  const formatNum = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n));

  return (
    <div className="h-[100dvh] overflow-hidden bg-background">
      <DesktopSidebar onEventsOpen={() => {}} />

      <main className="h-full lg:ml-60 overflow-y-auto pb-20 lg:pb-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-foreground truncate">{animal.name}</h1>
            <p className="text-xs text-muted-foreground">{animal.breed} · {animal.age}</p>
          </div>
        </div>

        {/* Profile Views Banner */}
        <div className="mx-4 mt-3 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-xs text-primary font-medium">{animal.profileViews} profile views</span>
        </div>

        {/* Profile Header */}
        <div className="px-5 pt-5 pb-3 flex flex-col items-center text-center">
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${animal.gradient} flex items-center justify-center text-5xl border-[3px] border-primary shadow-lg shadow-primary/20`}>
            {animal.emoji}
          </div>
          <h2 className="mt-3 text-xl font-bold text-foreground">{animal.name}</h2>
          <p className="text-sm text-muted-foreground">{animal.username}</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">{animal.bio}</p>

          {/* Stats Row */}
          <div className="flex gap-8 mt-4">
            <StatBlock value={formatNum(animal.following)} label="Following" />
            <StatBlock value={formatNum(animal.followers)} label="Followers" />
            <StatBlock value={formatNum(animal.likes)} label="Likes" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drafts Banner */}
        {animal.drafts > 0 && (
          <div className="mx-4 mt-3 px-4 py-2.5 rounded-xl bg-card border border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-foreground font-medium">Drafts: {animal.drafts}</span>
            </div>
            <span className="text-xs text-muted-foreground">{animal.draftsSize}</span>
          </div>
        )}

        {/* Engagement Stats */}
        <div className="mx-4 mt-3 grid grid-cols-5 gap-2">
          <EngagementStat icon={<Eye className="w-4 h-4" />} value={formatNum(totalViews)} label="views" />
          <EngagementStat icon={<Heart className="w-4 h-4" />} value={formatNum(totalLikes)} label="likes" />
          <EngagementStat icon={<MessageCircle className="w-4 h-4" />} value={formatNum(totalComments)} label="comments" />
          <EngagementStat icon={<Share2 className="w-4 h-4" />} value={formatNum(totalShares)} label="shares" />
          <EngagementStat icon={<Bookmark className="w-4 h-4" />} value={formatNum(totalSaves)} label="saves" />
        </div>

        {/* Posts Grid */}
        <div className="px-4 mt-4 grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
          {animal.posts.map((post) => (
            <div key={post.id} className="relative aspect-[3/4] group cursor-pointer">
              <img
                src={post.thumbnail}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-3 text-white text-xs font-medium">
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{formatNum(post.likes)}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{formatNum(post.comments)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-6" />
      </main>

      <BottomNav />
    </div>
  );
};

const StatBlock = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <p className="text-base font-bold text-foreground">{value}</p>
    <p className="text-[11px] text-muted-foreground">{label}</p>
  </div>
);

const EngagementStat = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
  <div className="flex flex-col items-center gap-1 py-3 rounded-xl bg-card border border-border">
    <span className="text-primary">{icon}</span>
    <p className="text-sm font-bold text-foreground">{value}</p>
    <p className="text-[10px] text-muted-foreground">{label}</p>
  </div>
);

export default AnimalProfile;
