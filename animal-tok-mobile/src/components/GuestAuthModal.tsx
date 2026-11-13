import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { X, Sparkles, Heart, Bookmark, ShieldCheck, UserPlus, LogIn } from "lucide-react-native";
import { useRouter } from "expo-router";

interface GuestAuthModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function GuestAuthModal({
  visible,
  onClose,
  title = "Join Animandler 🐾",
  subtitle = "Create a free account to like, comment, bookmark your favorite clips, and share your own pet videos!",
}: GuestAuthModalProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(visible);

  useEffect(() => {
    setShowModal(visible);
  }, [visible]);

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const handleSignup = () => {
    setShowModal(false);
    onClose();
    router.push({ pathname: "/auth", params: { mode: "signup" } });
  };

  const handleLogin = () => {
    setShowModal(false);
    onClose();
    router.push({ pathname: "/auth", params: { mode: "login" } });
  };

  if (!visible || !showModal) return null;

  return (
    <Modal visible={showModal} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        {/* Full-screen backdrop tap to dismiss */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

        <View style={styles.sheetCard}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <X size={18} color="#94a3b8" />
          </TouchableOpacity>

          {/* Logo icon */}
          <View style={styles.logoBadge}>
            <Text style={{ fontSize: 36 }}>🐾</Text>
          </View>

          <Text style={styles.sheetTitle}>{title}</Text>
          <Text style={styles.sheetSub}>{subtitle}</Text>

          {/* Feature Highlights */}
          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <Heart size={14} color="#10b981" />
              <Text style={styles.featureText}>Like & Comment</Text>
            </View>
            <View style={styles.featureItem}>
              <Bookmark size={14} color="#fbbf24" />
              <Text style={styles.featureText}>Save Clips</Text>
            </View>
            <View style={styles.featureItem}>
              <Sparkles size={14} color="#2dd4bf" />
              <Text style={styles.featureText}>Post Pets</Text>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSignup} activeOpacity={0.85}>
            <UserPlus size={16} color="#ffffff" />
            <Text style={styles.primaryBtnText}>Create Free Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleLogin} activeOpacity={0.85}>
            <LogIn size={15} color="#2dd4bf" />
            <Text style={styles.secondaryBtnText}>Sign In with Existing Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
            <Text style={styles.cancelText}>Continue Browsing</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  sheetCard: {
    backgroundColor: "#161b22",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    borderWidth: 2,
    borderColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  sheetTitle: {
    color: "#ffffff",
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 6,
    textAlign: "center",
  },
  sheetSub: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  featuresRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  featureText: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "600",
  },
  primaryBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#06b6d4",
    paddingVertical: 13,
    borderRadius: 16,
    marginBottom: 10,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  secondaryBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    borderWidth: 1.2,
    borderColor: "rgba(6, 182, 212, 0.35)",
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  secondaryBtnText: {
    color: "#06b6d4",
    fontSize: 14,
    fontWeight: "700",
  },
  cancelBtn: {
    paddingVertical: 8,
  },
  cancelText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },
});

