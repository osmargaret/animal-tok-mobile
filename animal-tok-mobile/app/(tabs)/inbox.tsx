import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { MessageSquare, ArrowLeft, Search, Sparkles, ChevronRight } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";

interface ThreadItem {
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
    role?: string;
  };
  unreadCount: number;
}

export default function InboxScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const currentUserId = user?.id || "u_3";

  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const fetchThreads = useCallback(async () => {
    try {
      const data = await api.getInboxThreads(currentUserId);
      if (Array.isArray(data)) {
        setThreads(data);
      }
    } catch (e) {
      console.warn("Failed to load threads:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUserId]);

  useFocusEffect(
    useCallback(() => {
      fetchThreads();
    }, [fetchThreads])
  );

  useEffect(() => {
    fetchThreads();

    const socket = api.connectSocket(currentUserId);
    if (socket) {
      setIsConnected(socket.connected);

      socket.on("connect", () => setIsConnected(true));
      socket.on("disconnect", () => setIsConnected(false));

      // Listen for incoming message alerts to update inbox in real time
      const handleIncoming = () => {
        fetchThreads();
      };

      socket.on("new_message_alert", handleIncoming);
      socket.on("new_message", handleIncoming);

      return () => {
        socket.off("new_message_alert", handleIncoming);
        socket.off("new_message", handleIncoming);
      };
    }
  }, [currentUserId, fetchThreads]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchThreads();
  };

  const filteredThreads = threads.filter((t) =>
    t.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openChat = (item: ThreadItem) => {
    router.push({
      pathname: "/(tabs)/message/[id]",
      params: {
        id: item.threadId,
        recipientId: item.participant.id,
        name: item.participant.name,
        avatar: item.participant.avatar,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={22} color="#ffffff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Direct Messages</Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isConnected ? "#10b981" : "#eab308" },
                ]}
              />
              <Text style={styles.statusText}>
                {isConnected ? "Real-time Live" : "Connecting..."}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={18} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Conversations List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : filteredThreads.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconContainer}>
            <MessageSquare size={36} color="#06b6d4" />
          </View>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            Browse animal profiles and click "Message Handler" to start a direct 1-on-1 conversation.
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push("/(tabs)/explore" as any)}
          >
            <Sparkles size={16} color="#ffffff" />
            <Text style={styles.exploreButtonText}>Explore Pets</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredThreads}
          keyExtractor={(item) => item.threadId}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#06b6d4"
            />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isMe = item.lastMessage.senderId === currentUserId;
            return (
              <TouchableOpacity
                style={styles.threadItem}
                activeOpacity={0.7}
                onPress={() => openChat(item)}
              >
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{item.participant.avatar || "🐾"}</Text>
                </View>

                {/* Details */}
                <View style={styles.threadInfo}>
                  <View style={styles.topRow}>
                    <Text style={styles.participantName} numberOfLines={1}>
                      {item.participant.name}
                    </Text>
                    <Text style={styles.timestamp}>
                      {item.lastMessage.timestamp}
                    </Text>
                  </View>
                  <View style={styles.bottomRow}>
                    <Text style={styles.previewText} numberOfLines={1}>
                      {isMe ? "You: " : ""}{item.lastMessage.text}
                    </Text>
                    <ChevronRight size={16} color="#475569" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#161b22",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 11,
    color: "#94a3b8",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161b22",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#ffffff",
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  threadItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#161b22",
    gap: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#06b6d4",
  },
  avatarText: {
    fontSize: 22,
  },
  threadInfo: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  participantName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 11,
    color: "#64748b",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewText: {
    fontSize: 13,
    color: "#94a3b8",
    flex: 1,
    marginRight: 8,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 12,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#06b6d4",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  exploreButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});

