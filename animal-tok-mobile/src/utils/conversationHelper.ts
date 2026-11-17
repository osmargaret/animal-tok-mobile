import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/services/api";

export interface LocalInboxThread {
  threadId: string;
  lastMessage: {
    id: string;
    text: string;
    timestamp: string;
    senderId: string;
  };
  participant: {
    id: string;
    name: string;
    avatar: string;
  };
  unreadCount: number;
}

export const localThreadsStorageKey = (userId: string) =>
  `animaltok_local_threads_${userId}`;

/**
 * Send a filled form summary (Event Attendance or Service Booking) to the creator
 * via the backend Messaging API and cache the thread locally so the sender can
 * immediately initiate and continue the conversation from confirmation or Inbox.
 */
export async function sendFormConversationMessage(params: {
  threadId: string;
  messageText: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId?: string;
  recipientName: string;
  recipientAvatar: string;
  meta?: { eventId?: string; serviceId?: string };
}) {
  const {
    threadId,
    messageText,
    senderId,
    senderName,
    senderAvatar,
    recipientId,
    recipientName,
    recipientAvatar,
    meta,
  } = params;

  const sentServerMsg = await api.sendMessage(
    threadId,
    messageText,
    senderId,
    recipientId,
    senderName,
    senderAvatar,
    recipientName,
    recipientAvatar,
    meta
  );

  const nowTime =
    sentServerMsg?.timestamp ||
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Persist message bubble inside the local thread cache
  const localThreadKey = `animaltok_thread_${threadId}`;
  try {
    const existingRaw = await AsyncStorage.getItem(localThreadKey);
    const existingMsgs = existingRaw ? JSON.parse(existingRaw) : [];
    const threadMsgs = Array.isArray(existingMsgs) ? existingMsgs : [];
    threadMsgs.push({
      id: sentServerMsg?.id || `msg_${Date.now()}`,
      sender: "me",
      text: messageText,
      time: nowTime,
      threadId,
      senderId,
      recipientId: sentServerMsg?.recipientId || recipientId || "",
      createdAt: new Date().toISOString(),
    });
    await AsyncStorage.setItem(localThreadKey, JSON.stringify(threadMsgs));
  } catch (e) {
    console.warn("Failed saving local thread messages:", e);
  }

  // Upsert summary in local inbox threads cache for immediate visibility
  if (senderId) {
    try {
      const threadsKey = localThreadsStorageKey(senderId);
      const existingThreadsRaw = await AsyncStorage.getItem(threadsKey);
      const parsed = existingThreadsRaw ? JSON.parse(existingThreadsRaw) : [];
      const currentList: LocalInboxThread[] = Array.isArray(parsed) ? parsed : [];
      const summary: LocalInboxThread = {
        threadId,
        lastMessage: {
          id: sentServerMsg?.id || `msg_${Date.now()}`,
          text: messageText,
          timestamp: nowTime,
          senderId,
        },
        participant: {
          id: sentServerMsg?.recipientId || recipientId || "creator",
          name: recipientName || "Creator",
          avatar: recipientAvatar || "🐾",
        },
        unreadCount: 0,
      };
      const filtered = currentList.filter((t) => t.threadId !== threadId);
      await AsyncStorage.setItem(threadsKey, JSON.stringify([summary, ...filtered]));
    } catch (e) {
      console.warn("Failed saving local inbox summary:", e);
    }
  }

  return sentServerMsg;
}

