import { useAuth } from "@/contexts/AuthContext";
import DesktopSidebar from "@/components/DesktopSidebar";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";
import { Edit2, Plus, ShoppingBag, Bookmark, Calendar, User, Heart, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const pets = [
  {
    name: "Bella",
    breed: "Labrador · 3 yrs",
    followers: "1.2K followers",
    emoji: "🐕",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    name: "Whiskers",
    breed: "Maine Coon · 5 yrs",
    followers: "890 followers",
    emoji: "🐱",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    name: "Spirit",
    breed: "Arabian · 8 yrs",
    followers: "2.3K followers",
    emoji: "🐴",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
];

const HandlerProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="h-[100dvh] overflow-hidden bg-background">
      <DesktopSidebar onEventsOpen={() => {}} />
      <MobileHeader />

      <main className="h-full lg:ml-60 overflow-y-auto pb-20 lg:pb-0">
        {/* Profile Header */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-4xl border-[3px] border-primary shadow-lg shadow-primary/20">
                {user?.avatar || "🐾"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-background" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground">{user?.name || "Alex Chen"}</h1>
              <p className="text-sm text-muted-foreground">{user?.username || "@alex.handler"}</p>

              {/* Stats */}
              <div className="flex gap-4 mt-2">
                <StatItem value="124" label="Posts" />
                <StatItem value="3.2K" label="Followers" />
                <StatItem value="622" label="Likes" />
              </div>
            </div>

            {/* Edit Button */}
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>
        </div>

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

            {/* Add New Card */}
            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all min-h-[180px]">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Add new</span>
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="px-5 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickLink icon={<ShoppingBag className="w-5 h-5" />} label="My Store" />
          <QuickLink icon={<Bookmark className="w-5 h-5" />} label="Saved" />
          <QuickLink icon={<Calendar className="w-5 h-5" />} label="Calendar" />
          <QuickLink icon={<User className="w-5 h-5" />} label="Profile" />
        </div>
      </main>

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
  name,
  breed,
  followers,
  emoji,
  gradient,
}: {
  name: string;
  breed: string;
  followers: string;
  emoji: string;
  gradient: string;
}) => (
  <div className="relative rounded-2xl bg-card border border-border p-4 flex flex-col items-center gap-2 hover:border-primary/30 transition-colors">
    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl border-2 border-border`}>
      {emoji}
    </div>
    <h3 className="text-sm font-semibold text-foreground">{name}</h3>
    <p className="text-[11px] text-muted-foreground">{breed}</p>
    <p className="text-[11px] text-primary font-medium">{followers}</p>

    <div className="flex gap-2 mt-1">
      <button className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors">
        <Heart className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
      <button className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors">
        <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  </div>
);

const QuickLink = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <button className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-medium text-foreground">
    <span className="text-primary">{icon}</span>
    {label}
  </button>
);

export default HandlerProfile;
