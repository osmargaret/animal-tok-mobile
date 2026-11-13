import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import {
  Star,
  Calendar,
  Clock,
  ChevronLeft,
  Building,
  Video as VideoIcon,
  Sparkles,
  MapPin,
  MessageSquare,
  Trash2,
  User,
  PawPrint,
  CheckCircle2,
  CalendarDays,
  Phone,
  Mail,
  FileText,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BookServiceModal from "@/components/BookServiceModal";

export interface ServiceAppointment {
  id: string;
  serviceId?: string;
  serviceName?: string;
  provider?: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAvatar?: string;
  petName?: string;
  petBreed?: string;
  petNotes?: string;
  appointmentDate: string;
  mode: "onsite" | "virtual";
  status?: "upcoming" | "past" | "confirmed" | "completed" | "cancelled";
  createdAt?: string;
}

const DEFAULT_APPOINTMENTS: ServiceAppointment[] = [
  {
    id: "APP-UP-01",
    serviceId: "srv_1",
    serviceName: "Professional Pet Service",
    clientName: "Jessica Hayes",
    clientPhone: "+1 (512) 555-0188",
    clientEmail: "jessica.h@example.com",
    petName: "Milo",
    petBreed: "Goldendoodle",
    petNotes: "Friendly pup, sensitive skin. Prefers oatmeal wash.",
    appointmentDate: "Tomorrow • 10:00 AM – 11:30 AM",
    mode: "onsite",
    status: "upcoming",
    createdAt: new Date().toISOString(),
  },
  {
    id: "APP-PAST-02",
    serviceId: "srv_1",
    serviceName: "Professional Pet Service",
    clientName: "David Miller",
    clientPhone: "+1 (512) 555-0177",
    clientEmail: "david.m@example.com",
    petName: "Rocky",
    petBreed: "French Bulldog",
    petNotes: "Completed nail trimming and ear hygiene check.",
    appointmentDate: "Yesterday • 2:00 PM – 3:30 PM",
    mode: "onsite",
    status: "past",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

function isAppointmentPassed(app: ServiceAppointment): boolean {
  if (app.status === "past" || app.status === "completed" || app.status === "cancelled") {
    return true;
  }
  const dateStr = (app.appointmentDate || "").toLowerCase();
  if (dateStr.includes("yesterday") || dateStr.includes("last week") || dateStr.includes("completed")) {
    return true;
  }
  if (dateStr.includes("tomorrow") || dateStr.includes("saturday") || dateStr.includes("sunday")) {
    return false;
  }
  if (dateStr.includes("today")) {
    const eveningCutoff = new Date();
    eveningCutoff.setHours(21, 0, 0, 0);
    return new Date() > eveningCutoff;
  }
  const parsed = new Date(app.appointmentDate);
  if (!isNaN(parsed.getTime())) {
    return new Date().getTime() > parsed.getTime();
  }
  return false;
}

export default function ServiceDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // Parse params
  const {
    id,
    name = "Professional Pet Care",
    price = "$45.00",
    rating = "5.0",
    provider = "Verified Specialist",
    image = "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&fit=crop",
    category = "Pet Care",
    description,
    availability = "Monday to Friday, 9:00 AM – 10:00 PM",
    locationName,
    locationAddress,
    mode = "onsite",
    isOwner,
  } = params as Record<string, string>;

  const isCreator = isOwner === "true" || user?.name === provider;

  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [appointments, setAppointments] = useState<ServiceAppointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentTab, setAppointmentTab] = useState<"upcoming" | "past">("upcoming");

  const loadAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const stored = await AsyncStorage.getItem("animaltok_service_bookings");
      let list: ServiceAppointment[] = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(list) || list.length === 0) {
        list = DEFAULT_APPOINTMENTS;
        await AsyncStorage.setItem("animaltok_service_bookings", JSON.stringify(DEFAULT_APPOINTMENTS));
      }
      setAppointments(list);
    } catch {
      setAppointments(DEFAULT_APPOINTMENTS);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [])
  );

  const handleDeleteAppointment = (appointmentId: string) => {
    const doDelete = async () => {
      const updated = appointments.filter((a) => a.id !== appointmentId);
      setAppointments(updated);
      await AsyncStorage.setItem("animaltok_service_bookings", JSON.stringify(updated));
    };

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm("Are you sure you want to delete this appointment?")) {
        doDelete();
      }
    } else {
      Alert.alert("Delete Appointment", "Are you sure you want to permanently delete this appointment?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: doDelete },
      ]);
    }
  };

  const handleMessageClient = (app: ServiceAppointment) => {
    const clientDisplayName = app.clientName || "Client";
    const threadId = `booking_chat_${clientDisplayName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${app.id}`;
    router.push({
      pathname: "/(tabs)/message/[id]",
      params: {
        id: threadId,
        name: clientDisplayName,
        avatar: app.clientAvatar || "👤",
        itemTitle: name,
        itemPrice: price,
        itemType: "service",
        itemImage: image,
        initialMessage: `Hi ${clientDisplayName}, regarding your "${name}" appointment (${app.appointmentDate}) for ${app.petName || "your pet"}...`,
      },
    });
  };

  // Split appointments into Upcoming and Past
  const upcomingAppointments = appointments.filter((a) => !isAppointmentPassed(a));
  const pastAppointments = appointments.filter((a) => isAppointmentPassed(a));
  const displayedAppointments = appointmentTab === "upcoming" ? upcomingAppointments : pastAppointments;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1117" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.ratingBadge}>
            <Star size={13} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>

        {/* Main Service Details */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.category}>{category}</Text>
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.provider}>By {provider}</Text>
          </View>

          {/* Price & Mode Row */}
          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.priceLabel}>Service Fee</Text>
              <Text style={styles.price}>{price}</Text>
            </View>
            <View style={styles.modeBadge}>
              {mode === "virtual" ? (
                <VideoIcon size={14} color="#06b6d4" />
              ) : mode === "both" ? (
                <Sparkles size={14} color="#06b6d4" />
              ) : (
                <Building size={14} color="#06b6d4" />
              )}
              <Text style={styles.modeBadgeText}>
                {mode === "virtual" ? "Virtual / Online" : mode === "both" ? "Onsite & Virtual" : "Onsite / In-Person"}
              </Text>
            </View>
          </View>

          {/* Availability & Location Info */}
          <View style={styles.specsBox}>
            <View style={styles.specRow}>
              <Clock size={16} color="#06b6d4" />
              <View style={{ flex: 1 }}>
                <Text style={styles.specLabel}>Availability</Text>
                <Text style={styles.specValue}>{availability}</Text>
              </View>
            </View>

            {(locationName || locationAddress) ? (
              <View style={[styles.specRow, { marginTop: 12 }]}>
                <MapPin size={16} color="#06b6d4" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.specLabel}>Location / Facility</Text>
                  {locationName ? <Text style={[styles.specValue, { fontWeight: "700" }]}>{locationName}</Text> : null}
                  {locationAddress ? <Text style={styles.specValue}>{locationAddress}</Text> : null}
                </View>
              </View>
            ) : null}
          </View>

          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About this Service</Text>
            <Text style={styles.descriptionText}>
              {description ||
                `Certified ${name.toLowerCase()} tailored to the individual health and comfort needs of your pet. Experienced handling and flexible scheduling.`}
            </Text>
          </View>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* CREATOR APPOINTMENTS SECTION WITH UPCOMING & PAST TABS         */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {isCreator && (
            <View style={styles.creatorAppointmentsSection}>
              <View style={styles.appointmentsHeaderRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <CalendarDays size={18} color="#06b6d4" />
                  <Text style={styles.appointmentsSectionTitle}>Service Appointments</Text>
                </View>
                <View style={styles.totalBadge}>
                  <Text style={styles.totalBadgeText}>{appointments.length} Total</Text>
                </View>
              </View>

              {/* Tabs: Upcoming Appointments vs Past Appointments */}
              <View style={styles.appTabsRow}>
                <TouchableOpacity
                  style={[styles.appTabBtn, appointmentTab === "upcoming" && styles.appTabBtnActive]}
                  onPress={() => setAppointmentTab("upcoming")}
                  activeOpacity={0.8}
                >
                  <Clock size={13} color={appointmentTab === "upcoming" ? "#06b6d4" : "#64748b"} />
                  <Text
                    style={[
                      styles.appTabBtnText,
                      appointmentTab === "upcoming" && styles.appTabBtnTextActive,
                    ]}
                  >
                    Upcoming ({upcomingAppointments.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.appTabBtn, appointmentTab === "past" && styles.appTabBtnActive]}
                  onPress={() => setAppointmentTab("past")}
                  activeOpacity={0.8}
                >
                  <CheckCircle2 size={13} color={appointmentTab === "past" ? "#10b981" : "#64748b"} />
                  <Text
                    style={[
                      styles.appTabBtnText,
                      appointmentTab === "past" && styles.appTabBtnTextActivePast,
                    ]}
                  >
                    Past ({pastAppointments.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Appointments List */}
              {loadingAppointments ? (
                <ActivityIndicator size="small" color="#06b6d4" style={{ marginVertical: 20 }} />
              ) : displayedAppointments.length === 0 ? (
                <View style={styles.emptyAppointmentsBox}>
                  <Text style={{ fontSize: 32, marginBottom: 8 }}>📅</Text>
                  <Text style={styles.emptyAppTitle}>
                    {appointmentTab === "upcoming" ? "No Upcoming Appointments" : "No Past Appointments"}
                  </Text>
                  <Text style={styles.emptyAppSub}>
                    {appointmentTab === "upcoming"
                      ? "When clients book this service, their scheduled sessions will show here."
                      : "Completed appointments will appear here after their scheduled date."}
                  </Text>
                </View>
              ) : (
                <View style={styles.appointmentsList}>
                  {displayedAppointments.map((app) => (
                    <View key={app.id} style={styles.appointmentCard}>
                      {/* Client Header */}
                      <View style={styles.appClientRow}>
                        <View style={styles.appAvatarWrap}>
                          <User size={15} color="#06b6d4" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.appClientName}>{app.clientName}</Text>
                          {app.petName ? (
                            <View style={styles.appPetRow}>
                              <PawPrint size={12} color="#06b6d4" />
                              <Text style={styles.appPetText}>
                                {app.petName} {app.petBreed ? `(${app.petBreed})` : ""}
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        {/* Mode Tag */}
                        <View style={styles.appModeBadge}>
                          <Text style={styles.appModeText}>
                            {app.mode === "virtual" ? "Virtual" : "Onsite"}
                          </Text>
                        </View>
                      </View>

                      {/* Scheduled Time & Details */}
                      <View style={styles.appTimeBox}>
                        <Clock size={13} color="#06b6d4" />
                        <Text style={styles.appTimeText}>{app.appointmentDate}</Text>
                      </View>

                      {/* Contact Info */}
                      <View style={styles.appContactBox}>
                        {app.clientPhone ? (
                          <View style={styles.appContactItem}>
                            <Phone size={11} color="#64748b" />
                            <Text style={styles.appContactText}>{app.clientPhone}</Text>
                          </View>
                        ) : null}
                        {app.clientEmail ? (
                          <View style={styles.appContactItem}>
                            <Mail size={11} color="#64748b" />
                            <Text style={styles.appContactText}>{app.clientEmail}</Text>
                          </View>
                        ) : null}
                      </View>

                      {/* Pet Instructions / Notes */}
                      {app.petNotes ? (
                        <View style={styles.appNotesBox}>
                          <FileText size={12} color="#94a3b8" />
                          <Text style={styles.appNotesText} numberOfLines={2}>
                            {app.petNotes}
                          </Text>
                        </View>
                      ) : null}

                      {/* Action Buttons: Message Client & Delete */}
                      <View style={styles.appActionRow}>
                        <TouchableOpacity
                          style={styles.appMessageBtn}
                          onPress={() => handleMessageClient(app)}
                          activeOpacity={0.8}
                        >
                          <MessageSquare size={14} color="#ffffff" />
                          <Text style={styles.appMessageText}>Message Client</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.appDeleteBtn}
                          onPress={() => handleDeleteAppointment(app.id)}
                          activeOpacity={0.8}
                        >
                          <Trash2 size={15} color="#ef4444" />
                          <Text style={styles.appDeleteText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Client Booking Footer (only when viewed by non-owner client) */}
      {!isCreator && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => setBookingModalVisible(true)}
            activeOpacity={0.85}
          >
            <Calendar size={18} color="#ffffff" />
            <Text style={styles.bookBtnText}>Book Appointment • {price}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Book Service Modal */}
      <BookServiceModal
        visible={bookingModalVisible}
        service={{
          id,
          name,
          price,
          rating,
          provider,
          image,
          category,
          description,
          availability,
          locationName,
          locationAddress,
          mode: mode as any,
        }}
        user={user}
        onClose={() => setBookingModalVisible(false)}
        onSuccess={() => {
          loadAppointments();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  scrollContent: {
    paddingBottom: 80,
  },
  imageContainer: {
    width: "100%",
    height: 280,
    position: "relative",
    backgroundColor: "#161b22",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "android" ? (StatusBar.currentHeight || 28) + 8 : 45,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  ratingBadge: {
    position: "absolute",
    bottom: 14,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13, 17, 23, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  ratingText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  content: {
    padding: 18,
  },
  header: {
    marginBottom: 16,
  },
  category: {
    color: "#06b6d4",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
    marginBottom: 4,
  },
  provider: {
    color: "#94a3b8",
    fontSize: 13,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#161b22",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 11,
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  price: {
    color: "#06b6d4",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 2,
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
  },
  modeBadgeText: {
    color: "#06b6d4",
    fontSize: 12,
    fontWeight: "700",
  },
  specsBox: {
    backgroundColor: "#161b22",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  specRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  specLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
  },
  specValue: {
    fontSize: 13,
    color: "#e2e8f0",
    marginTop: 2,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  descriptionText: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 20,
  },
  creatorAppointmentsSection: {
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  appointmentsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  appointmentsSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
  totalBadge: {
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  totalBadgeText: {
    color: "#06b6d4",
    fontSize: 11,
    fontWeight: "700",
  },
  appTabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  appTabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  appTabBtnActive: {
    borderColor: "#06b6d4",
    backgroundColor: "rgba(6, 182, 212, 0.12)",
  },
  appTabBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
  },
  appTabBtnTextActive: {
    color: "#06b6d4",
  },
  appTabBtnTextActivePast: {
    color: "#10b981",
  },
  appointmentsList: {
    gap: 12,
  },
  appointmentCard: {
    backgroundColor: "#161b22",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  appClientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  appAvatarWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  appClientName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  appPetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  appPetText: {
    fontSize: 11,
    color: "#94a3b8",
  },
  appModeBadge: {
    backgroundColor: "#0d1117",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  appModeText: {
    fontSize: 11,
    color: "#06b6d4",
    fontWeight: "600",
  },
  appTimeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0d1117",
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  appTimeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#06b6d4",
  },
  appContactBox: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    paddingHorizontal: 2,
  },
  appContactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  appContactText: {
    fontSize: 11,
    color: "#64748b",
  },
  appNotesBox: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  appNotesText: {
    fontSize: 11,
    color: "#94a3b8",
    flex: 1,
    lineHeight: 15,
  },
  appActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  appMessageBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#06b6d4",
    paddingVertical: 8,
    borderRadius: 10,
  },
  appMessageText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  appDeleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  appDeleteText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyAppointmentsBox: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#161b22",
    borderRadius: 12,
  },
  emptyAppTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  emptyAppSub: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#0d1117",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10b981",
    borderRadius: 14,
    paddingVertical: 14,
  },
  bookBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
});
