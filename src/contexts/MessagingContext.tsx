import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { animalProfiles } from "@/data/animalProfiles";

export type MessageType = "text" | "image" | "video" | "document" | "voice" | "location";

export interface ChatMessage {
  id: string;
  senderId: string;
  type: MessageType;
  text?: string;
  fileName?: string;
  duration?: string;
  /** data URL or blob URL for image/video/voice */
  mediaUrl?: string;
  mediaMime?: string;
  createdAt: number;
}

export interface ChatContact {
  id: string;
  name: string;
  emoji: string;
  subtitle?: string;
}

interface MessagingContextType {
  contacts: ChatContact[];
  getContact: (id: string) => ChatContact | undefined;
  getConversation: (myId: string, otherId: string) => ChatMessage[];
  sendMessage: (myId: string, otherId: string, msg: Omit<ChatMessage, "id" | "createdAt" | "senderId">) => void;
  conversationsFor: (myId: string) => Array<{ contact: ChatContact; lastMessage?: ChatMessage; unread: number; muted: boolean }>;
  markRead: (myId: string, otherId: string) => void;
  markUnread: (myId: string, otherId: string) => void;
  deleteConversation: (myId: string, otherId: string) => void;
  toggleMute: (myId: string, otherId: string) => void;
  isMuted: (myId: string, otherId: string) => boolean;
  unreadTotal: (myId: string) => number;
  /** mark current user as typing (auto-expires after ~3s) */
  setTyping: (myId: string, otherId: string) => void;
  /** is the OTHER side currently typing? */
  isTyping: (myId: string, otherId: string) => boolean;
}

const MessagingContext = createContext<MessagingContextType | null>(null);

export const useMessaging = () => {
  const ctx = useContext(MessagingContext);
  if (!ctx) throw new Error("useMessaging must be used inside MessagingProvider");
  return ctx;
};

const STORAGE_KEY = "animaltok_conversations";
const READ_KEY = "animaltok_read_state";
const MUTE_KEY = "animaltok_mute_state";
const DELETE_KEY = "animaltok_deleted_conversations";

const conversationKey = (a: string, b: string) => [a, b].sort().join("__");

const seed = (): Record<string, ChatMessage[]> => {
  const now = Date.now();
  const m = (senderId: string, text: string, offset: number): ChatMessage => ({
    id: `${senderId}-${offset}`,
    senderId,
    type: "text",
    text,
    createdAt: now - offset * 60_000,
  });
  return {
    [conversationKey("bella", "whiskers")]: [
      m("whiskers", "Saw your park video, Bella! 🐾", 60),
      m("bella", "Thanks Whiskers! Had so much fun 🐕", 58),
      m("whiskers", "Let's meet at the park sometime!", 55),
    ],
    [conversationKey("bella", "spirit")]: [
      m("spirit", "Race you tomorrow! 🏇", 90),
      m("bella", "You're way too fast for me 😂", 85),
    ],
    [conversationKey("whiskers", "spirit")]: [
      m("spirit", "Nap time?", 120),
      m("whiskers", "Always 😴", 119),
    ],
    [conversationKey("bella", "handler-1")]: [
      m("handler-1", "Good girl Bella ❤️", 200),
      m("bella", "Woof! Treats? 🦴", 198),
    ],
  };
};

export const MessagingProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return seed();
  });

  const [readState, setReadState] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem(READ_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // typing state: { [convKey]: { [userId]: lastTypedTimestamp } } — kept in memory + tiny tick
  const [typing, setTypingState] = useState<Record<string, Record<string, number>>>({});
  const [, force] = useState(0);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    // Re-render every 1s so "typing..." cleans up after 3s
    tickRef.current = window.setInterval(() => force((n) => n + 1), 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch {
      // payload too large (e.g. base64 images) — skip persisting
    }
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(READ_KEY, JSON.stringify(readState));
  }, [readState]);

  const contacts: ChatContact[] = useMemo(
    () => [
      { id: "handler-1", name: "Alex Morgan", emoji: "🧑", subtitle: "Handler" },
      ...animalProfiles.map((a) => ({
        id: a.id,
        name: a.name,
        emoji: a.emoji,
        subtitle: a.breed,
      })),
    ],
    []
  );

  const getContact = (id: string) => contacts.find((c) => c.id === id);

  const getConversation = (myId: string, otherId: string) =>
    conversations[conversationKey(myId, otherId)] || [];

  const sendMessage: MessagingContextType["sendMessage"] = (myId, otherId, msg) => {
    const key = conversationKey(myId, otherId);
    const newMsg: ChatMessage = {
      ...msg,
      id: `${myId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: myId,
      createdAt: Date.now(),
    };
    setConversations((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), newMsg],
    }));
    // sender stops typing
    setTypingState((prev) => {
      const conv = { ...(prev[key] || {}) };
      delete conv[myId];
      return { ...prev, [key]: conv };
    });
    // Notify the recipient profile (engagement context listens for this)
    const sender = contacts.find((c) => c.id === myId);
    const previewText =
      msg.type === "text" ? msg.text || "" :
      msg.type === "image" ? "📷 Photo" :
      msg.type === "video" ? "🎬 Video" :
      msg.type === "voice" ? `🎙️ Voice note${msg.duration ? ` · ${msg.duration}` : ""}` :
      msg.type === "document" ? "📄 Document" :
      msg.type === "location" ? "📍 Location" : "";
    window.dispatchEvent(
      new CustomEvent("animaltok:message", {
        detail: {
          recipientId: otherId,
          senderName: sender?.name || "Someone",
          senderAvatar: sender?.emoji || "💬",
          contactId: myId,
          preview: previewText,
        },
      })
    );
  };

  const markRead = (myId: string, otherId: string) => {
    setReadState((prev) => ({
      ...prev,
      [`${myId}__${otherId}`]: Date.now(),
    }));
  };

  const conversationsFor: MessagingContextType["conversationsFor"] = (myId) => {
    return contacts
      .filter((c) => c.id !== myId)
      .map((contact) => {
        const msgs = getConversation(myId, contact.id);
        const lastMessage = msgs[msgs.length - 1];
        const lastReadAt = readState[`${myId}__${contact.id}`] || 0;
        const unread = msgs.filter(
          (m) => m.senderId !== myId && m.createdAt > lastReadAt
        ).length;
        return { contact, lastMessage, unread };
      })
      .filter((c) => c.lastMessage)
      .sort((a, b) => (b.lastMessage?.createdAt ?? 0) - (a.lastMessage?.createdAt ?? 0));
  };

  const unreadTotal = (myId: string) =>
    conversationsFor(myId).reduce((sum, c) => sum + c.unread, 0);

  const setTyping: MessagingContextType["setTyping"] = (myId, otherId) => {
    const key = conversationKey(myId, otherId);
    setTypingState((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [myId]: Date.now() },
    }));
  };

  const isTyping: MessagingContextType["isTyping"] = (myId, otherId) => {
    const key = conversationKey(myId, otherId);
    const ts = typing[key]?.[otherId];
    if (!ts) return false;
    return Date.now() - ts < 3000;
  };

  return (
    <MessagingContext.Provider
      value={{
        contacts,
        getContact,
        getConversation,
        sendMessage,
        conversationsFor,
        markRead,
        unreadTotal,
        setTyping,
        isTyping,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
};
