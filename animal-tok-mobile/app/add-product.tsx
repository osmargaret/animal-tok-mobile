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
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { X, Check, Camera, Image as ImageIcon, Sparkles, MapPin, Tag, DollarSign, FileText } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { marketProducts, marketServices, type ProductItem, type ServiceItem } from "@/data/marketData";
import { useAuth } from "@/contexts/AuthContext";
import { uploadMedia, getBaseUrl } from "@/services/api";

const PRODUCT_CATEGORIES = ["Accessories", "Food & Treats", "Toys", "Health", "Beds & Furniture"];
const SERVICE_CATEGORIES = ["Grooming", "Training", "Dog Walking", "Vet Care", "Pet Boarding"];

export default function AddProductScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { type: queryType } = useLocalSearchParams<{ type?: string }>();

  const [type, setType] = useState<"product" | "service">(queryType === "service" ? "service" : "product");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(queryType === "service" ? "Grooming" : "Accessories");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Austin, TX");
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.alert(`${title}\n\n${message}`);
      if (onOk) onOk();
    } else {
      Alert.alert(title, message, onOk ? [{ text: "OK", onPress: onOk }] : undefined);
    }
  };

  const requestPermissions = async () => {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== "granted" || mediaStatus !== "granted") {
        showAlert("Permissions required", "We need camera and media library permissions to upload item photos.");
        return false;
      }
      return true;
    } catch {
      return true;
    }
  };

  const pickImage = async () => {
    try {
      const granted = await requestPermissions();
      if (!granted && Platform.OS !== "web") return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setMediaUri(result.assets[0].uri);
      }
    } catch (e) {
      console.warn("pickImage error:", e);
    }
  };

  const takePhoto = async () => {
    try {
      const granted = await requestPermissions();
      if (!granted && Platform.OS !== "web") return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setMediaUri(result.assets[0].uri);
      }
    } catch (e) {
      console.warn("takePhoto error:", e);
    }
  };

  const useDefaultPhoto = () => {
    const fallback =
      type === "product"
        ? "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80";
    setMediaUri(fallback);
  };

  const handlePublish = async () => {
    if (!name.trim()) {
      showAlert("Missing Name", `Please enter a ${type === "product" ? "product" : "service"} title.`);
      return;
    }
    if (!price.trim()) {
      showAlert("Missing Price", "Please enter the price.");
      return;
    }

    const photoToUse =
      mediaUri ||
      (type === "product"
        ? "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&auto=format&fit=crop&q=80");

    setIsPublishing(true);

    try {
      // 1. Upload to Cloudinary if local file
      let finalImage = photoToUse;
      if (photoToUse && !photoToUse.startsWith("http")) {
        const folder = type === "product" ? "animaltok/products" : "animaltok/services";
        const uploaded = await uploadMedia(photoToUse, folder, "image");
        if (uploaded) finalImage = uploaded;
      }

      // Format price cleanly
      const cleanNumeric = price.replace(/[^0-9.]/g, "") || "10";
      const displayPrice = price.trim().startsWith("$") ? price.trim() : `$${price.trim()}`;

      // 2. POST to Backend
      const endpoint = type === "product" ? "/marketplace/products" : "/marketplace/services";
      const sellerDisplayName =
        (user as any)?.businessName ||
        (user as any)?.clinicName ||
        user?.name ||
        "Verified Seller";

      const payload =
        type === "product"
          ? {
              title: name.trim(),
              price: parseFloat(cleanNumeric),
              category: category.trim() || "General",
              image: finalImage,
              description: description.trim() || "Premium pet quality item.",
              sellerId: user?.id || "u_1",
            }
          : {
              title: name.trim(),
              price: displayPrice,
              category: category.trim() || "Care",
              image: finalImage,
              description: description.trim() || "Professional pet service.",
              providerId: user?.id || "u_1",
              location: location.trim() || "Austin, TX",
            };

      try {
        const res = await fetch(`${getBaseUrl()}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          console.warn("Backend publish returned non-200, continuing with optimistic cache");
        }
      } catch (err) {
        console.warn("Backend post failed, saving locally:", err);
      }

      // 3. Update memory data structures
      const itemId = `${type === "product" ? "prod" : "serv"}_${Date.now()}`;
      if (type === "product") {
        const newProduct: ProductItem = {
          id: itemId,
          name: name.trim(),
          price: displayPrice,
          rating: "5.0",
          seller: sellerDisplayName,
          image: finalImage,
          category: category.trim(),
        };
        marketProducts.unshift(newProduct);

        // Save custom products to AsyncStorage
        const stored = await AsyncStorage.getItem("animaltok_custom_products");
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(newProduct);
        await AsyncStorage.setItem("animaltok_custom_products", JSON.stringify(list));
      } else {
        const newService: ServiceItem = {
          id: itemId,
          name: name.trim(),
          price: displayPrice,
          rating: "5.0",
          provider: sellerDisplayName,
          image: finalImage,
        };
        marketServices.unshift(newService);

        // Save custom services to AsyncStorage
        const stored = await AsyncStorage.getItem("animaltok_custom_services");
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(newService);
        await AsyncStorage.setItem("animaltok_custom_services", JSON.stringify(list));
      }

      setIsPublishing(false);
      showAlert(
        "Listing Published! 🎉",
        `Your ${type} "${name.trim()}" is now live on the marketplace.`,
        () => router.back()
      );
    } catch (err: any) {
      console.error("Listing publish error:", err);
      setIsPublishing(false);
      showAlert("Error", "Unable to list item. Please try again.");
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
          <Text style={styles.headerTitle}>List New Item</Text>
          <TouchableOpacity
            onPress={handlePublish}
            style={[styles.checkBtn, isPublishing && { opacity: 0.6 }]}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Check size={18} color="#ffffff" strokeWidth={3} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Type Toggle: Product vs Service */}
          <View style={styles.typeToggleRow}>
            <TouchableOpacity
              style={[styles.typeBtn, type === "product" && styles.typeBtnActive]}
              onPress={() => {
                setType("product");
                setCategory("Accessories");
              }}
            >
              <Text style={[styles.typeText, type === "product" && styles.typeTextActive]}>Product</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeBtn, type === "service" && styles.typeBtnActive]}
              onPress={() => {
                setType("service");
                setCategory("Grooming");
              }}
            >
              <Text style={[styles.typeText, type === "service" && styles.typeTextActive]}>Service</Text>
            </TouchableOpacity>
          </View>

          {/* Photo Upload Area */}
          <Text style={styles.label}>Item Photo</Text>
          {mediaUri ? (
            <View style={styles.mediaPreviewBox}>
              <Image source={{ uri: mediaUri }} style={styles.mediaPreview} resizeMode="cover" />
              <View style={styles.mediaOverlay}>
                <TouchableOpacity style={styles.overlayActionBtn} onPress={pickImage}>
                  <Text style={styles.overlayActionText}>Change Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.overlayActionBtn, styles.overlayActionBtnDanger]}
                  onPress={() => setMediaUri(null)}
                >
                  <Text style={styles.overlayActionText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.mediaUploadBox}>
              <View style={styles.iconCircleGroup}>
                <TouchableOpacity style={styles.iconCircle} onPress={takePhoto}>
                  <Camera size={22} color="#06b6d4" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconCircle} onPress={pickImage}>
                  <ImageIcon size={22} color="#8b5cf6" />
                </TouchableOpacity>
              </View>
              <Text style={styles.uploadTitle}>Take photo or choose from library</Text>
              <TouchableOpacity style={styles.presetPhotoBtn} onPress={useDefaultPhoto}>
                <Sparkles size={12} color="#06b6d4" />
                <Text style={styles.presetPhotoText}>Use High-Res Pet Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Item Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{type === "product" ? "Product Title" : "Service Name"}</Text>
            <View style={styles.inputWrapper}>
              <Tag size={16} color="#64748b" />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={type === "product" ? "e.g., Organic Salmon Dog Treats" : "e.g., Mobile Spa Dog Grooming"}
                placeholderTextColor="#64748b"
              />
            </View>
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price</Text>
            <View style={styles.inputWrapper}>
              <DollarSign size={16} color="#64748b" />
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder={type === "product" ? "19.99" : "50.00 / session"}
                placeholderTextColor="#64748b"
                keyboardType={type === "product" ? "numeric" : "default"}
              />
            </View>
          </View>

          {/* Category Quick Chips */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {(type === "product" ? PRODUCT_CATEGORIES : SERVICE_CATEGORIES).map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Service Location (only for services) */}
          {type === "service" && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Location / Area</Text>
              <View style={styles.inputWrapper}>
                <MapPin size={16} color="#64748b" />
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g., Austin, TX & surrounding areas"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputWrapper, { height: 88, alignItems: "flex-start", paddingVertical: 10 }]}>
              <FileText size={16} color="#64748b" style={{ marginTop: 2 }} />
              <TextInput
                style={[styles.input, { height: "100%", textAlignVertical: "top" }]}
                value={description}
                onChangeText={setDescription}
                placeholder={
                  type === "product"
                    ? "Describe ingredients, materials, sizing, or health benefits..."
                    : "Describe what is included in this session, your experience, and schedule..."
                }
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Bottom Action Submit Button */}
          <TouchableOpacity
            style={[styles.publishBtn, isPublishing && { opacity: 0.7 }]}
            onPress={handlePublish}
            disabled={isPublishing}
            activeOpacity={0.85}
          >
            {isPublishing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Sparkles size={18} color="#ffffff" />
                <Text style={styles.publishBtnText}>
                  {type === "product" ? "Publish Product to Marketplace" : "Publish Service to Marketplace"}
                </Text>
              </>
            )}
          </TouchableOpacity>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  iconBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  formContainer: {
    padding: 18,
    paddingBottom: 48,
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
    paddingVertical: 10,
    borderRadius: 9,
  },
  typeBtnActive: {
    backgroundColor: "#06b6d4",
  },
  typeText: {
    color: "#94a3b8",
    fontSize: 13.5,
    fontWeight: "600",
  },
  typeTextActive: {
    color: "#ffffff",
    fontWeight: "800",
  },
  label: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161b22",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  input: {
    flex: 1,
    color: "#ffffff",
    marginLeft: 8,
    fontSize: 14,
  },
  chipsScroll: {
    flexDirection: "row",
    marginTop: 2,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#1e293b",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    borderColor: "#06b6d4",
  },
  chipText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#06b6d4",
    fontWeight: "700",
  },
  mediaUploadBox: {
    height: 140,
    backgroundColor: "#161b22",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#1e293b",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    padding: 12,
  },
  mediaPreviewBox: {
    height: 180,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 20,
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
    padding: 8,
    backgroundColor: "rgba(13, 17, 23, 0.8)",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  overlayActionBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#06b6d4",
  },
  overlayActionBtnDanger: {
    backgroundColor: "rgba(239, 68, 68, 0.8)",
  },
  overlayActionText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  iconCircleGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0d1117",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  uploadTitle: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 6,
  },
  presetPhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
  },
  presetPhotoText: {
    color: "#06b6d4",
    fontSize: 11,
    fontWeight: "700",
  },
  publishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#06b6d4",
    height: 48,
    borderRadius: 24,
    marginTop: 8,
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  publishBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
