import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { X, Send } from "lucide-react-native";
import type { FeedPost, CommentItem } from "@/data/feedData";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface CommentsModalProps {
  post: FeedPost | null;
  visible: boolean;
  onClose: () => void;
}

export default function CommentsModal({ post, visible, onClose }: CommentsModalProps) {
  const [comments, setComments] = useState<CommentItem[]>(post?.commentsList || []);
  const [inputText, setInputText] = useState("");
  const { activeProfile, user } = useAuth();

  // Fetch real comments from backend when post changes or modal opens
  useEffect(() => {
    if (!post?.id) return;
    if (post.commentsList && post.commentsList.length > 0) {
      setComments(post.commentsList);
    }
    if (visible) {
      let isMounted = true;
      api.getComments(post.id.toString()).then((serverComments) => {
        if (isMounted && Array.isArray(serverComments) && serverComments.length > 0) {
          setComments(serverComments);
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [post?.id, visible]);

  useEffect(() => {
    if (!post || !post.id || !visible) return;
    
    const socket = api.connectSocket();
    if (!socket) return;

    const onNewComment = (data: any) => {
      if (data && data.postId === post.id.toString()) {
        setComments((prev) => {
          const isDup = prev.some(c => c.text === data.comment.text && c.user === data.comment.user);
          return isDup ? prev : [data.comment, ...prev];
        });
      }
    };

    socket.on("new_comment", onNewComment);

    return () => {
      socket.off("new_comment", onNewComment);
    };
  }, [post?.id, visible]);

  if (!post) return null;

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const userHandle = activeProfile?.username || user?.username || "@petlover";
    const userAvatar = activeProfile?.avatar || user?.avatar || "🐾";
    const cleanHandle = userHandle.replace(/^@+/, "");
    const newComment: CommentItem = {
      user: `@${cleanHandle}`,
      avatar: userAvatar,
      text: inputText.trim(),
      time: "Just now",
    };
    
    // Optimistic UI update
    setComments((prev) => [newComment, ...prev]);
    if (post) {
      if (!post.commentsList) post.commentsList = [];
      post.commentsList.unshift(newComment);
      if (typeof post.comments === "number") post.comments += 1;
    }
    setInputText("");

    // Backend call
    try {
      await api.commentPost(post.id.toString(), newComment);
    } catch (e) {
      console.warn("Comment send error:", e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.sheetContainer}
        >
          {/* Sheet Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{comments.length} Comments</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <FlatList
            data={comments}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.commentRow}>
                <View style={styles.avatarCircle}>
                  {item.avatar && (item.avatar.startsWith("http") || item.avatar.startsWith("data:") || item.avatar.startsWith("file:")) ? (
                    <Image source={{ uri: item.avatar }} style={{ width: "100%", height: "100%", borderRadius: 16 }} resizeMode="cover" />
                  ) : (
                    <Text style={{ fontSize: 16 }}>{item.avatar || "🐾"}</Text>
                  )}
                </View>
                <View style={styles.commentBody}>
                  <View style={styles.nameRow}>
                    <Text style={styles.commentUser}>{item.user}</Text>
                    <Text style={styles.commentTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.commentText}>{item.text}</Text>
                </View>
              </View>
            )}
          />

          {/* Input Row */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Add a comment..."
              placeholderTextColor="#64748b"
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Send size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    height: "65%",
    backgroundColor: "#161b22",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 14,
  },
  commentRow: {
    flexDirection: "row",
    gap: 12,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },
  commentBody: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  commentUser: {
    color: "#06b6d4",
    fontSize: 13,
    fontWeight: "600",
  },
  commentTime: {
    color: "#64748b",
    fontSize: 11,
  },
  commentText: {
    color: "#f1f5f9",
    fontSize: 13,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  textInput: {
    flex: 1,
    height: 42,
    backgroundColor: "#0d1117",
    borderRadius: 21,
    paddingHorizontal: 16,
    color: "#ffffff",
    fontSize: 14,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
  },
});
