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
  Alert,
} from "react-native";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Phone,
  Mail,
  User,
  PawPrint,
  Building,
  Video as VideoIcon,
  Sparkles,
  MessageSquare,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ServiceItem } from "@/data/marketData";
import { api } from "@/services/api";

export interface ServiceBookingItem {
  id: string;
  serviceId: string;
  serviceName: string;
  providerName: string;
  providerId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  appointmentDate: string;
  mode: "onsite" | "virtual";
  petInfo: string;
  notes?: string;
  price: string;
  status: "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

interface BookServiceModalProps {
  visible: boolean;
  service: ServiceItem | null;
  onClose: () => void;
  onSuccess?: (booking: ServiceBookingItem) => void;
  user?: any;
}

export default function BookServiceModal({
  visible,
  service,
  onClose,
  onSuccess,
  user,
}: BookServiceModalProps) {
  if (!service) return null;

  const router = useRouter();
  const [clientName, setClientName] = useState(user?.name || "Alex Morgan");
  const [clientEmail, setClientEmail] = useState(user?.email || "alex@example.com");
  const [clientPhone, setClientPhone] = useState("+1 (512) 555-0192");
  const [appointmentDate, setAppointmentDate] = useState("Tomorrow at 10:00 AM");
  const [petInfo, setPetInfo] = useState("");
  const [notes, setNotes] = useState("");
  const [chosenMode, setChosenMode] = useState<"onsite" | "virtual">(
    service.mode === "virtual" ? "virtual" : "onsite"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  const timeSlotSuggestions = [
    "Tomorrow at 10:00 AM",
    "Tomorrow at 2:30 PM",
    "This Saturday at 11:00 AM",
    "This Sunday at 3:00 PM",
  ];

  useEffect(() => {
    if (user?.name) setClientName(user.name);
    if (user?.email) setClientEmail(user.email);
  }, [user]);

  const handleConfirmBooking = async () => {
    if (!clientName.trim()) {
      Alert.alert("Name Required", "Please enter your full name.");
      return;
    }
    if (!clientPhone.trim()) {
      Alert.alert("Phone Required", "Please enter your phone number so the provider can contact you.");
      return;
    }

    setIsSubmitting(true);
    const newRef = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingRef(newRef);

    const booking: ServiceBookingItem = {
      id: newRef,
      serviceId: service.id,
      serviceName: service.name,
      providerName: service.provider,
      providerId: service.providerId || "u_1",
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim(),
      appointmentDate: appointmentDate.trim(),
      mode: chosenMode,
      petInfo: petInfo.trim(),
      notes: notes.trim(),
      price: service.price,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    try {
      const stored = await AsyncStorage.getItem("animaltok_service_bookings");
      let list = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(list)) list = [];
      list.unshift(booking);
      await AsyncStorage.setItem("animaltok_service_bookings", JSON.stringify(list));

      // Auto-send confirmation message thread to service creator
      try {
        const threadId = `booking_${booking.id}`;
        const modeLine =
          booking.mode === "virtual"
            ? "💻  Virtual / Video Consultation"
            : "🏢  Onsite / In-person Visit";
        const msgBody =
          `🗓️ Service Booking Confirmed — #${booking.id}\n` +
          `─────────────────────────\n` +
          `🏷️  Service: ${booking.serviceName}\n` +
          `📅  Scheduled: ${booking.appointmentDate}\n` +
          `${modeLine}\n` +
          `💰  Fee: ${booking.price}\n` +
          `🐾  Pet: ${booking.petInfo || "Not specified"}\n` +
          `─────────────────────────\n` +
          `👤  Client: ${booking.clientName}\n` +
          `📞  ${booking.clientPhone}` +
          (booking.clientEmail ? `\n📧  ${booking.clientEmail}` : "") +
          (booking.notes ? `\n📝  Notes: ${booking.notes}` : "");

        const clientId = user?.id || "u_client";
        const providerId = booking.providerId || "u_provider";
        const clientDisplayName = booking.clientName || user?.name || "Client";
        const providerDisplayName = booking.providerName || "Service Provider";

        await api.sendMessage(
          threadId,
          msgBody,
          clientId,
          providerId,
          clientDisplayName,
          user?.avatar || "🐾",
          providerDisplayName,
          service.image || "🩺"
        );

        // Also persist thread locally so it appears instantly in the Inbox and chat
        const localThreadKey = `animaltok_thread_${threadId}`;
        const localMsg = {
          id: `msg_${Date.now()}`,
          sender: "me",
          text: msgBody,
          time: "Just now",
          threadId,
          senderId: clientId,
          recipientId: providerId,
          createdAt: new Date().toISOString(),
        };
        const existingThread = await AsyncStorage.getItem(localThreadKey);
        const threadMsgs = existingThread ? JSON.parse(existingThread) : [];
        threadMsgs.push(localMsg);
        await AsyncStorage.setItem(localThreadKey, JSON.stringify(threadMsgs));
      } catch (msgErr) {
        console.warn("Auto-message after booking failed (non-blocking):", msgErr);
      }

      setIsSubmitting(false);
      setConfirmed(true);
      if (onSuccess) onSuccess(booking);
    } catch (e) {
      console.warn("Failed to persist service booking:", e);
      setIsSubmitting(false);
      setConfirmed(true);
      if (onSuccess) onSuccess(booking);
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
              <Calendar size={18} color="#06b6d4" />
              <Text style={styles.headerTitle}>
                {confirmed ? "Booking Confirmed" : "Book Service"}
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
              <Text style={styles.successTitle}>Booking Requested! 🎉</Text>
              <Text style={styles.successSub}>
                Reference: <Text style={{ color: "#06b6d4", fontWeight: "700" }}>#{bookingRef}</Text>
              </Text>

              <View style={styles.passCard}>
                <Text style={styles.passServiceName}>{service.name}</Text>
                <Text style={styles.passProvider}>Provider: {service.provider}</Text>

                <View style={styles.passDivider} />

                <View style={styles.passRow}>
                  <Calendar size={14} color="#06b6d4" />
                  <Text style={styles.passText}>{appointmentDate}</Text>
                </View>
                <View style={styles.passRow}>
                  {chosenMode === "virtual" ? (
                    <VideoIcon size={14} color="#06b6d4" />
                  ) : (
                    <Building size={14} color="#06b6d4" />
                  )}
                  <Text style={styles.passText}>
                    Mode: {chosenMode === "virtual" ? "Virtual / Video Consult" : "Onsite / In-person"}
                  </Text>
                </View>
                <View style={styles.passRow}>
                  <User size={14} color="#94a3b8" />
                  <Text style={styles.passText}>Client: {clientName} ({clientPhone})</Text>
                </View>
                {petInfo ? (
                  <View style={styles.passRow}>
                    <PawPrint size={14} color="#ec4899" />
                    <Text style={styles.passText}>Pet: {petInfo}</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.successNote}>
                Your booking request and confirmation have been sent to {service.provider}. A chat thread has been started so you can message each other directly.
              </Text>

              <View style={styles.successActions}>
                <TouchableOpacity
                  style={styles.chatBtn}
                  onPress={() => {
                    handleClose();
                    router.push({
                      pathname: "/(tabs)/message/[id]",
                      params: {
                        id: `booking_${bookingRef}`,
                        recipientId: service.providerId || "u_provider",
                        name: service.provider,
                        avatar: service.image || "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&fit=crop",
                        itemTitle: service.name,
                        itemPrice: service.price,
                        itemType: "service",
                        itemImage: service.image,
                      },
                    });
                  }}
                  activeOpacity={0.85}
                >
                  <MessageSquare size={16} color="#ffffff" />
                  <Text style={styles.chatBtnText}>Chat with Provider</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.doneBtn} onPress={handleClose} activeOpacity={0.85}>
                  <Text style={styles.doneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            /* Booking Form */
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Service Header Card */}
              <View style={styles.serviceCard}>
                <Image source={{ uri: service.image }} style={styles.serviceImage} resizeMode="cover" />
                <View style={styles.serviceBody}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceProvider}>By {service.provider}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceBold}>{service.price}</Text>
                    {service.category ? (
                      <View style={styles.categoryPill}>
                        <Text style={styles.categoryText}>{service.category}</Text>
                      </View>
                    ) : null}
                  </View>

                  {service.availability ? (
                    <View style={styles.metaRow}>
                      <Clock size={12} color="#06b6d4" />
                      <Text style={styles.metaText}>{service.availability}</Text>
                    </View>
                  ) : null}

                  {service.locationAddress || service.locationName ? (
                    <View style={styles.metaRow}>
                      <MapPin size={12} color="#64748b" />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {service.locationName ? `${service.locationName} • ` : ""}
                        {service.locationAddress}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Form Fields */}
              <View style={styles.formSection}>
                <Text style={styles.sectionHeader}>BOOKING DETAILS</Text>

                {/* Client Name */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <User size={13} color="#06b6d4" />
                    <Text style={styles.inputLabel}>Full Name *</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={clientName}
                    onChangeText={setClientName}
                    placeholder="Your Name"
                    placeholderTextColor="#64748b"
                  />
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Phone size={13} color="#06b6d4" />
                    <Text style={styles.inputLabel}>Phone Number *</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={clientPhone}
                    onChangeText={setClientPhone}
                    placeholder="+1 (555) 000-0000"
                    placeholderTextColor="#64748b"
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Mail size={13} color="#06b6d4" />
                    <Text style={styles.inputLabel}>Email Address</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={clientEmail}
                    onChangeText={setClientEmail}
                    placeholder="name@example.com"
                    placeholderTextColor="#64748b"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Mode Selector (if service allows) */}
                {service.mode === "both" && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Appointment Mode</Text>
                    <View style={styles.modeRow}>
                      <TouchableOpacity
                        style={[styles.modePill, chosenMode === "onsite" && styles.modePillActive]}
                        onPress={() => setChosenMode("onsite")}
                      >
                        <Building size={13} color={chosenMode === "onsite" ? "#06b6d4" : "#94a3b8"} />
                        <Text style={[styles.modeText, chosenMode === "onsite" && styles.modeTextActive]}>
                          Onsite / In-person
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.modePill, chosenMode === "virtual" && styles.modePillActive]}
                        onPress={() => setChosenMode("virtual")}
                      >
                        <VideoIcon size={13} color={chosenMode === "virtual" ? "#06b6d4" : "#94a3b8"} />
                        <Text style={[styles.modeText, chosenMode === "virtual" && styles.modeTextActive]}>
                          Virtual / Video
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Preferred Date & Time */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Calendar size={13} color="#06b6d4" />
                    <Text style={styles.inputLabel}>Preferred Date & Time</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={appointmentDate}
                    onChangeText={setAppointmentDate}
                    placeholder="e.g. Tomorrow at 10:00 AM"
                    placeholderTextColor="#64748b"
                  />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                    {timeSlotSuggestions.map((slot) => (
                      <TouchableOpacity
                        key={slot}
                        style={[styles.slotChip, appointmentDate === slot && styles.slotChipActive]}
                        onPress={() => setAppointmentDate(slot)}
                      >
                        <Text style={[styles.slotChipText, appointmentDate === slot && styles.slotChipTextActive]}>
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Pet Info */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <PawPrint size={13} color="#ec4899" />
                    <Text style={styles.inputLabel}>Pet Name & Breed (Optional)</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={petInfo}
                    onChangeText={setPetInfo}
                    placeholder="e.g. Bella (French Bulldog, 2 yrs)"
                    placeholderTextColor="#64748b"
                  />
                </View>

                {/* Notes */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Special Instructions or Requests</Text>
                  <TextInput
                    style={[styles.input, { height: 60, paddingTop: 10 }]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Any specific symptoms, temperament notes, or preferences..."
                    placeholderTextColor="#64748b"
                    multiline
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={handleConfirmBooking}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Sparkles size={16} color="#ffffff" />
                    <Text style={styles.submitBtnText}>Confirm Booking Request</Text>
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
  serviceCard: {
    backgroundColor: "#161b22",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  serviceImage: {
    width: "100%",
    height: 130,
  },
  serviceBody: {
    padding: 12,
  },
  serviceName: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 3,
  },
  serviceProvider: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceBold: {
    color: "#06b6d4",
    fontSize: 18,
    fontWeight: "800",
  },
  categoryPill: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    color: "#06b6d4",
    fontSize: 11,
    fontWeight: "700",
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
    marginBottom: 4,
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
  modeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  modePill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#0d1117",
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  modePillActive: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    borderColor: "#06b6d4",
  },
  modeText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  modeTextActive: {
    color: "#06b6d4",
    fontWeight: "700",
  },
  slotChip: {
    backgroundColor: "#0d1117",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginRight: 6,
  },
  slotChipActive: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    borderColor: "#06b6d4",
  },
  slotChipText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600",
  },
  slotChipTextActive: {
    color: "#06b6d4",
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
  passServiceName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  passProvider: {
    color: "#06b6d4",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  passDivider: {
    height: 1,
    backgroundColor: "#1e293b",
    marginVertical: 10,
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
  successNote: {
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  successActions: {
    width: "100%",
    gap: 10,
  },
  chatBtn: {
    width: "100%",
    backgroundColor: "#06b6d4",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  chatBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  doneBtn: {
    width: "100%",
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },
});

