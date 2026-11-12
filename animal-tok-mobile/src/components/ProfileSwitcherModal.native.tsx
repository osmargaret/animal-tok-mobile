import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { Check, ShieldCheck, PawPrint } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileSwitcherModal({ visible, onClose }: ProfileSwitcherModalProps) {
  const { user, activeProfile, switchProfile, switchToHandler, pets } = useAuth();

  if (!user || !activeProfile) return null;

  const profiles = [
    {
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      type: "handler" as const,
      label: "Handler Account",
    },
    ...pets.map((p) => ({
      id: p.id,
      name: p.name,
      username: p.username,
      avatar: p.avatar,
      type: "animal" as const,
      label: p.breed || "Pet Profile",
    })),
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>Switch Profile</Text>
              </View>

              <ScrollView style={styles.scrollArea}>
                {profiles.map((p) => {
                  const isActive = activeProfile.id === p.id && activeProfile.type === p.type;
                  
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.profileRow, isActive && styles.activeRow]}
                      onPress={() => {
                        if (p.type === "handler") {
                          switchToHandler();
                        } else {
                          switchProfile({
                            id: p.id,
                            name: p.name,
                            username: p.username,
                            avatar: p.avatar,
                            type: p.type,
                          });
                        }
                        onClose();
                      }}
                    >
                      <View style={styles.avatarCircle}>
                        {p.type === "handler" ? (
                          <ShieldCheck size={20} color="#8b5cf6" />
                        ) : (
                          <Text style={{ fontSize: 20 }}>{p.avatar}</Text>
                        )}
                      </View>
                      
                      <View style={styles.info}>
                        <Text style={styles.name}>{p.name}</Text>
                        <Text style={styles.label}>{p.label}</Text>
                      </View>

                      {isActive && <Check size={20} color="#06b6d4" />}
                    </TouchableOpacity>
                  );
                })}
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#161b22",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    overflow: "hidden",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  title: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scrollArea: {
    maxHeight: 400,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(30, 41, 59, 0.5)",
  },
  activeRow: {
    backgroundColor: "rgba(6, 182, 212, 0.05)",
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  label: {
    color: "#64748b",
    fontSize: 12,
  },
});
