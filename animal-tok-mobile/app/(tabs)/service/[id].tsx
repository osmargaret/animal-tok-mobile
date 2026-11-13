import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star, Calendar, MessageCircle, Clock, ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import CheckoutModal from '@/components/CheckoutModal.native';

export default function ServiceDetailsModal() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [bookingVisible, setBookingVisible] = useState(false);

  // Parse params
  const { id, name, price, rating, provider, image } = params as Record<string, string>;

  const handleBook = () => {
    if (!user) {
      router.push({ pathname: "/auth", params: { mode: "signup" } });
      return;
    }
    setBookingVisible(true);
  };

  const handleMessage = () => {
    if (!user) {
      router.push({ pathname: "/auth", params: { mode: "signup" } });
      return;
    }
    const currentUserId = user.id;
    router.push({
      pathname: "/(tabs)/message/[id]",
      params: {
        id: `booking_${(provider || "provider").toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        name: `${provider} (Pet Service)`,
        recipientId: id,
        avatar: "✂️",
        itemTitle: name,
        itemPrice: price,
        itemType: "service",
        itemImage: image,
        initialMessage: `Hello! I would like to book your "${name}" service (${price}). What are your available dates and times?`,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ChevronLeft size={28} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.ratingBadge}>
            <Star size={14} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.category}>Professional Service</Text>
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.provider}>By {provider}</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{price}</Text>
            <View style={styles.availabilityBadge}>
              <Clock size={14} color="#10b981" />
              <Text style={styles.availabilityText}>Available this week</Text>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About this Service</Text>
            <Text style={styles.descriptionText}>
              Top-tier {name.toLowerCase()} provided by experienced professionals. 
              We ensure the utmost care and attention for your pet, tailoring the experience to their specific needs.
              Satisfaction guaranteed!
            </Text>
          </View>
          
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Provider Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Business</Text>
              <Text style={styles.detailValue}>{provider}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Experience</Text>
              <Text style={styles.detailValue}>5+ Years</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>Comes to you</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.msgBtn} onPress={handleMessage}>
          <MessageCircle size={20} color="#06b6d4" />
          <Text style={styles.msgBtnText}>Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
          <Calendar size={20} color="#ffffff" />
          <Text style={styles.bookBtnText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>

      <CheckoutModal
        visible={bookingVisible}
        onClose={() => setBookingVisible(false)}
        item={{
          id: id || "srv_1",
          name: name || "Pet Service",
          price: price || "$45/session",
          sellerOrProvider: provider || "Top Rated Pro",
          image,
          type: "service",
        }}
        userEmail={user?.email}
        userName={user?.name}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  scrollContent: {
    paddingBottom: 100, // Space for footer
  },
  imageContainer: {
    width: '100%',
    height: 350,
    position: 'relative',
    backgroundColor: '#161b22',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: "absolute",
    top: 45,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 17, 23, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  ratingText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  category: {
    color: '#8b5cf6',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 30,
  },
  provider: {
    color: '#64748b',
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  price: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  availabilityText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  descriptionText: {
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
  },
  detailsSection: {
    backgroundColor: '#161b22',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 41, 59, 0.5)',
  },
  detailLabel: {
    color: '#64748b',
    fontSize: 14,
  },
  detailValue: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: 'rgba(13, 17, 23, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  msgBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: '#06b6d4',
    paddingVertical: 14,
    borderRadius: 12,
  },
  msgBtnText: {
    color: '#06b6d4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8b5cf6', // Different color for services
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
