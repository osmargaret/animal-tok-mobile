import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star, ShoppingCart, CreditCard, ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import CheckoutModal from '@/components/CheckoutModal.native';

export default function ProductDetailsModal() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  // Parse params
  const { id, name, price, rating, seller, image, category } = params as Record<string, string>;

  const handleBuy = () => {
    setCheckoutVisible(true);
  };

  const handleAddToCart = () => {
    Alert.alert("Added to Cart 🛒", `${name} has been added to your cart.`);
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
            <Text style={styles.category}>{category}</Text>
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.seller}>By {seller}</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{price}</Text>
            <Text style={styles.stockStatus}>In Stock</Text>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              Spoil your furry friend with this premium quality {name.toLowerCase()}. 
              Sourced from the best materials and highly recommended by pet owners globally. 
              Perfect for keeping your pet happy and healthy!
            </Text>
          </View>
          
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Brand</Text>
              <Text style={styles.detailValue}>{seller}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Condition</Text>
              <Text style={styles.detailValue}>New</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Shipping</Text>
              <Text style={styles.detailValue}>Free Shipping</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
          <ShoppingCart size={20} color="#06b6d4" />
          <Text style={styles.cartBtnText}>Add to Cart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.buyBtn} onPress={handleBuy}>
          <CreditCard size={20} color="#ffffff" />
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      <CheckoutModal
        visible={checkoutVisible}
        onClose={() => setCheckoutVisible(false)}
        item={{
          id: id || "prod_1",
          name: name || "Pet Product",
          price: price || "$19.99",
          sellerOrProvider: seller || "Verified Seller",
          image,
          type: "product",
          category,
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
    color: '#06b6d4',
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
  seller: {
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
  stockStatus: {
    color: '#10b981',
    fontSize: 14,
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
    paddingBottom: 24, // extra padding for safe area on real devices
    backgroundColor: 'rgba(13, 17, 23, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  cartBtn: {
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
  cartBtnText: {
    color: '#06b6d4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#06b6d4',
    paddingVertical: 14,
    borderRadius: 12,
  },
  buyBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
