import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Image,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Send, ArrowLeft, ShieldCheck, Lock, ShoppingBag, CreditCard, Sparkles } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";

// Local storage key per thread for offline persistence
const threadKey = (id: string) => `animaltok_thread_${id}`;

interface MessageBubble {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
}

export default function MessageViewScreen() {
  const params = useLocalSearchParams<{
    id: string;
    recipientId?: string;
    name?: string;
    avatar?: string;
    animalId?: string;
    itemTitle?: string;
    itemPrice?: string;
    itemType?: "product" | "service";
    itemImage?: string;
    initialMessage?: string;
  }>();

  const threadId = params.id || "general";
  const router = useRouter();
  const { user } = useAuth();
  const currentUserId = user?.id || "";

  const insets = useSafeAreaInsets();
  const topSafeInset = Math.max(insets.top, Platform.OS === "android" ? ((StatusBar.currentHeight || 28) + 16) : 24);
  const bottomSafeInset = Math.max(insets.bottom, Platform.OS === "android" ? 14 : 10);

  const contactName = params.name || (params.id === "2" ? "Luna's Handler" : "Pet Handler");
  const contactAvatar = params.avatar || "🐾";
  const recipientId = params.recipientId;

  const [messages, setMessages] = useState<MessageBubble[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState(params.initialMessage || "");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (params.initialMessage && !input) {
      setInput(params.initialMessage);
    }
  }, [params.initialMessage]);

  useEffect(() => {
    // 1. Fetch live thread history from backend
    const fetchHistory = async () => {
      setLoading(true);

      // Load locally persisted messages first (instant, no network needed)
      try {
        const local = await AsyncStorage.getItem(threadKey(threadId));
        if (local) {
          const localMsgs: MessageBubble[] = JSON.parse(local);
          if (Array.isArray(localMsgs) && localMsgs.length > 0) {
            setMessages(localMsgs);
          }
        }
      } catch (_) {}

      // Then try to fetch from server and merge
      try {
        const serverMsgs = await api.getThreadMessages(threadId);
        if (Array.isArray(serverMsgs) && serverMsgs.length > 0) {
          const mapped: MessageBubble[] = serverMsgs.map((m: any) => ({
            id: m.id,
            sender: m.senderId === currentUserId ? "me" : "them",
            text: m.text,
            time: m.timestamp || "Just now",
          }));
          setMessages(mapped);
          // Persist server messages locally
          await AsyncStorage.setItem(threadKey(threadId), JSON.stringify(mapped)).catch(() => {});
        }
        // If server returns empty, keep the locally loaded messages (don't wipe them)
      } catch (err) {
        console.warn("Failed to load message history from server, using local cache:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();

    // 2. Connect to real-time socket and join thread room
    const socket = api.connectSocket(currentUserId);
    if (socket) {
      socket.emit("join_thread", threadId);

      const onNewMessage = (m: any) => {
        if (m.threadId === threadId && m.senderId !== currentUserId) {
          setMessages((prev) => {
            const updated = [
              ...prev,
              {
                id: m.id,
                sender: "them" as const,
                text: m.text,
                time: m.timestamp || "Just now",
              },
            ];
            // Persist incoming messages locally too
            AsyncStorage.setItem(threadKey(threadId), JSON.stringify(updated)).catch(() => {});
            return updated;
          });
        }
      };

      socket.on("new_message", onNewMessage);

      return () => {
        socket.emit("leave_thread", threadId);
        socket.off("new_message", onNewMessage);
      };
    }
  }, [threadId, currentUserId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const currentText = input.trim();
    setInput("");

    // Optimistic UI update
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg: MessageBubble = {
      id: tempId,
      sender: "me",
      text: currentText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => {
      const updated = [...prev, optimisticMsg];
      // Persist locally so messages survive screen unmount / backend delays
      AsyncStorage.setItem(threadKey(threadId), JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    // Send to backend with full participant context
    const senderName = user?.name || "User";
    const senderAvatar = user?.avatar || "👤";
    const serverMsg = await api.sendMessage(
      threadId,
      currentText,
      currentUserId,
      recipientId,
      senderName,
      senderAvatar,
      contactName,
      contactAvatar
    );

    // Replace temp bubble with real server ID if we got one back
    if (serverMsg?.id) {
      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === tempId ? { ...m, id: serverMsg.id, time: serverMsg.timestamp || m.time } : m
        );
        AsyncStorage.setItem(threadKey(threadId), JSON.stringify(updated)).catch(() => {});
        return updated;
      });
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", padding: 24 }]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🔒</Text>
        <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: "bold", marginBottom: 8, textAlign: "center" }}>
          Sign In to Chat
        </Text>
        <Text style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", marginBottom: 24, lineHeight: 20 }}>
          You need an account to message pet handlers and view conversation history.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: "#06b6d4", paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 }}
          onPress={() => router.replace({ pathname: "/auth", params: { mode: "login" } })}
        >
          <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 15 }}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Contact Banner with Android Status Bar clearance */}
        <View style={[styles.contactHeader, { paddingTop: topSafeInset + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            {contactAvatar && (contactAvatar.startsWith("http") || contactAvatar.startsWith("data:") || contactAvatar.startsWith("/")) ? (
              <Image source={{ uri: contactAvatar }} style={styles.headerAvatarImg} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: 22 }}>{contactAvatar || "🐾"}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactName} numberOfLines={1}>
              {contactName}
            </Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.contactStatus}>Online • Real-time Active</Text>
            </View>
          </View>
        </View>

        {/* Trade / Marketplace Item Reference Banner */}
        {params.itemTitle ? (
          <View style={styles.tradeCard}>
            {params.itemImage ? (
              <Image source={{ uri: params.itemImage }} style={styles.tradeImage} resizeMode="cover" />
            ) : (
              <View style={styles.tradeIconBox}>
                <ShoppingBag size={20} color="#06b6d4" />
              </View>
            )}
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <View style={styles.tradeBadgeRow}>
                <Text style={styles.tradeBadge}>
                  {params.itemType === "service" ? "Pet Service" : "Product Item"}
                </Text>
              </View>
              <Text style={styles.tradeTitle} numberOfLines={1}>
                {params.itemTitle}
              </Text>
              <Text style={styles.tradePrice}>{params.itemPrice}</Text>
            </View>
          </View>
        ) : null}

        {/* Message Thread */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#06b6d4" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.threadContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListHeaderComponent={
              <View style={styles.securityBanner}>
                <Lock size={14} color="#64748b" />
                <Text style={styles.securityText}>
                  Direct 1-on-1 private messaging on AnimalTok
                </Text>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyAvatar}>
                  {contactAvatar && (contactAvatar.startsWith("http") || contactAvatar.startsWith("data:") || contactAvatar.startsWith("/")) ? (
                    <Image source={{ uri: contactAvatar }} style={{ width: 64, height: 64, borderRadius: 32 }} resizeMode="cover" />
                  ) : (
                    <Text style={{ fontSize: 32 }}>{contactAvatar || "🐾"}</Text>
                  )}
                </View>
                <Text style={styles.emptyHeader}>Say hello to {contactName}!</Text>
                <Text style={styles.emptySub}>
                  Send a message to ask about pet care, schedule a meetup, or share pet tips.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isMe = item.sender === "me";
              return (
                <View style={[styles.bubbleRow, isMe ? styles.rowMe : styles.rowThem]}>
                  <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                    <Text style={[styles.bubbleText, isMe ? styles.textMe : styles.textThem]}>
                      {item.text}
                    </Text>
                    <Text style={[styles.timeText, isMe ? styles.timeMe : styles.timeThem]}>
                      {item.time}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Input Bar */}
        <View style={[styles.inputContainer, { paddingBottom: bottomSafeInset + 6 }]}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#64748b"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Send size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    backgroundColor: "#161b22",
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#06b6d4",
    overflow: "hidden",
  },
  headerAvatarImg: {
    width: "100%",
    height: "100%",
  },
  contactName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
  },
  contactStatus: {
    color: "#94a3b8",
    fontSize: 11,
  },
  securityBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    marginBottom: 8,
  },
  securityText: {
    fontSize: 11,
    color: "#64748b",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
    textAlign: "center",
  },
  emptySub: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 18,
  },
  threadContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  bubbleRow: {
    flexDirection: "row",
    marginVertical: 4,
  },
  rowMe: {
    justifyContent: "flex-end",
  },
  rowThem: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe: {
    backgroundColor: "#06b6d4",
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: "#1e293b",
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  textMe: {
    color: "#ffffff",
  },
  textThem: {
    color: "#f1f5f9",
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  timeMe: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  timeThem: {
    color: "#94a3b8",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#161b22",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: "#0d1117",
    color: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  tradeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161b22",
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tradeImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#0d1117",
  },
  tradeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  tradeBadgeRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  tradeBadge: {
    fontSize: 9,
    color: "#06b6d4",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tradeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  tradePrice: {
    fontSize: 13,
    fontWeight: "800",
    color: "#10b981",
    marginTop: 1,
  },
  tradeActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#06b6d4",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
  },
  tradeActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
});
