import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  Image,
} from "react-native";
import { Calendar, MapPin, Users, Check, ArrowLeft } from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import GuestAuthModal from "@/components/GuestAuthModal";
import EventDetailModal, { type EventDetailItem } from "@/components/EventDetailModal";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";

const FALLBACK_EVENTS = [
  {
    id: "e1",
    title: "Austin Golden Retriever Playday 🎾",
    date: "Saturday, Sep 12 • 10:00 AM",
    location: "Zilker Park, Austin TX",
    attendees: 48,
    category: "Meetup",
    description: "Calling all Goldens and friendly pups! Free tennis balls, doggy snacks, and water stations provided.",
  },
  {
    id: "e2",
    title: "Clear the Shelters Adoption Drive 🏠",
    date: "Sunday, Sep 20 • 11:00 AM",
    location: "Central Humane Society",
    attendees: 124,
    category: "Adoption",
    description: "Meet adorable rescue dogs and cats looking for their forever home. Adoption fee waivers available!",
  },
  {
    id: "e3",
    title: "Annual Pet Costume Contest 🎃",
    date: "Saturday, Oct 24 • 2:00 PM",
    location: "Town Lake Amphitheater",
    attendees: 92,
    category: "Contest",
    description: "Show off your pet's best creative outfit! Prizes for Cutest, Funniest, and Best Group Costume.",
  },
];

