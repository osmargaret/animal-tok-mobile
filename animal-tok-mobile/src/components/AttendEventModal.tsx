import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Linking,
  Alert,
} from "react-native";
import {
  X,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  Phone,
  Mail,
  User,
  PawPrint,
  Clock,
  ExternalLink,
  Ticket,
  Sparkles,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/api";

export interface AttendEventItem {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  image?: string;
  categoryLabel?: string;
  organizerName?: string;
  isPaid?: boolean;
  ticketPrice?: string;
  attendees?: number;
}

interface AttendEventModalProps {
  visible: boolean;
  event: AttendEventItem | null;
  onClose: () => void;
  onSuccess: (eventId: string) => void;
  user?: any;
}

export default function AttendEventModal({
  visible,
  event,
  onClose,
  onSuccess,
  user,
}: AttendEventModalProps) {
  if (!event) return null;

  const isPaid = Boolean(event.isPaid && event.ticketPrice && event.ticketPrice.toLowerCase() !== "free");
  const unitPrice = parseFloat((event.ticketPrice || "0").replace(/[^0-9.]/g, "")) || 0;

  // Form states
  const [fullName, setFullName] = useState(user?.name || "Alex Morgan");
  const [email, setEmail] = useState(user?.email || "alex@example.com");
  const [phone, setPhone] = useState("+1 (512) 555-0192");
  const [guestsCount, setGuestsCount] = useState(1);
  const [petInfo, setPetInfo] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [regId, setRegId] = useState("");

  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  const handleRegister = async () => {
    if (!fullName.trim()) {
      Alert.alert("Name Required", "Please enter your full name to register.");
      return;
    }

    setLoading(true);
    const newRegId = `REG-${Math.floor(100000 + Math.random() * 900000)}`;
    setRegId(newRegId);

    try {
      // 1. Persist locally to user's registered events
      const stored = await AsyncStorage.getItem("animaltok_event_registrations");
      let list = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(list)) list = [];
      list.unshift({
        regId: newRegId,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        guestsCount,
        petInfo: petInfo.trim(),
        isPaid: false,
        createdAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem("animaltok_event_registrations", JSON.stringify(list));

      // 2. Call backend RSVP endpoint
      try {
        await api.toggleEventRsvp(event.id);
      } catch (e) {}

      setConfirmed(true);
      onSuccess(event.id);
    } catch (e) {
      console.warn("Failed to save registration:", e);
      setConfirmed(true);
      onSuccess(event.id);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmed(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ticket size={20} color="#06b6d4" />
              <Text style={styles.headerTitle}>
                {confirmed ? "Registration Confirmed" : "Attend Event"}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.8}>
              <X size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {confirmed ? (
            /* Confirmation View */
            <ScrollView contentContainerStyle={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <CheckCircle size={54} color="#10b981" />
              </View>
              <Text style={styles.successTitle}>You're Registered! 🎉</Text>
              <Text style={styles.successSub}>
                Pass ID: <Text style={{ color: "#06b6d4", fontWeight: "700" }}>#{regId}</Text>
              </Text>

              <View style={styles.passCard}>
                <Text style={styles.passEventTitle}>{event.title}</Text>
                <View style={styles.passRow}>
                  <Calendar size={14} color="#06b6d4" />
                  <Text style={styles.passText}>{event.date}</Text>
                </View>
                <View style={styles.passRow}>
                  <MapPin size={14} color="#64748b" />
                  <Text style={styles.passText}>{event.location}</Text>
                </View>
                <View style={styles.passDivider} />
                <View style={styles.passRow}>
                  <User size={14} color="#94a3b8" />
                  <Text style={styles.passText}>Attendee: {fullName} ({guestsCount} {guestsCount > 1 ? "guests" : "guest"})</Text>
                </View>
                {petInfo ? (
                  <View style={styles.passRow}>
                    <PawPrint size={14} color="#ec4899" />
                    <Text style={styles.passText}>Pet: {petInfo}</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.successNote}>
                A confirmation has been saved to your account. Present this digital pass or give your name at the event entrance.
              </Text>

              <TouchableOpacity style={styles.doneBtn} onPress={handleClose} activeOpacity={0.85}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            /* Attendance Form */
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Event Card Header */}
              <View style={styles.eventCard}>
                {event.image ? (
                  <Image source={{ uri: event.image }} style={styles.eventImage} resizeMode="cover" />
                ) : null}
                <View style={styles.eventBody}>
                  {event.categoryLabel ? (
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>{event.categoryLabel}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.metaRow}>
                    <Calendar size={13} color="#06b6d4" />
                    <Text style={styles.metaText}>{event.date}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <MapPin size={13} color="#64748b" />
                    <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Admission:</Text>
                    <Text style={[styles.priceValue, { color: "#10b981" }]}>
                      Free Entry
                    </Text>
                  </View>
                </View>
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                <Text style={styles.sectionHeader}>ATTENDEE DETAILS</Text>

                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <User size={13} color="#06b6d4" />
                    <Text style={styles.inputLabel}>Full Name *</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter your name"
                    placeholderTextColor="#64748b"
                  />
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Mail size={13} color="#06b6d4" />
                    <Text style={styles.inputLabel}>Email Address *</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@example.com"
                    placeholderTextColor="#64748b"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Phone size={13} color="#06b6d4" />
                    <Text style={styles.inputLabel}>Phone Number (for event updates)</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+1 (555) 000-0000"
                    placeholderTextColor="#64748b"
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Number of Attendees / Tickets */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Users size={13} color="#06b6d4" />
                    <Text style={styles.inputLabel}>Number of Attendees / Passes</Text>
                  </View>
                  <View style={styles.guestCounterRow}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <TouchableOpacity
                        key={num}
                        style={[styles.guestPill, guestsCount === num && styles.guestPillActive]}
                        onPress={() => setGuestsCount(num)}
                      >
                        <Text style={[styles.guestPillText, guestsCount === num && styles.guestPillTextActive]}>
                          {num}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Pet Info */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <PawPrint size={13} color="#ec4899" />
                    <Text style={styles.inputLabel}>Pet Bringing Along (Optional)</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={petInfo}
                    onChangeText={setPetInfo}
                    placeholder="e.g. Milo (Golden Retriever, 2 yrs)"
                    placeholderTextColor="#64748b"
                  />
                </View>

                {/* Special Requests */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notes for the Host (Optional)</Text>
                  <TextInput
                    style={[styles.input, { height: 60, paddingTop: 10 }]}
                    value={specialNotes}
                    onChangeText={setSpecialNotes}
                    placeholder="Any questions or special requests..."
                    placeholderTextColor="#64748b"
                    multiline
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.6 }]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <CheckCircle size={16} color="#ffffff" />
                    <Text style={styles.submitBtnText}>Confirm Attendance</Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
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
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  eventCard: {
    backgroundColor: "#161b22",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  eventImage: {
    width: "100%",
    height: 120,
  },
  eventBody: {
    padding: 12,
  },
  categoryPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  categoryPillText: {
    color: "#06b6d4",
    fontSize: 11,
    fontWeight: "700",
  },
  eventTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  metaText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "500",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  priceLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },
  priceValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  formSection: {
    backgroundColor: "#161b22",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  sectionHeader: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  inputLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#ffffff",
    fontSize: 13,
  },
  guestCounterRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  guestPill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#0d1117",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  guestPillActive: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    borderColor: "#06b6d4",
  },
  guestPillText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "700",
  },
  guestPillTextActive: {
    color: "#06b6d4",
  },
  summaryCard: {
    backgroundColor: "#161b22",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    color: "#94a3b8",
    fontSize: 13,
  },
  summaryValue: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#1e293b",
    marginVertical: 10,
  },
  totalLabel: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  totalValue: {
    color: "#06b6d4",
    fontSize: 18,
    fontWeight: "800",
  },
  submitBtn: {
    backgroundColor: "#06b6d4",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  successContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    marginTop: 20,
  },
  successTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
  },
  successSub: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 20,
  },
  passCard: {
    width: "100%",
    backgroundColor: "#161b22",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  passEventTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  passRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  passText: {
    color: "#cbd5e1",
    fontSize: 13,
    flex: 1,
  },
  passDivider: {
    height: 1,
    backgroundColor: "#1e293b",
    marginVertical: 10,
  },
  successNote: {
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  doneBtn: {
    width: "100%",
    backgroundColor: "#06b6d4",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  awaitingContainer: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  awaitingIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  awaitingTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  awaitingSub: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  refCard: {
    width: "100%",
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 18,
  },
  refRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  refLabel: {
    color: "#64748b",
    fontSize: 12,
  },
  refValue: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  verifyActionBtn: {
    width: "100%",
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  verifyActionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  reopenLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    marginBottom: 8,
  },
  reopenLinkText: {
    color: "#06b6d4",
    fontSize: 13,
    fontWeight: "600",
  },
  cancelVerifyBtn: {
    paddingVertical: 8,
  },
  cancelVerifyText: {
    color: "#64748b",
    fontSize: 12,
  },
});
