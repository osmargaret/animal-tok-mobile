import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Heart, MessageCircle, Share2, Bookmark, Grid3X3, Lock, BookmarkCheck, ThumbsUp, CalendarDays, FileText, Play, RefreshCw, UserPlus } from "lucide-react";
import DesktopSidebar from "@/components/DesktopSidebar";
import BottomNav from "@/components/BottomNav";
import { animalProfiles } from "@/data/animalProfiles";
import { animalFeeds } from "@/data/animalFeedData";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement } from "@/contexts/EngagementContext";
import ActionIcons from "@/components/ActionIcons";
import CommentsPanel from "@/components/CommentsPanel";
import VerifiedBadge from "@/components/VerifiedBadge";
import AnimalProfileCompletion from "@/components/AnimalProfileCompletion";
import { useAnimalMeta } from "@/hooks/useAnimalMeta";
import { useState, useRef, useEffect } from "react";

const tabs = [
  { id: "feed", label: "Feed", icon: Play },
  { id: "posts", label: "All posts", icon: Grid3X3 },
  { id: "lock", label: "Lock", icon: Lock },
  { id: "saves", label: "Saves", icon: BookmarkCheck },
  { id: "likes", label: "Likes", icon: ThumbsUp },
  { id: "events", label: "Events", icon: CalendarDays },
];

