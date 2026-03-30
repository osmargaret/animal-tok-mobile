import { Home, Compass, Plus, Inbox, User } from "lucide-react";

interface BottomNavProps {
  onAuthOpen: () => void;
}

const BottomNav = ({ onAuthOpen }: BottomNavProps) => {
  const handleCreate = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        alert(`Selected video: ${file.name}\nPost creation coming soon!`);
      }
    };
    input.click();
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border">
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <NavItem icon={<Home className="w-5 h-5" />} label="Home" active />
        <NavItem icon={<Compass className="w-5 h-5" />} label="Explore" />
        <button onClick={handleCreate} className="flex flex-col items-center gap-0.5 -mt-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Plus className="w-5 h-5 text-primary-foreground" />
          </div>
        </button>
        <NavItem icon={<Inbox className="w-5 h-5" />} label="Inbox" />
        <NavItem icon={<User className="w-5 h-5" />} label="Profile" onClick={onAuthOpen} />
      </div>
    </nav>
  );
};

const NavItem = ({
  icon, label, active, onClick,
}: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-0.5 relative">
    <span className={active ? "text-foreground" : "text-muted-foreground"}>{icon}</span>
    <span className={`text-[10px] ${active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
  </button>
);

export default BottomNav;
