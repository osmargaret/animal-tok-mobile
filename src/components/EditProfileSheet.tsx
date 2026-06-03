import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface EditProfileSheetProps {
  open: boolean;
  onClose: () => void;
}

const EditProfileSheet = ({ open, onClose }: EditProfileSheetProps) => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setBio(user.profile?.bio || "");
    setPhone(user.profile?.phone || "");
    setLocation(user.profile?.location || "");
    setWebsite(user.profile?.website || "");
    setBusinessName(user.businessName || "");
  }, [user, open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!user) return null;
  const isBusiness = user.accountType === "business";

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    updateProfile({
      name: name.trim(),
      businessName: isBusiness ? businessName.trim() || name.trim() : undefined,
      profile: { bio, phone, location, website },
    });
    toast.success("Profile updated");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            role="dialog"
            aria-label="Edit profile"
            aria-modal="true"
            className="fixed inset-x-0 bottom-0 z-[51] bg-card border-t border-border rounded-t-2xl max-h-[90dvh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border px-5 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold">Edit profile</h2>
              <button
                onClick={onClose}
                aria-label="Close edit profile"
                className="p-1.5 rounded-full hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="w-5 h-5 text-muted-foreground" aria-hidden />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <Field label="Display name *" value={name} onChange={setName} placeholder="Alex Morgan" />
              {isBusiness && (
                <Field label="Business name" value={businessName} onChange={setBusinessName} placeholder="Acme Pets Inc." />
              )}
              <Field label="Short bio" value={bio} onChange={setBio} placeholder="Tell people about you…" textarea />
              <Field label="Phone" value={phone} onChange={setPhone} placeholder="+1 555 0123" type="tel" />
              <Field label="Location" value={location} onChange={setLocation} placeholder="City, Country" />
              {isBusiness && (
                <Field label="Website" value={website} onChange={setWebsite} placeholder="https://yourbusiness.com" type="url" />
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-secondary text-foreground text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Save changes
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
}) => {
  const id = `pf-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground mb-1 block">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
        />
      )}
    </div>
  );
};

export default EditProfileSheet;
