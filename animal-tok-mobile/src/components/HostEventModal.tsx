import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { X, Calendar, MapPin, Sparkles, Camera, Image as ImageIcon, Check, ShieldCheck, DollarSign, Users } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, uploadMedia } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface HostEventModalProps {
  visible: boolean;
  onClose: () => void;
  onEventCreated?: (event: any) => void;
}

const CATEGORIES = [
  { id: "meetup", label: "🐾 Meetup & Play" },
  { id: "mating", label: "❤️ Mating & Breeding" },
  { id: "sports", label: "🏆 Sports & Agility" },
  { id: "contest", label: "🎉 Contest & Show" },
  { id: "clinic", label: "🩺 Vet Clinic" },
  { id: "adoption", label: "🏠 Adoption Fair" },
];

const PET_TYPES = [
  { id: "all", label: "🐾 All Pets" },
  { id: "dog", label: "🐕 Dogs" },
  { id: "cat", label: "🐈 Cats" },
  { id: "bird", label: "🦜 Birds" },
  { id: "rabbit", label: "🐇 Rabbits" },
  { id: "exotic", label: "🦎 Exotic" },
];

export default function HostEventModal({ visible, onClose, onEventCreated }: HostEventModalProps) {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("Saturday, Dec 12 • 10:00 AM");
  const [location, setLocation] = useState("Central Community Pet Park");
  const [category, setCategory] = useState("meetup");
  const [petType, setPetType] = useState("all");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [ticketPrice, setTicketPrice] = useState("15.00");
  const [capacity, setCapacity] = useState("50");
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });
      if (!res.canceled && res.assets[0]?.uri) {
        setImageUri(res.assets[0].uri);
      }
    } catch (e) {
      Alert.alert("Photo Access", "Please allow gallery permissions to pick an event banner.");
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      return Alert.alert("Missing Title", "Please provide a title for your pet event.");
    }
    if (!location.trim()) {
      return Alert.alert("Missing Location", "Please provide a location or address.");
    }

    setLoading(true);
    try {
      let finalImageUrl = imageUri;
      if (imageUri && (imageUri.startsWith("file:") || imageUri.startsWith("content:"))) {
        const uploaded = await uploadMedia(imageUri, "animaltok/events");
        if (uploaded) finalImageUrl = uploaded;
      }

      const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label || "Meetup";
      const cleanPrice = parseFloat(ticketPrice.replace(/[^0-9.]/g, "")) || 0;
      const formattedPrice = isPaid && cleanPrice > 0 ? `$${cleanPrice.toFixed(2)}` : "Free";

      const payload = {
        title: title.trim(),
        date: date.trim(),
        location: location.trim(),
        category: categoryLabel.replace(/^[^\w]+/, "").trim(),
        petType,
        description: description.trim() || `Join us for ${title}! All friendly pets welcome.`,
        image: finalImageUrl || "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&fit=crop",
        organizerId: user?.id || "u_1",
        organizerName: user?.name || "Community Host",
        isPaid: Boolean(isPaid && cleanPrice > 0),
        ticketPrice: formattedPrice,
        capacity: isPaid ? parseInt(capacity) || 50 : 100,
        escrowStatus: isPaid && cleanPrice > 0 ? "held" : "active",
      };

      const created = await api.createEvent(payload);
      const finalEvent = created || { id: `evt_${Date.now()}`, ...payload };
      try {
        const stored = await AsyncStorage.getItem("animaltok_custom_events");
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(finalEvent);
        await AsyncStorage.setItem("animaltok_custom_events", JSON.stringify(list));
      } catch (e) {
        console.warn("Failed to persist custom event:", e);
      }

      Alert.alert(
        "Event Created! 🎉",
        isPaid
          ? `"${title}" has been published with Escrow Protection. Ticket funds will be secured in platform escrow.`
          : `"${title}" has been published to the Events Hub.`
      );
      if (onEventCreated) onEventCreated(finalEvent);
      onClose();

      // Reset fields
      setTitle("");
      setDescription("");
      setImageUri(null);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not publish event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Host a Pet Event</Text>
              <Text style={styles.sheetSub}>Organize a meetup, mating day, agility cup or clinic</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            {/* Banner Photo */}
            <TouchableOpacity style={styles.bannerPicker} onPress={pickImage} activeOpacity={0.8}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.bannerImg} />
              ) : (
                <View style={styles.bannerPlaceholder}>
                  <Camera size={26} color="#06b6d4" />
                  <Text style={styles.bannerText}>Add Event Banner Photo</Text>
                  <Text style={styles.bannerSubText}>16:9 widescreen recommended</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Event Title */}
            <Text style={styles.fieldLabel}>Event Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Austin Frenchie & Pug Playdate 🎾"
              placeholderTextColor="#64748b"
              value={title}
              onChangeText={setTitle}
            />

            {/* Event Category */}
            <Text style={styles.fieldLabel}>Event Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Target Pet Species */}
            <Text style={styles.fieldLabel}>Target Pet Species</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {PET_TYPES.map((pet) => {
                const isSelected = petType === pet.id;
                return (
                  <TouchableOpacity
                    key={pet.id}
                    style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                    onPress={() => setPetType(pet.id)}
                  >
                    <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                      {pet.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Date & Time */}
            <Text style={styles.fieldLabel}>Date & Time</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Saturday, Dec 12 • 10:00 AM"
              placeholderTextColor="#64748b"
              value={date}
              onChangeText={setDate}
            />

            {/* Location */}
            <Text style={styles.fieldLabel}>Location / Park *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Zilker Metro Park, Austin TX"
              placeholderTextColor="#64748b"
              value={location}
              onChangeText={setLocation}
            />

            {/* Description */}
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell pet parents what to bring, park rules, agility obstacles, or stud pedigree requirements..."
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />

            {/* Event Admission: Free vs Ticketed / Paid */}
            <Text style={styles.fieldLabel}>Event Admission & Pricing</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, !isPaid && styles.toggleBtnActive]}
                onPress={() => setIsPaid(false)}
              >
                <Text style={[styles.toggleBtnText, !isPaid && styles.toggleBtnTextActive]}>
                  Free RSVP Event
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleBtn, isPaid && styles.toggleBtnActive]}
                onPress={() => setIsPaid(true)}
              >
                <Text style={[styles.toggleBtnText, isPaid && styles.toggleBtnTextActive]}>
                  🎟️ Paid / Ticketed
                </Text>
              </TouchableOpacity>
            </View>

            {/* Paid Event Details & Escrow Box */}
            {isPaid && (
              <View style={styles.paidFieldsBox}>
                <View style={styles.paidInputsRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subFieldLabel}>Ticket Price ($)</Text>
                    <View style={styles.inputPrefixWrap}>
                      <DollarSign size={15} color="#06b6d4" />
                      <TextInput
                        style={styles.inputPrefixText}
                        placeholder="15.00"
                        placeholderTextColor="#64748b"
                        keyboardType="numeric"
                        value={ticketPrice}
                        onChangeText={setTicketPrice}
                      />
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.subFieldLabel}>Max Capacity</Text>
                    <View style={styles.inputPrefixWrap}>
                      <Users size={15} color="#06b6d4" />
                      <TextInput
                        style={styles.inputPrefixText}
                        placeholder="50"
                        placeholderTextColor="#64748b"
                        keyboardType="numeric"
                        value={capacity}
                        onChangeText={setCapacity}
                      />
                    </View>
                  </View>
                </View>

                {/* Escrow Guarantee Callout */}
                <View style={styles.escrowNoticeCard}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <ShieldCheck size={16} color="#10b981" />
                    <Text style={styles.escrowNoticeTitle}>Animandler Escrow Protection</Text>
                  </View>
                  <Text style={styles.escrowNoticeBody}>
                    Ticket proceeds are held securely in platform escrow. If you need to cancel or postpone the event, ticket holders receive an automated 100% refund. Host payout is released 24h after your event concludes.
                  </Text>
                </View>
              </View>
            )}

            {/* Publish Button */}
            <TouchableOpacity
              style={[styles.publishBtn, loading && { opacity: 0.6 }]}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Sparkles size={18} color="#ffffff" />
                  <Text style={styles.publishBtnText}>Publish Event to Community</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#161b22",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  sheetTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  sheetSub: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#21262d",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetContent: {
    padding: 20,
    paddingBottom: 40,
  },
  bannerPicker: {
    width: "100%",
    height: 140,
    borderRadius: 14,
    backgroundColor: "#0d1117",
    borderWidth: 1.5,
    borderColor: "#334155",
    borderStyle: "dashed",
    overflow: "hidden",
    marginBottom: 16,
  },
  bannerImg: {
    width: "100%",
    height: "100%",
  },
  bannerPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  bannerText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  bannerSubText: {
    color: "#64748b",
    fontSize: 11,
  },
  fieldLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#0d1117",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    color: "#ffffff",
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  chipsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  categoryChipActive: {
    backgroundColor: "rgba(6, 182, 212, 0.18)",
    borderColor: "#06b6d4",
  },
  categoryChipText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: "#06b6d4",
    fontWeight: "700",
  },
  publishBtn: {
    backgroundColor: "#06b6d4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 24,
  },
  publishBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#0d1117",
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 14,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
  },
  toggleBtnActive: {
    backgroundColor: "#06b6d4",
  },
  toggleBtnText: {
    color: "#94a3b8",
    fontSize: 12.5,
    fontWeight: "600",
  },
  toggleBtnTextActive: {
    color: "#ffffff",
    fontWeight: "800",
  },
  paidFieldsBox: {
    backgroundColor: "#0d1117",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 14,
    gap: 12,
  },
  paidInputsRow: {
    flexDirection: "row",
    gap: 10,
  },
  subFieldLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  inputPrefixWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161b22",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingHorizontal: 10,
    height: 42,
    gap: 6,
  },
  inputPrefixText: {
    flex: 1,
    color: "#ffffff",
    fontSize: 13,
  },
  escrowNoticeCard: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
    borderRadius: 10,
    padding: 10,
  },
  escrowNoticeTitle: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "700",
  },
  escrowNoticeBody: {
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 16,
  },
});