export default function EventsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [eventsList, setEventsList] = useState(FALLBACK_EVENTS);
  const [rsvps, setRsvps] = useState<Record<string, boolean>>({});
  const [selectedEventDetail, setSelectedEventDetail] = useState<EventDetailItem | null>(null);
  const [guestAuthVisible, setGuestAuthVisible] = useState(false);
  const [guestAuthTitle, setGuestAuthTitle] = useState("View Pet Event 🎪");
  const [guestAuthSubtitle, setGuestAuthSubtitle] = useState("");

  const loadEvents = React.useCallback(async () => {
    try {
      let combined: any[] = [];
      const data = await api.getEvents();
      if (Array.isArray(data) && data.length > 0) {
        combined = [...data];
      } else {
        combined = [...FALLBACK_EVENTS];
      }

      try {
        const stored = await AsyncStorage.getItem("animaltok_custom_events");
        if (stored) {
          const custom = JSON.parse(stored);
          if (Array.isArray(custom)) {
            custom.forEach((ce: any) => {
              if (!combined.some((e) => String(e.id) === String(ce.id))) {
                combined.unshift(ce);
              }
            });
          }
        }
      } catch (e) {}

      setEventsList(combined);
      const initialRsvps: Record<string, boolean> = {};
      combined.forEach((e: any) => {
        if (e.isAttending) initialRsvps[e.id] = true;
      });
      setRsvps(initialRsvps);
    } catch (e) {
      console.warn("Failed to load live events:", e);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const handleEventPress = (item: any) => {
    if (!user) {
      setGuestAuthTitle("View Pet Event 🎪");
      setGuestAuthSubtitle("Create a free account to view full event details, see attendees, and RSVP!");
      setGuestAuthVisible(true);
      return;
    }
    setSelectedEventDetail({
      id: item.id,
      title: item.title,
      date: item.date,
      location: item.location,
      attendees: item.attendees || 0,
      category: item.category,
      categoryLabel: item.category,
      description: item.description,
      image: item.image,
      isPaid: item.isPaid,
      ticketPrice: item.ticketPrice,
      organizerName: item.organizerName,
    });
  };

  const handleRsvpPress = (id: string, title: string) => {
    if (!user) {
      setGuestAuthTitle("RSVP for Pet Event 🎪");
      setGuestAuthSubtitle("Create a free account to join this event and connect with pet parents!");
      setGuestAuthVisible(true);
      return;
    }
    toggleRsvp(id, title);
  };

  const toggleRsvp = async (id: string, title: string) => {
    const isAttending = !!rsvps[id];
    const newStatus = !isAttending;
    setRsvps({ ...rsvps, [id]: newStatus });

    // Update attendee count optimistically
    setEventsList((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              attendees: Math.max(0, e.attendees + (newStatus ? 1 : -1)),
              isAttending: newStatus,
            }
          : e
      )
    );

    if (newStatus) {
      Alert.alert("RSVP Confirmed! 🎉", `You are now registered for "${title}". Added to your Animandler calendar!`);
    }

    // Call backend API
    await api.toggleEventRsvp(id);
  };

  const swipeHandlers = useSwipeGesture({
    enabled: !guestAuthVisible && !selectedEventDetail,
    onSwipeLeft: () => {
      router.replace("/(tabs)/marketplace");
    },
    onSwipeRight: () => {
      router.replace("/(tabs)/explore");
    },
  });

  return (
    <SafeAreaView style={styles.container} {...swipeHandlers}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBox}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8 }}>
            <ArrowLeft size={28} color="#ffffff" />
          </TouchableOpacity>
          <Calendar size={28} color="#06b6d4" />
          <View>
            <Text style={styles.headerTitle}>Local Pet Events & Meetups</Text>
            <Text style={styles.headerSub}>Connect with pet parents in your community</Text>
          </View>
        </View>

        <View style={styles.eventsGrid}>
          {eventsList.map((item: any) => {
            const isAttending = !!rsvps[item.id];
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.eventCard}
                activeOpacity={0.85}
                onPress={() => handleEventPress(item)}
              >
                <View style={styles.eventImageWrap}>
                  <Image
                    source={{
                      uri:
                        item.image ||
                        "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&fit=crop",
                    }}
                    style={styles.eventImage}
                    resizeMode="cover"
                  />
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                  {isAttending && (
                    <View style={styles.goingPill}>
                      <Check size={10} color="#ffffff" />
                      <Text style={styles.goingPillText}>Going</Text>
                    </View>
                  )}
                </View>

                <View style={styles.eventBody}>
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.infoText} numberOfLines={1}>
                    {item.date}
                  </Text>
                  <View style={styles.cardFooterRow}>
                    <View style={styles.attendeesRow}>
                      <Users size={12} color="#06b6d4" />
                      <Text style={styles.attendeesText}>{item.attendees} going</Text>
                    </View>
                    <Text style={styles.detailsLinkText}>Details</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Event Detail Modal */}
      <EventDetailModal
        visible={!!selectedEventDetail}
        event={selectedEventDetail}
        isAttending={selectedEventDetail ? !!rsvps[selectedEventDetail.id] : false}
        onClose={() => setSelectedEventDetail(null)}
        onToggleAttend={(evt) => {
          handleRsvpPress(evt.id, evt.title);
          setSelectedEventDetail((prev) =>
            prev
              ? {
                  ...prev,
                  attendees: Math.max(0, prev.attendees + (!rsvps[evt.id] ? 1 : -1)),
                }
              : null
          );
        }}
      />

      {/* Guest Authentication Modal */}
      <GuestAuthModal
        visible={guestAuthVisible}
        onClose={() => setGuestAuthVisible(false)}
        title={guestAuthTitle}
        subtitle={guestAuthSubtitle}
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
    padding: 16,
    paddingBottom: 40,
  },
  headerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    marginTop: Platform.OS === "android" ? 36 : 10,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSub: {
    color: "#64748b",
    fontSize: 12,
  },
  eventsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  eventCard: {
    width: "48.2%",
    backgroundColor: "#161b22",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 12,
  },
  eventImageWrap: {
    width: "100%",
    height: 118,
    position: "relative",
    backgroundColor: "#0d1117",
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  categoryBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(13, 17, 23, 0.86)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    color: "#06b6d4",
    fontSize: 10,
    fontWeight: "700",
  },
  goingPill: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#10b981",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  goingPillText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },
  eventBody: {
    padding: 10,
  },
  eventTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  infoText: {
    color: "#94a3b8",
    fontSize: 11,
    marginBottom: 6,
  },
  cardFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  attendeesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  attendeesText: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "600",
  },
  detailsLinkText: {
    color: "#06b6d4",
    fontSize: 11,
    fontWeight: "700",
  },
});
