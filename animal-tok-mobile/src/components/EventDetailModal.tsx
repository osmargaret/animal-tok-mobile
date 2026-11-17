import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import {
  X,
  Calendar,
  MapPin,
  Users,
  Ticket,
  Check,
  ShieldCheck,
} from "lucide-react-native";

export interface EventDetailItem {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  category?: string;
  categoryLabel?: string;
  petType?: string;
  description: string;
  image?: string;
  isPaid?: boolean;
  ticketPrice?: string;
  capacity?: number;
  organizerName?: string;
}

interface EventDetailModalProps {
  visible: boolean;
  event: EventDetailItem | null;
  isAttending: boolean;
  hasPurchasedTicket?: boolean;
  onClose: () => void;
  onToggleAttend: (event: EventDetailItem) => void;
}

export default function EventDetailModal({
  visible,
  event,
  isAttending,
  hasPurchasedTicket = false,
  onClose,
  onToggleAttend,
}: EventDetailModalProps) {
  if (!event) return null;

  const isGoing = isAttending || hasPurchasedTicket;
  const isPaid = Boolean(event.isPaid);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Banner Image */}
          <View style={styles.imageWrap}>
            <Image
              source={{
                uri:
                  event.image ||
                  "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&fit=crop",
              }}
              style={styles.bannerImg}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <X size={18} color="#ffffff" />
            </TouchableOpacity>
            <View style={[styles.pricePill, isPaid && styles.pricePillPaid]}>
              <Text style={[styles.pricePillText, isPaid && styles.pricePillTextPaid]}>
                {isPaid ? `Ticket • ${event.ticketPrice}` : "Free Admission"}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Badges Row */}
            <View style={styles.badgesRow}>
              <View style={styles.catBadge}>
                <Text style={styles.catBadgeText}>
                  {event.categoryLabel || event.category || "Pet Event"}
                </Text>
              </View>
              {event.petType && (
                <View style={styles.petBadge}>
                  <Text style={styles.petBadgeText}>
                    {event.petType === "all"
                      ? "🐾 All Pets"
                      : `🐾 ${event.petType.charAt(0).toUpperCase() + event.petType.slice(1)}s`}
                  </Text>
                </View>
              )}
              {isGoing && (
                <View style={styles.goingBadge}>
                  <Check size={11} color="#10b981" />
                  <Text style={styles.goingBadgeText}>Attending</Text>
                </View>
              )}
            </View>

            <Text style={styles.title}>{event.title}</Text>

            {event.organizerName ? (
              <View style={styles.metaRow}>
                <ShieldCheck size={14} color="#06b6d4" />
                <Text style={styles.metaText}>Hosted by {event.organizerName}</Text>
              </View>
            ) : null}

            <View style={styles.metaRow}>
              <Calendar size={14} color="#f59e0b" />
              <Text style={styles.metaText}>{event.date}</Text>
            </View>

            <View style={styles.metaRow}>
              <MapPin size={14} color="#06b6d4" />
              <Text style={styles.metaText}>{event.location}</Text>
            </View>

            <View style={styles.metaRow}>
              <Users size={14} color="#2dd4bf" />
              <Text style={styles.metaText}>
                {event.attendees} attending
                {event.capacity ? ` • ${event.capacity} spots max` : ""}
              </Text>
            </View>

            <View style={styles.descBox}>
              <Text style={styles.descLabel}>About This Event</Text>
              <Text style={styles.descText}>{event.description}</Text>
            </View>
          </ScrollView>

          {/* Footer Attendance Decision Buttons */}
          <View style={styles.footer}>
            {isGoing ? (
              <>
                <TouchableOpacity
                  style={styles.notGoingBtn}
                  onPress={() => onToggleAttend(event)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.notGoingText}>Cancel Attendance</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.attendingDoneBtn} onPress={onClose} activeOpacity={0.85}>
                  <Check size={16} color="#ffffff" />
                  <Text style={styles.attendBtnText}>I'm Attending ✓</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.notGoingBtn} onPress={onClose} activeOpacity={0.8}>
                  <Text style={styles.notGoingText}>Not Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.attendBtn}
                  onPress={() => onToggleAttend(event)}
                  activeOpacity={0.85}
                >
                  {isPaid ? <Ticket size={16} color="#ffffff" /> : <Check size={16} color="#ffffff" />}
                  <Text style={styles.attendBtnText}>
                    {isPaid ? `Attend • ${event.ticketPrice}` : "Yes, I'm Attending"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.78)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#161b22",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
    maxHeight: "88%",
    overflow: "hidden",
  },
  imageWrap: {
    width: "100%",
    height: 185,
    position: "relative",
    backgroundColor: "#0d1117",
  },
  bannerImg: {
    width: "100%",
    height: "100%",
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(13, 17, 23, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  pricePill: {
    position: "absolute",
    bottom: 12,
    left: 14,
    backgroundColor: "rgba(13, 17, 23, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.5)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pricePillPaid: {
    borderColor: "rgba(245, 158, 11, 0.55)",
  },
  pricePillText: {
    color: "#06b6d4",
    fontSize: 11.5,
    fontWeight: "700",
  },
  pricePillTextPaid: {
    color: "#f59e0b",
  },
  body: {
    padding: 18,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  catBadge: {
    backgroundColor: "rgba(6, 182, 212, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.35)",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  catBadgeText: {
    color: "#06b6d4",
    fontSize: 11,
    fontWeight: "700",
  },
  petBadge: {
    backgroundColor: "#21262d",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  petBadgeText: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "600",
  },
  goingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.4)",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  goingBadgeText: {
    color: "#10b981",
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 25,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  metaText: {
    color: "#cbd5e1",
    fontSize: 13,
    flex: 1,
  },
  descBox: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    marginBottom: 16,
  },
  descLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  descText: {
    color: "#e2e8f0",
    fontSize: 13.5,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    backgroundColor: "#0d1117",
  },
  notGoingBtn: {
    flex: 1,
    backgroundColor: "#21262d",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  notGoingText: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "700",
  },
  attendBtn: {
    flex: 1.5,
    backgroundColor: "#06b6d4",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  attendingDoneBtn: {
    flex: 1.5,
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  attendBtnText: {
    color: "#ffffff",
    fontSize: 13.5,
    fontWeight: "800",
  },
});
