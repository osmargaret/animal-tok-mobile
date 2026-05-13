import type { ChatMessage } from "@/contexts/MessagingContext";

export const previewForMessage = (m?: ChatMessage | null): string => {
  if (!m) return "";
  switch (m.type) {
    case "text":
      return m.text || "";
    case "image":
      return "📷 Photo";
    case "video":
      return "🎬 Video";
    case "voice":
      return `🎙️ Voice note${m.duration ? ` · ${m.duration}` : ""}`;
    case "document":
      return "📄 Document";
    case "location":
      return "📍 Location";
    default:
      return "";
  }
};
