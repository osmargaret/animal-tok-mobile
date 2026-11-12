import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { Calendar, MapPin, Users, Check, HeartHandshake, ArrowLeft } from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { api } from "@/services/api";

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
  const [eventsList, setEventsList] = useState(FALLBACK_EVENTS);
  const [rsvps, setRsvps] = useState<Record<string, boolean>>({});

  const loadEvents = React.useCallback(async () => {
    try {
      const data = await api.getEvents();
      if (Array.isArray(data) && data.length > 0) {
        setEventsList(data);
        const initialRsvps: Record<string, boolean> = {};
        data.forEach((e: any) => {
          if (e.isAttending) initialRsvps[e.id] = true;
        });
        setRsvps(initialRsvps);
      }
    } catch (e) {
      console.warn("Failed to load live events:", e);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

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
      Alert.alert("RSVP Confirmed! 🎉", `You are now registered for "${title}". Added to your AnimalTok calendar!`);
    }

    // Call backend API
    await api.toggleEventRsvp(id);
  };

  return (
    <SafeAreaView style={styles.container}>
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

        <View style={styles.eventsList}>
          {eventsList.map((item) => {
            const isAttending = !!rsvps[item.id];
            return (
              <View key={item.id} style={styles.eventCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                  <View style={styles.attendeesRow}>
                    <Users size={14} color="#06b6d4" />
                    <Text style={styles.attendeesText}>
                      {item.attendees + (isAttending ? 1 : 0)} attending
                    </Text>
                  </View>
                </View>

                <Text style={styles.eventTitle}>{item.title}</Text>

                <View style={styles.infoRow}>
                  <Calendar size={14} color="#f59e0b" />
                  <Text style={styles.infoText}>{item.date}</Text>
                </View>

                <View style={styles.infoRow}>
                  <MapPin size={14} color="#ef4444" />
                  <Text style={styles.infoText}>{item.location}</Text>
                </View>

                <Text style={styles.description}>{item.description}</Text>

                <TouchableOpacity
                  style={[styles.rsvpBtn, isAttending && styles.rsvpBtnActive]}
                  onPress={() => toggleRsvp(item.id, item.title)}
                >
                  {isAttending ? <Check size={16} color="#ffffff" /> : <HeartHandshake size={16} color="#ffffff" />}
                  <Text style={styles.rsvpBtnText}>
                    {isAttending ? "I'm Attending ✓" : "RSVP / Join Event"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
    marginTop: 10,
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
  eventsList: {
    gap: 16,
  },
  eventCard: {
    backgroundColor: "#161b22",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryText: {
    color: "#06b6d4",
    fontSize: 12,
    fontWeight: "bold",
  },
  attendeesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  attendeesText: {
    color: "#94a3b8",
    fontSize: 12,
  },
  eventTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    color: "#cbd5e1",
    fontSize: 13,
  },
  description: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 12,
  },
  rsvpBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#06b6d4",
    height: 44,
    borderRadius: 22,
  },
  rsvpBtnActive: {
    backgroundColor: "#10b981",
  },
  rsvpBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
