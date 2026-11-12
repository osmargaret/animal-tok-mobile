import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Sparkles, ArrowLeft, Image as ImageIcon } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { api, uploadMedia } from "@/services/api";

const PET_TYPES = [
  { emoji: "🐕", label: "Dog" },
  { emoji: "🐈", label: "Cat" },
  { emoji: "🦜", label: "Bird" },
  { emoji: "🐇", label: "Rabbit" },
  { emoji: "🐠", label: "Fish" },
  { emoji: "🦎", label: "Reptile" },
  { emoji: "🐾", label: "Other" },
];

const AGE_SUGGESTIONS = ["Puppy / Kitten", "1 yr", "2 yrs", "3 yrs", "Senior 🐾"];

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateAccountType, addPet, user, pets } = useAuth();

  const [petName, setPetName] = useState("");
  const [breed, setBreed] = useState("");
  const [selectedType, setSelectedType] = useState("🐕");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const isFirstPet = pets.length === 0;

  const pickCoverImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setCoverUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert("Permission needed", "Please grant photo library access to choose a cover photo.");
    }
  };

  const pickAvatarImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert("Permission needed", "Please grant photo library access to choose a profile photo.");
    }
  };

  const handleFinish = async () => {
    if (!petName.trim()) {
      return Alert.alert("Required", "Please enter your pet's name.");
    }
    if (!breed.trim()) {
      return Alert.alert("Required", "Please enter your pet's breed or species.");
    }

    setUploading(true);

    let finalCover: string = coverUri || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80";
    let finalAvatar: string = avatarUri || selectedType;

    try {
      if (coverUri && (coverUri.startsWith("file:") || coverUri.startsWith("data:"))) {
        const uploadedCover = await uploadMedia(coverUri, "animaltok/covers", "image");
        if (uploadedCover) finalCover = uploadedCover;
      }
      if (avatarUri && (avatarUri.startsWith("file:") || avatarUri.startsWith("data:"))) {
        const uploadedAvatar = await uploadMedia(avatarUri, "animaltok/avatars", "image");
        if (uploadedAvatar) finalAvatar = uploadedAvatar;
      }
    } catch (err) {
      console.warn("Media upload error, using local fallback:", err);
    }

    const cleanName = petName.trim();
    const cleanUsername = `@${cleanName.toLowerCase().replace(/\s+/g, ".")}.pet`;
    const petId = `pet_${Date.now()}`;

    const newPetData = {
      id: petId,
      name: cleanName,
      username: cleanUsername,
      avatar: finalAvatar || selectedType,
      coverImage: finalCover || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80",
      photos: (finalAvatar && finalAvatar.startsWith("http")) 
        ? [finalAvatar] 
        : [finalCover || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&auto=format&fit=crop&q=80"],
      type: "animal" as const,
      breed: breed.trim(),
      age: age.trim() || "1 yr",
      bio: bio.trim() || `Living my best pet life 🐾`,
      handlerId: user?.id || "u_1",
      handlerName: user?.name || "Handler",
    };

    try {
      // 1. Persist to Neon Postgres backend
      await api.createAnimal(newPetData);
    } catch (e) {
      console.warn("Failed to create animal in backend:", e);
    }

    // 2. Update context state
    await updateAccountType("regular");
    addPet(newPetData);

    setUploading(false);

    // 3. Navigate
    if (!isFirstPet && router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Interactive Cover Banner */}
          <View style={styles.coverBox}>
            {coverUri ? (
              <Image source={{ uri: coverUri }} style={styles.coverImage} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <ImageIcon size={28} color="#475569" />
                <Text style={styles.coverPlaceholderText}>Add Cover Banner</Text>
              </View>
            )}

            {/* Back Button */}
            {router.canGoBack() && (
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={20} color="#ffffff" />
              </TouchableOpacity>
            )}

            {/* Add / Change Cover Button */}
            <TouchableOpacity style={styles.changeCoverBtn} onPress={pickCoverImage} activeOpacity={0.8}>
              <Camera size={13} color="#ffffff" />
              <Text style={styles.changeCoverText}>{coverUri ? "Edit Cover" : "Add Cover"}</Text>
            </TouchableOpacity>

            {/* Overlapping Pet Profile Picture / Avatar */}
            <TouchableOpacity 
              style={styles.avatarOverlay} 
              onPress={pickAvatarImage}
              activeOpacity={0.8}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarEmoji}>{selectedType}</Text>
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Camera size={13} color="#ffffff" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Compact Header Details */}
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{isFirstPet ? "Add Your First Pet" : "Add New Pet"}</Text>
            <Text style={styles.subtitle}>
              Tap the cover or photo circle above to upload custom pictures
            </Text>
          </View>

          {/* Pet Type Chips (Horizontal & Compact) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>What Kind Of Pet?</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.typeScroll}
          >
            {PET_TYPES.map((t) => {
              const isSelected = selectedType === t.emoji;
              return (
                <TouchableOpacity
                  key={t.label}
                  style={[styles.typeChip, isSelected && styles.typeChipActive]}
                  onPress={() => setSelectedType(t.emoji)}
                >
                  <Text style={styles.typeChipEmoji}>{t.emoji}</Text>
                  <Text style={[styles.typeChipLabel, isSelected && styles.typeChipLabelActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Form Fields */}
          <View style={styles.formCard}>
            {/* Pet Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pet Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Simba, Bailey, Coco..."
                placeholderTextColor="#64748b"
                value={petName}
                onChangeText={setPetName}
              />
              {petName.trim().length > 0 && (
                <Text style={styles.handlePreview}>
                  Username: @{petName.trim().toLowerCase().replace(/\s+/g, ".")}.pet
                </Text>
              )}
            </View>

            {/* Breed / Species */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Breed or Species *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Golden Retriever, Tabby Cat, Husky..."
                placeholderTextColor="#64748b"
                value={breed}
                onChangeText={setBreed}
              />
            </View>

            {/* Age with Quick Suggestions */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2 yrs, 6 months..."
                placeholderTextColor="#64748b"
                value={age}
                onChangeText={setAge}
              />
              <View style={styles.suggestionsRow}>
                {AGE_SUGGESTIONS.map((sug) => (
                  <TouchableOpacity
                    key={sug}
                    style={[styles.sugChip, age === sug && styles.sugChipActive]}
                    onPress={() => setAge(sug)}
                  >
                    <Text style={[styles.sugText, age === sug && styles.sugTextActive]}>{sug}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Short Bio */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Short Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder="Tell the community what your pet loves doing..."
                placeholderTextColor="#64748b"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitBtn, uploading && styles.submitBtnDisabled]} 
              onPress={handleFinish}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Sparkles size={16} color="#ffffff" />
                  <Text style={styles.submitBtnText}>Create Pet Profile</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  scrollContent: {
    paddingBottom: 48,
  },
  coverBox: {
    height: 150,
    position: "relative",
    backgroundColor: "#161b22",
    marginBottom: 44,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#161b22",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  coverPlaceholderText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },
  backButton: {
    position: "absolute",
    top: 14,
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  changeCoverBtn: {
    position: "absolute",
    bottom: 12,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  changeCoverText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  avatarOverlay: {
    position: "absolute",
    bottom: -36,
    left: 20,
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#161b22",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#06b6d4",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 36,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#161b22",
  },
  avatarEmoji: {
    fontSize: 36,
  },
  cameraBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0d1117",
  },
  headerInfo: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 3,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 17,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  typeScroll: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#161b22",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  typeChipActive: {
    borderColor: "#06b6d4",
    backgroundColor: "rgba(6, 182, 212, 0.12)",
  },
  typeChipEmoji: {
    fontSize: 16,
  },
  typeChipLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  typeChipLabelActive: {
    color: "#06b6d4",
    fontWeight: "700",
  },
  formCard: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#161b22",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
    color: "#ffffff",
    fontSize: 14,
  },
  bioInput: {
    height: 70,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  handlePreview: {
    color: "#06b6d4",
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
  },
  suggestionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  sugChip: {
    backgroundColor: "#161b22",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  sugChipActive: {
    borderColor: "#06b6d4",
    backgroundColor: "rgba(6, 182, 212, 0.1)",
  },
  sugText: {
    color: "#64748b",
    fontSize: 11,
  },
  sugTextActive: {
    color: "#06b6d4",
    fontWeight: "600",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#06b6d4",
    height: 44,
    borderRadius: 22,
    marginTop: 8,
    elevation: 3,
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
