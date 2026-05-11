import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { animalProfiles } from "@/data/animalProfiles";

export type MessageType = "text" | "image" | "video" | "document" | "voice" | "location";

export interface ChatMessage {
  id: string;
  senderId: string;
  type: MessageType;
  text?: string;
  fileName?: string;
  duration?: string;
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
  conversationsFor: (myId: string) => Array<{ contact: ChatContact; lastMessage?: ChatMessage; unread: number }>;
  markRead: (myId: string, otherId: string) => void;
}

const MessagingContext = createContext<MessagingContextType | null>(null);

export const useMessaging = () => {
  const ctx = useContext(MessagingContext);
  if (!ctx) throw new Error("useMessaging must be used inside MessagingProvider");
  return ctx;
};

const STORAGE_KEY = "animaltok_conversations";
const READ_KEY = "animaltok_read_state";

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
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
      id: `${myId}-${Date.now()}`,
      senderId: myId,
      createdAt: Date.now(),
    };
    setConversations((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), newMsg],
    }));
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

  return (
    <MessagingContext.Provider
      value={{ contacts, getContact, getConversation, sendMessage, conversationsFor, markRead }}
    >
      {children}
    </MessagingContext.Provider>
  );
};
