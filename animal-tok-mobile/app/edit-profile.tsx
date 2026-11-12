import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { X, Check, Camera, Image as ImageIcon } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/AuthContext";
import { api, uploadMedia } from "@/services/api";

export default function EditProfileScreen() {
  const router = useRouter();
  const { activeProfile, user, switchProfile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [avatar, setAvatar] = useState("");

  const isAnimal = activeProfile?.type === "animal";
  const targetId = isAnimal ? activeProfile?.id : user?.id;

  useEffect(() => {
    const fetchCurrentData = async () => {
      setLoading(true);
      try {
        if (isAnimal && activeProfile) {
          const animalData = await api.getAnimalProfile(activeProfile.id);
          setName(animalData?.name || "");
          setUsername(animalData?.username || "");
          setBio(animalData?.bio || "");
          setCoverImage(animalData?.coverImage || activeProfile?.coverImage || "");
          setAvatar(animalData?.avatar || activeProfile?.avatar || "");
        } else if (user) {
          const handlerData = await api.getHandlerProfile(user.id);
          setName(handlerData?.name || "");
          setUsername(handlerData?.username || "");
          setBio(handlerData?.bio || "");
          setCoverImage("https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80");
          setAvatar(user?.avatar || "");
        }
      } catch (e) {
        Alert.alert("Error", "Failed to load profile data");
      }
      setLoading(false);
    };

    fetchCurrentData();
  }, [activeProfile, user]);

  const pickCover = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setCoverImage(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert("Permission needed", "Please allow gallery access to choose a cover photo.");
    }
  };

  const pickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setAvatar(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert("Permission needed", "Please allow gallery access to choose an avatar.");
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !username.trim()) {
      Alert.alert("Invalid Input", "Name and username cannot be empty.");
      return;
    }

    setSaving(true);

    let finalCover = coverImage;
    let finalAvatar = avatar;

    try {
      if (coverImage && (coverImage.startsWith("file:") || coverImage.startsWith("data:"))) {
        const uploaded = await uploadMedia(coverImage, "animaltok/covers", "image");
        if (uploaded) finalCover = uploaded;
      }
      if (avatar && (avatar.startsWith("file:") || avatar.startsWith("data:"))) {
        const uploaded = await uploadMedia(avatar, "animaltok/avatars", "image");
        if (uploaded) finalAvatar = uploaded;
      }
    } catch (e) {
      console.warn("Upload failed, using local URI:", e);
    }

    const success = await api.updateProfile(targetId as string, {
      name: name.trim(),
      username: username.trim(),
      bio: bio.trim(),
      coverImage: finalCover,
      avatar: finalAvatar,
    });

    if (success) {
      if (isAnimal && activeProfile) {
        switchProfile({
          ...activeProfile,
          name: name.trim(),
          username: username.trim(),
          bio: bio.trim(),
          coverImage: finalCover,
          avatar: finalAvatar,
        });
      }
      router.back();
    } else {
      Alert.alert("Error", "Failed to save profile. Please try again.");
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <X size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={saving || loading}>
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Check size={18} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#06b6d4" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
            {/* Cover & Avatar Header */}
            <View style={styles.coverBox}>
              {coverImage ? (
                <Image source={{ uri: coverImage }} style={styles.coverImg} />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <ImageIcon size={24} color="#64748b" />
                  <Text style={styles.coverPlaceholderText}>Tap to set Cover</Text>
                </View>
              )}

              <TouchableOpacity style={styles.changeCoverBtn} onPress={pickCover} activeOpacity={0.8}>
                <Camera size={12} color="#ffffff" />
                <Text style={styles.changeCoverText}>Change Cover</Text>
              </TouchableOpacity>

              {/* Overlapping Avatar */}
              <TouchableOpacity style={styles.avatarWrap} onPress={pickAvatar} activeOpacity={0.8}>
                {avatar && (avatar.startsWith("http") || avatar.startsWith("file:") || avatar.startsWith("data:")) ? (
                  <Image source={{ uri: avatar }} style={styles.avatarImg} />
                ) : (
                  <Text style={{ fontSize: 32 }}>{avatar || "🐾"}</Text>
                )}
                <View style={styles.cameraIconBadge}>
                  <Camera size={12} color="#ffffff" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.inputsCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Display Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="E.g., Bailey"
                  placeholderTextColor="#64748b"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="E.g., @bailey.thelab"
                  placeholderTextColor="#64748b"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell your followers about yourself..."
                  placeholderTextColor="#64748b"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#161b22",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  formContainer: {
    paddingBottom: 40,
  },
  coverBox: {
    height: 140,
    width: "100%",
    backgroundColor: "#161b22",
    position: "relative",
    marginBottom: 42,
  },
  coverImg: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#161b22",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  coverPlaceholderText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },
  changeCoverBtn: {
    position: "absolute",
    bottom: 10,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  changeCoverText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  avatarWrap: {
    position: "absolute",
    bottom: -32,
    left: 20,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#161b22",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#06b6d4",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 33,
  },
  cameraIconBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0d1117",
  },
  inputsCard: {
    paddingHorizontal: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#161b22",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    color: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
  },
});