const AnimalProfile = () => {
  const { animalId } = useParams();
  const navigate = useNavigate();
  const { activeProfile, switchProfile, isAuthenticated } = useAuth();
  const { isFollowing: getFollowing, toggleFollow } = useEngagement();
  const [activeTab, setActiveTab] = useState("feed");
  const [feedIndex, setFeedIndex] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const animal = animalProfiles.find((a) => a.id === animalId);
  const animalFeed = animalFeeds[animalId || ""] || [];
  const { verificationStatus, verified, meta: animalMeta } = useAnimalMeta(animalId);

  const isOwnAnimal = isAuthenticated && activeProfile?.type === "handler";
  const isActiveAnimal = activeProfile?.type === "animal" && activeProfile?.id === animalId;

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    const handleScroll = () => {
      const scrollTop = feed.scrollTop;
      const height = feed.clientHeight;
      const index = Math.round(scrollTop / height);
      setFeedIndex(Math.min(index, animalFeed.length - 1));
    };
    feed.addEventListener("scroll", handleScroll, { passive: true });
    return () => feed.removeEventListener("scroll", handleScroll);
  }, [animalFeed.length]);

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

  const handleSwitchToAnimal = () => {
    switchProfile({
      id: animal.id,
      name: animal.name,
      username: animal.username,
      avatar: animal.emoji,
      type: "animal",
    });
  };

  const handleMessage = () => {
    navigate(`/message/${animal.id}`);
  };

  const isFollowing = activeProfile ? getFollowing(activeProfile.id, animal.id) : false;
  const handleToggleFollow = () => {
    if (activeProfile) toggleFollow(activeProfile.id, animal.id);
  };

  const totalViews = animal.posts.reduce((s, p) => s + p.views, 0);
  const totalLikes = animal.posts.reduce((s, p) => s + p.likes, 0);
  const totalComments = animal.posts.reduce((s, p) => s + p.comments, 0);
  const totalShares = animal.posts.reduce((s, p) => s + p.shares, 0);
  const totalSaves = animal.posts.reduce((s, p) => s + p.saves, 0);

  const formatNum = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n));

  return (
    <div className="h-[100dvh] overflow-hidden bg-background">
      <DesktopSidebar onEventsOpen={() => {}} />

      {activeTab === "feed" && animalFeed.length > 0 ? (
        <main className="h-full lg:ml-60 relative">
          <div className="absolute top-0 left-0 right-0 z-20 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center gap-3">
            <button onClick={() => setActiveTab("posts")} className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${animal.gradient} flex items-center justify-center text-lg border border-white/30`}>
                {animal.emoji}
              </div>
              <div>
                <p className="text-sm font-semibold text-white drop-shadow flex items-center gap-1">
                  {animal.name}
                  <VerifiedBadge status={verificationStatus} verified={verified} />
                </p>
                <p className="text-[10px] text-white/70">{animal.username}</p>
              </div>
            </div>
            {isAuthenticated && !isActiveAnimal && (
              <button onClick={handleSwitchToAnimal} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                <RefreshCw className="w-3 h-3" />
                Switch
              </button>
            )}
            {isActiveAnimal && (
              <span className="px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-medium">
                Active
              </span>
            )}
          </div>

          <div ref={feedRef} className="h-full overflow-y-auto snap-y-mandatory scrollbar-hide">
            {animalFeed.map((post) => (
              <div key={post.id} className="h-[100dvh] relative snap-start">
                <div className="absolute inset-0">
                  <img src={post.posterUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                </div>
                <div className="absolute bottom-24 left-0 right-16 px-4">
                  <p className="text-white text-sm font-medium mb-1">{post.caption}</p>
                  <p className="text-white/60 text-xs">{post.hashtags}</p>
                </div>
                <ActionIcons post={post} onCommentOpen={() => setCommentsOpen(true)} />
              </div>
            ))}
          </div>

          {animalFeed[feedIndex] && (
            <CommentsPanel post={animalFeed[feedIndex]} open={commentsOpen} onClose={() => setCommentsOpen(false)} />
          )}
        </main>
      ) : (
        <main className="h-full lg:ml-60 overflow-y-auto pb-20 lg:pb-0">
          {/* Top Bar */}
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold text-foreground truncate flex items-center gap-1">
                {animal.name}
                <VerifiedBadge status={verificationStatus} verified={verified} />
              </h1>
              <p className="text-xs text-muted-foreground">{animal.breed} · {animal.age}</p>
            </div>
            {isAuthenticated && isOwnAnimal && !isActiveAnimal && (
              <button onClick={handleSwitchToAnimal} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
                Switch to {animal.name}
              </button>
            )}
            {isActiveAnimal && (
              <span className="px-3 py-1.5 rounded-xl bg-green-500/20 border border-green-500/40 text-green-500 text-xs font-semibold">
                ✓ Active Profile
              </span>
            )}
          </div>

          {/* Profile Views Banner */}
          <div className="mx-4 mt-3 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary font-medium">{animal.profileViews} profile views</span>
          </div>

          {/* Profile Header */}
          <div className="px-5 pt-5 pb-3 flex flex-col items-center text-center">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${animal.gradient} flex items-center justify-center text-5xl border-[3px] ${isActiveAnimal ? "border-green-500 ring-2 ring-green-500/30" : "border-primary"} shadow-lg shadow-primary/20`}>
              {animal.emoji}
            </div>
            <h2 className="mt-3 text-xl font-bold text-foreground flex items-center gap-1.5">
              {animal.name}
              <VerifiedBadge status={verificationStatus} verified={verified} size="md" />
            </h2>
            <p className="text-sm text-muted-foreground">{animal.username}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{animal.breed} · {animal.age}</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">{animalMeta.bio || animal.bio}</p>

            {/* Follow + Message Buttons (visible to non-owners) */}
            {isAuthenticated && !isOwnAnimal && !isActiveAnimal && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleToggleFollow}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isFollowing
                      ? "bg-secondary text-secondary-foreground border border-border"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <button
                  onClick={handleMessage}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>
              </div>
            )}

            {/* Stats Row */}
            <div className="flex gap-8 mt-4">
              <StatBlock value={formatNum(animal.following)} label="Following" />
              <StatBlock value={formatNum(animal.followers + (isFollowing ? 1 : 0))} label="Followers" />
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
              <div key={post.id} className="relative aspect-[3/4] group cursor-pointer" onClick={() => setActiveTab("feed")}>
                <img src={post.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
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
      )}

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
