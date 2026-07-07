import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement } from "@/contexts/EngagementContext";
import DesktopSidebar from "@/components/DesktopSidebar";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";
import StoriesRow from "@/components/StoriesRow";
import QRSheet from "@/components/QRSheet";
import { Edit2, Plus, ShoppingBag, Calendar, Store, Heart, MessageCircle, UserPlus, Megaphone, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackButton from "@/components/BackButton";
import VerifiedBadge from "@/components/VerifiedBadge";
import ProfileCompletion from "@/components/ProfileCompletion";
import EditProfileSheet from "@/components/EditProfileSheet";
import ReportBlockMenu from "@/components/ReportBlockMenu";
import { toast } from "sonner";

const pets = [
  {
    id: "bella",
    name: "Bella",
    breed: "Labrador · 3 yrs",
    followers: "1.2K followers",
    emoji: "🐕",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    id: "whiskers",
    name: "Whiskers",
    breed: "Maine Coon · 5 yrs",
    followers: "890 followers",
    emoji: "🐱",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: "spirit",
    name: "Spirit",
    breed: "Arabian · 8 yrs",
    followers: "2.3K followers",
    emoji: "🐴",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
];

const HandlerProfile = () => {
  const { user, isAuthenticated, activeProfile, verified, verificationStatus } = useAuth();
  const { isFollowing: getFollowing, toggleFollow, ads } = useEngagement();
  const navigate = useNavigate();
  const handlerId = user?.id || "handler-1";
  const isFollowing = activeProfile ? getFollowing(activeProfile.id, handlerId) : false;
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const isOwnProfile = isAuthenticated && activeProfile?.type === "handler";

  return (
    <div className="h-[100dvh] overflow-hidden bg-background">
      <DesktopSidebar onEventsOpen={() => {}} />
      <MobileHeader />

      <main className="h-full lg:ml-60 overflow-y-auto pb-20 lg:pb-0">
        <div className="lg:hidden flex items-center gap-3 px-5 pt-[max(3.75rem,calc(env(safe-area-inset-top)+3.25rem))]">
          <BackButton to="/feed" />
          <span className="text-xs text-muted-foreground">Back</span>
        </div>
        {/* Profile Header */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-4xl border-[3px] border-primary shadow-lg shadow-primary/20">
                {user?.avatar || "🐾"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-background" aria-hidden />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{user?.name || "Alex Chen"}</h1>
                <VerifiedBadge verified={verified} status={verificationStatus} />
              </div>
              <p className="text-sm text-muted-foreground">{user?.username || "@alex.handler"}</p>

              <div className="flex gap-4 mt-2">
                <StatItem value="124" label="Posts" />
                <StatItem value="3.2K" label="Followers" />
                <button onClick={() => navigate("/ads")} className="text-center hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded" aria-label="View my ads">
                  <p className="text-sm font-bold text-foreground">{ads.filter((a) => a.createdBy === (activeProfile?.id || "")).length}</p>
                  <p className="text-[10px] text-muted-foreground">Ads</p>
                </button>
              </div>
            </div>

            {isOwnProfile ? (
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Edit2 className="w-3.5 h-3.5" aria-hidden />
                Edit
              </button>
            ) : (
              <ReportBlockMenu targetId={handlerId} targetName={user?.name || "this user"} />
            )}
            <button
              onClick={() => setShareOpen(true)}
              aria-label="Share profile"
              className="w-9 h-9 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Share2 className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Bio */}
          {user?.profile?.bio && (
            <p className="text-sm text-foreground/90 mt-3 leading-relaxed">{user.profile.bio}</p>
          )}

          {/* Profile completion for own profile */}
          {isOwnProfile && (
            <div className="mt-4">
              <ProfileCompletion onEdit={() => setEditOpen(true)} />
            </div>
          )}

          {isAuthenticated && !isOwnProfile && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => activeProfile && toggleFollow(activeProfile.id, handlerId)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isFollowing
                    ? "bg-secondary text-secondary-foreground border border-border"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <UserPlus className="w-4 h-4" aria-hidden />
                {isFollowing ? "Following" : "Follow"}
              </button>
              <button
                onClick={() => navigate("/message/handler")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <MessageCircle className="w-4 h-4" aria-hidden />
                Message
              </button>
            </div>
          )}
        </div>

        {/* Story highlights */}
        <StoriesRow canAdd={isOwnProfile} />


        {/* My Pets Section */}
        <div className="px-5 mt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">My Pets</h2>
              <p className="text-xs text-muted-foreground">3 profiles</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {pets.map((pet) => (
              <PetCard key={pet.name} {...pet} />
            ))}

            <button
              onClick={() => {
                toast("Add a new pet profile", { description: "Tell us about your new companion." });
                navigate("/create");
              }}
              aria-label="Add a new pet profile"
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all min-h-[180px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Plus className="w-5 h-5 text-muted-foreground" aria-hidden />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Add new</span>
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="px-5 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickLink icon={<ShoppingBag className="w-5 h-5" />} label="My Store" onClick={() => navigate("/store")} />
          <QuickLink icon={<Calendar className="w-5 h-5" />} label="Events" onClick={() => navigate("/events")} />
          <QuickLink icon={<Store className="w-5 h-5" />} label="Marketplace" onClick={() => navigate("/marketplace")} />
          <QuickLink icon={<Megaphone className="w-5 h-5" />} label="My Ads" onClick={() => navigate("/ads")} />
        </div>
      </main>

      <EditProfileSheet open={editOpen} onClose={() => setEditOpen(false)} />
      <BottomNav />
    </div>
  );
};

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <p className="text-sm font-bold text-foreground">{value}</p>
    <p className="text-[10px] text-muted-foreground">{label}</p>
  </div>
);

const PetCard = ({
  id,
  name,
  breed,
  followers,
  emoji,
  gradient,
}: {
  id: string;
  name: string;
  breed: string;
  followers: string;
  emoji: string;
  gradient: string;
}) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/animal/${id}`)}
      aria-label={`Open ${name}'s profile`}
      className="relative rounded-2xl bg-card border border-border p-4 flex flex-col items-center gap-2 hover:border-primary/30 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left"
    >
      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl border-2 border-border`} aria-hidden>
        {emoji}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{name}</h3>
      <p className="text-[11px] text-muted-foreground">{breed}</p>
      <p className="text-[11px] text-primary font-medium">{followers}</p>

      <div className="flex gap-2 mt-1">
        <span className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center" aria-hidden>
          <Heart className="w-3.5 h-3.5 text-muted-foreground" />
        </span>
        <span className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center" aria-hidden>
          <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
        </span>
      </div>
    </button>
  );
};

const QuickLink = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <span className="text-primary" aria-hidden>{icon}</span>
    {label}
  </button>
);

export default HandlerProfile;
