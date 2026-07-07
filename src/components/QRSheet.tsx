import { useState } from "react";
import { X, Link2, QrCode, Download, Twitter, Facebook, Send, Mail, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import { toast } from "sonner";

interface QRSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  url?: string;
}

const QRSheet = ({ open, onClose, title = "Share profile", subtitle, url }: QRSheetProps) => {
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const [mode, setMode] = useState<"share" | "qr">("share");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const openExternal = (href: string) => window.open(href, "_blank", "noopener,noreferrer");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(title);

  const downloadQR = () => {
    const svg = document.getElementById("qr-share-svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${(title || "profile").replace(/\s+/g, "-").toLowerCase()}-qr.svg`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("QR downloaded");
  };

  const targets = [
    { key: "copy", label: copied ? "Copied" : "Copy link", icon: <Link2 className="w-5 h-5" />, onClick: copy },
    { key: "message", label: "Message", icon: <MessageCircle className="w-5 h-5" />, onClick: () => openExternal(`sms:?body=${encodedText}%20${encodedUrl}`) },
    { key: "mail", label: "Email", icon: <Mail className="w-5 h-5" />, onClick: () => openExternal(`mailto:?subject=${encodedText}&body=${encodedUrl}`) },
    { key: "twitter", label: "X", icon: <Twitter className="w-5 h-5" />, onClick: () => openExternal(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`) },
    { key: "facebook", label: "Facebook", icon: <Facebook className="w-5 h-5" />, onClick: () => openExternal(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`) },
    { key: "telegram", label: "Telegram", icon: <Send className="w-5 h-5" />, onClick: () => openExternal(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`) },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[61] bg-card border-t border-border rounded-t-3xl lg:left-60 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
            role="dialog"
            aria-label="Share"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary" aria-label="Close">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex gap-1 px-5 pt-3">
              <button
                onClick={() => setMode("share")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${mode === "share" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
              >
                Share
              </button>
              <button
                onClick={() => setMode("qr")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${mode === "qr" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
              >
                <QrCode className="w-3.5 h-3.5" />
                QR code
              </button>
            </div>

            {mode === "share" ? (
              <>
                <div className="px-5 pt-4">
                  <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2.5">
                    <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-foreground/80 truncate flex-1">{shareUrl}</span>
                    <button onClick={copy} className="text-xs font-semibold text-primary px-2 py-1 rounded-md hover:bg-primary/10">
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 p-5">
                  {targets.map((t) => (
                    <button
                      key={t.key}
                      onClick={t.onClick}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-xl hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-foreground">{t.icon}</div>
                      <span className="text-[11px] text-muted-foreground text-center leading-tight">{t.label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center px-5 py-6">
                <div className="p-4 rounded-2xl bg-white">
                  <QRCode id="qr-share-svg" value={shareUrl} size={180} level="M" />
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center max-w-[260px]">
                  Scan with a phone camera to open this profile.
                </p>
                <button
                  onClick={downloadQR}
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
                >
                  <Download className="w-4 h-4" />
                  Download QR
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QRSheet;
