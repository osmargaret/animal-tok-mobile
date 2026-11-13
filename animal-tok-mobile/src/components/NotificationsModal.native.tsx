import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Bell, Calendar, Heart, UserPlus, MessageSquare, X, CheckCheck } from "lucide-react-native";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ visible, onClose }: NotificationsModalProps) {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    if (!currentUserId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api.getNotifications(currentUserId).then((data) => {
      setNotifications(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (visible) {
      fetchNotifs();
    }
  }, [visible, currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    const socket = api.connectSocket(currentUserId);
    if (!socket) return;

    const handleNewNotif = (notif: NotificationItem) => {
      setNotifications((prev) => [notif, ...prev]);
    };

    socket.on("new_notification", handleNewNotif);

    return () => {
      socket.off("new_notification", handleNewNotif);
    };
  }, [currentUserId]);

  const handleMarkAllRead = async () => {
    await api.markNotificationsRead(currentUserId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "event":
        return <Calendar size={18} color="#06b6d4" />;
      case "like":
        return <Heart size={18} color="#ef4444" fill="#ef4444" />;
      case "message":
        return <MessageSquare size={18} color="#10b981" />;
      default:
        return <UserPlus size={18} color="#8b5cf6" />;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Bell size={20} color="#06b6d4" />
                  <Text style={styles.title}>Real-time Notifications</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <TouchableOpacity onPress={handleMarkAllRead} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <CheckCheck size={18} color="#06b6d4" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onClose}>
                    <X size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={styles.scrollArea}>
                {loading ? (
                  <View style={{ padding: 30, alignItems: "center" }}>
                    <ActivityIndicator size="small" color="#06b6d4" />
                  </View>
                ) : (
                  notifications.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <View style={styles.iconCircle}>{getIcon(item.type)}</View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemMsg}>{item.message}</Text>
                        <Text style={styles.itemTime}>{item.timestamp}</Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "#161b22",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    maxHeight: "70%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  title: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollArea: {
    paddingHorizontal: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(30, 41, 59, 0.5)",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  itemMsg: {
    color: "#cbd5e1",
    fontSize: 13,
    marginTop: 2,
  },
  itemTime: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 4,
  },
});
