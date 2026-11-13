import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Linking,
  Alert,
} from "react-native";
import {
  X,
  Calendar,
  Phone,
  Mail,
  User,
  PawPrint,
  Clock,
  MessageCircle,
  Building,
  Video as VideoIcon,
  CheckCircle,
  Trash2,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ServiceBookingItem } from "./BookServiceModal";

interface ServiceBookingsListModalProps {
  visible: boolean;
  onClose: () => void;
  serviceId?: string; // Optional filter for a specific service
}

export default function ServiceBookingsListModal({
  visible,
  onClose,
  serviceId,
}: ServiceBookingsListModalProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState<ServiceBookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem("animaltok_service_bookings");
      if (stored) {
        let list: ServiceBookingItem[] = JSON.parse(stored);
        if (Array.isArray(list)) {
          if (serviceId) {
            list = list.filter((b) => b.serviceId === serviceId);
          }
          setBookings(list);
        } else {
          setBookings([]);
        }
      } else {
        // Sample starter demo bookings if empty
        const sampleList: ServiceBookingItem[] = [
          {
            id: "BK-482019",
            serviceId: "s1",
            serviceName: "Mobile Spa & Grooming",
            providerName: "Bark & Shine Spa",
            providerId: "u_1",
            clientName: "Jessica Hayes",
            clientPhone: "+1 (512) 555-8931",
            clientEmail: "jessica@example.com",
            appointmentDate: "Tomorrow at 10:00 AM",
            mode: "onsite",
            petInfo: "Cooper (Golden Retriever, 3 yrs)",
            notes: "He gets a little nervous around blow dryers, please be gentle!",
            price: "$50.00",
            status: "confirmed",
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          },
          {
            id: "BK-719342",
            serviceId: "s2",
            serviceName: "Positive Puppy Training 101",
            providerName: "Canine Academy",
            providerId: "u_1",
            clientName: "Marcus Sterling",
            clientPhone: "+1 (512) 555-4012",
            clientEmail: "marcus@example.com",
            appointmentDate: "Saturday at 2:30 PM",
            mode: "virtual",
            petInfo: "Daisy (Labradoodle puppy, 4 months)",
            notes: "Need help with biting and crate whining at night.",
            price: "$80.00",
            status: "confirmed",
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          },
        ];
        setBookings(sampleList);
        await AsyncStorage.setItem("animaltok_service_bookings", JSON.stringify(sampleList));
      }
    } catch (e) {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadBookings();
    }
  }, [visible, serviceId]);

  const handleDeleteBooking = (id: string) => {
    Alert.alert(
      "Remove Booking",
      "Are you sure you want to remove this booking from your list?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const filtered = bookings.filter((b) => b.id !== id);
            setBookings(filtered);
            await AsyncStorage.setItem("animaltok_service_bookings", JSON.stringify(filtered));
          },
        },
      ]
    );
  };

  const handleCallClient = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert("Contact", `Call ${phone}`);
    });
  };

  const handleMessageClient = (booking: ServiceBookingItem) => {
    onClose();
    const threadId = `t_booking_${booking.id}_${booking.clientName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    router.push({
      pathname: "/(tabs)/message/[id]",
      params: {
        id: threadId,
        recipientId: "client",
        name: booking.clientName,
        avatar: "👤",
        initialMessage: `Hi ${booking.clientName}, I am contacting you regarding your booking for "${booking.serviceName}" on ${booking.appointmentDate}!`,
      },
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Calendar size={18} color="#06b6d4" />
            <Text style={styles.headerTitle}>Client Bookings</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{bookings.length}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
            <X size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📅</Text>
            <Text style={styles.emptyTitle}>No Bookings Yet</Text>
            <Text style={styles.emptySub}>
              When pet parents book your services, their appointment requests and contact details will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.bookingCard}>
                {/* Top Info */}
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.serviceTitle}>{item.serviceName}</Text>
                    <Text style={styles.refText}>Pass #{item.id}</Text>
                  </View>
                  <View style={styles.statusPill}>
                    <CheckCircle size={12} color="#10b981" />
                    <Text style={styles.statusText}>Confirmed</Text>
                  </View>
                </View>

                {/* Details */}
                <View style={styles.cardBody}>
                  <View style={styles.detailRow}>
                    <User size={13} color="#06b6d4" />
                    <Text style={styles.clientName}>{item.clientName}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Calendar size={13} color="#06b6d4" />
                    <Text style={styles.detailText}>{item.appointmentDate}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    {item.mode === "virtual" ? (
                      <VideoIcon size={13} color="#06b6d4" />
                    ) : (
                      <Building size={13} color="#06b6d4" />
                    )}
                    <Text style={styles.detailText}>
                      Mode: {item.mode === "virtual" ? "Virtual Consult" : "Onsite Session"}
                    </Text>
                  </View>

                  {item.petInfo ? (
                    <View style={styles.detailRow}>
                      <PawPrint size={13} color="#ec4899" />
                      <Text style={styles.detailText}>Pet: {item.petInfo}</Text>
                    </View>
                  ) : null}

                  {item.notes ? (
                    <View style={styles.notesBox}>
                      <Text style={styles.notesText}>"{item.notes}"</Text>
                    </View>
                  ) : null}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionBtnCall}
                    onPress={() => handleCallClient(item.clientPhone)}
                    activeOpacity={0.8}
                  >
                    <Phone size={13} color="#ffffff" />
                    <Text style={styles.actionBtnText}>Call ({item.clientPhone})</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnMsg}
                    onPress={() => handleMessageClient(item)}
                    activeOpacity={0.8}
                  >
                    <MessageCircle size={13} color="#ffffff" />
                    <Text style={styles.actionBtnText}>Chat</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteBooking(item.id)}
                    activeOpacity={0.8}
                  >
                    <Trash2 size={14} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
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
  badge: {
    backgroundColor: "#06b6d4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  bookingCard: {
    backgroundColor: "#161b22",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  serviceTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  refText: {
    color: "#64748b",
    fontSize: 11,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    color: "#10b981",
    fontSize: 11,
    fontWeight: "700",
  },
  cardBody: {
    backgroundColor: "#0d1117",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 5,
  },
  clientName: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  detailText: {
    color: "#cbd5e1",
    fontSize: 12.5,
  },
  notesBox: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
  notesText: {
    color: "#94a3b8",
    fontSize: 12,
    fontStyle: "italic",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtnCall: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#06b6d4",
    paddingVertical: 9,
    borderRadius: 10,
  },
  actionBtnMsg: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#1e293b",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  actionBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySub: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});

