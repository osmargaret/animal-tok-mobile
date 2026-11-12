import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { X, Check, Camera, Image as ImageIcon } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { marketProducts, marketServices } from "@/data/marketData";
import { useAuth } from "@/contexts/AuthContext";
import { uploadMedia, getBaseUrl } from "@/services/api";

export default function AddProductScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { type: queryType } = useLocalSearchParams<{ type?: string }>();
  
  const [type, setType] = useState<"product" | "service">(queryType === "service" ? "service" : "product");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Accessories");
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert("Permissions required", "We need camera and media permissions to proceed.");
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (!(await requestPermissions())) return;
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    if (!(await requestPermissions())) return;
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
    }
  };

  const handlePublish = async () => {
    if (!name.trim()) return Alert.alert("Missing Name", "Please enter a name.");
    if (!price.trim()) return Alert.alert("Missing Price", "Please enter a price.");
    if (!mediaUri) return Alert.alert("Missing Photo", "Please add a photo.");

    setIsPublishing(true);

    try {
      // 1. Upload image to Cloudinary
      const folder = type === "product" ? "animaltok/products" : "animaltok/services";
      const cloudinaryUrl = await uploadMedia(mediaUri, folder, "image");
      const finalImage = cloudinaryUrl || mediaUri; // fallback to local URI

      // 2. POST to backend
      const endpoint = type === "product" ? "/marketplace/products" : "/marketplace/services";
      const body = type === "product"
        ? {
            title: name.trim(),
            price: parseFloat(price.replace(/[^0-9.]/g, "")),
            category,
            image: finalImage,
            description: "",
            sellerId: user?.id || "u_1",
          }
        : {
            title: name.trim(),
            price: price.trim(),
            category,
            image: finalImage,
            description: "",
            providerId: user?.id || "u_1",
          };

      const response = await fetch(`${getBaseUrl()}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Server error");

      // 3. Optimistic local update for immediate UI feedback
      const newItem = {
        id: `custom_${Date.now()}`,
        name: name.trim(),
        price: price.trim(),
        rating: "0.0",
        image: finalImage,
      };
      if (type === "product") {
        marketProducts.unshift({ ...newItem, seller: user?.name || "New Business", category });
      } else {
        marketServices.unshift({ ...newItem, provider: user?.name || "New Business" });
      }

      setIsPublishing(false);
      Alert.alert("Success! 🎉", `Your ${type} has been listed on the Marketplace.`, [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err) {
      console.error("Publish error:", err);
      setIsPublishing(false);
      Alert.alert("Error", "Failed to publish. Please try again.");
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
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>List New Item</Text>
          <TouchableOpacity onPress={handlePublish} style={styles.iconBtn} disabled={isPublishing}>
            <Check size={24} color={isPublishing ? "#64748b" : "#06b6d4"} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.formContainer}>
          
          {/* Type Toggle */}
          <View style={styles.typeToggleRow}>
            <TouchableOpacity 
              style={[styles.typeBtn, type === "product" && styles.typeBtnActive]}
              onPress={() => setType("product")}
            >
              <Text style={[styles.typeText, type === "product" && styles.typeTextActive]}>Product</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.typeBtn, type === "service" && styles.typeBtnActive]}
              onPress={() => setType("service")}
            >
              <Text style={[styles.typeText, type === "service" && styles.typeTextActive]}>Service</Text>
            </TouchableOpacity>
          </View>

          {/* Photo Upload */}
          <Text style={styles.label}>Item Photo</Text>
          {mediaUri ? (
            <TouchableOpacity style={styles.mediaPreviewBox} onPress={() => setMediaUri(null)}>
              <Image source={{ uri: mediaUri }} style={styles.mediaPreview} />
              <View style={styles.mediaOverlay}>
                <Text style={styles.mediaOverlayText}>Tap to remove</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.mediaUploadBox}>
              <View style={styles.iconCircleGroup}>
                <TouchableOpacity style={styles.iconCircle} onPress={takePhoto}>
                  <Camera size={26} color="#8b5cf6" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconCircle} onPress={pickImage}>
                  <ImageIcon size={26} color="#f59e0b" />
                </TouchableOpacity>
              </View>
              <Text style={styles.uploadTitle}>Add Photo</Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{type === "product" ? "Product Name" : "Service Name"}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={type === "product" ? "e.g., Squeaky Toy" : "e.g., Dog Walking"}
              placeholderTextColor="#64748b"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="$0.00"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
            />
          </View>

          {type === "product" && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="e.g., Toys, Accessories..."
                placeholderTextColor="#64748b"
              />
            </View>
          )}

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    marginTop: 10,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  typeToggleRow: {
    flexDirection: "row",
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  typeBtnActive: {
    backgroundColor: "#334155",
  },
  typeText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },
  typeTextActive: {
    color: "#ffffff",
  },
  label: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  inputGroup: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 12,
    color: "#ffffff",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  mediaUploadBox: {
    height: 140,
    backgroundColor: "#161b22",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#1e293b",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  mediaPreviewBox: {
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
    position: "relative",
  },
  mediaPreview: {
    width: "100%",
    height: "100%",
  },
  mediaOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
  },
  mediaOverlayText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  iconCircleGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0d1117",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
