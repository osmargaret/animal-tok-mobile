import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
import { ShoppingBag, Wrench, Star, Plus, ChevronRight } from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { marketProducts, marketServices, type ProductItem, type ServiceItem } from "@/data/marketData";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import GuestAuthModal from "@/components/GuestAuthModal";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";

export default function MarketplaceScreen() {
  const [activeTab, setActiveTab] = useState<"products" | "services">("products");
  const [displayProducts, setDisplayProducts] = useState<ProductItem[]>(marketProducts);
  const [displayServices, setDisplayServices] = useState<ServiceItem[]>(marketServices);
  
  const router = useRouter();
  const { user } = useAuth();
  const [guestAuthVisible, setGuestAuthVisible] = useState(false);
  const [guestAuthTitle, setGuestAuthTitle] = useState("Join Animandler 🐾");
  const [guestAuthSubtitle, setGuestAuthSubtitle] = useState("");

  const handleProductPress = (item: ProductItem) => {
    if (!user) {
      setGuestAuthTitle("View Pet Product 🛍️");
      setGuestAuthSubtitle("Create a free account to view full product details, prices, seller ratings, and order pet essentials!");
      setGuestAuthVisible(true);
      return;
    }
    router.push({ pathname: '/product/[id]', params: item as any });
  };

  const handleServicePress = (serv: ServiceItem) => {
    if (!user) {
      setGuestAuthTitle("View Pet Care Service 🩺");
      setGuestAuthSubtitle("Create a free account to view certified provider details, rates, reviews, and book appointments!");
      setGuestAuthVisible(true);
      return;
    }
    router.push({ pathname: '/service/[id]', params: serv as any });
  };
  
  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = Math.min(windowWidth, 480);
  const cardWidth = (containerWidth - 44) / 2;

  const loadMarketplace = React.useCallback(async () => {
    try {
      const [backendProducts, backendServices] = await Promise.all([
        api.getMarketplaceProducts(),
        api.getMarketplaceServices(),
      ]);
      if (backendProducts && backendProducts.length > 0) {
        setDisplayProducts(backendProducts);
      }
      if (backendServices && backendServices.length > 0) {
        setDisplayServices(backendServices);
      }
    } catch (e) {
      console.warn("Failed to load live marketplace:", e);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadMarketplace();
    }, [loadMarketplace])
  );

  const handleSwipeLeft = () => {
    if (activeTab === "products") {
      setActiveTab("services");
    }
  };

  const handleSwipeRight = () => {
    if (activeTab === "services") {
      setActiveTab("products");
    } else {
      router.back();
    }
  };

  const swipeHandlers = useSwipeGesture({
    enabled: !guestAuthVisible,
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
  });

  return (
    <SafeAreaView style={styles.container} {...swipeHandlers}>
      <View style={styles.stickyHeader}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.pageTitle}>Pet Marketplace</Text>
          {user?.accountType === "business" && (
            <TouchableOpacity style={styles.addBtn} onPress={() => router.push("/add-product")}>
              <Plus size={16} color="#ffffff" />
              <Text style={styles.addBtnText}>List Item</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Toggle */}
        <View style={styles.tabToggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === "products" && styles.toggleBtnActive]}
            onPress={() => setActiveTab("products")}
          >
            <ShoppingBag size={16} color={activeTab === "products" ? "#ffffff" : "#94a3b8"} />
            <Text style={[styles.toggleText, activeTab === "products" && styles.toggleTextActive]}>
              Products
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === "services" && styles.toggleBtnActive]}
            onPress={() => setActiveTab("services")}
          >
            <Wrench size={16} color={activeTab === "services" ? "#ffffff" : "#94a3b8"} />
            <Text style={[styles.toggleText, activeTab === "services" && styles.toggleTextActive]}>
              Services & Grooming
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Content based on Active Tab */}
        {activeTab === "products" ? (
          <View style={styles.grid}>
            {displayProducts.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => handleProductPress(item)}
                activeOpacity={0.85}
              >
                <Image source={{ uri: item.image }} style={styles.cardImg} />
                <View style={styles.ratingBadge}>
                  <Star size={12} color="#f59e0b" fill="#f59e0b" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.categoryLabel} numberOfLines={1}>{item.category}</Text>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.sellerName} numberOfLines={1}>{item.seller}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>{item.price}</Text>
                    <View style={styles.buyBtn}>
                      <Text style={styles.buyBtnText}>View</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.grid}>
            {displayServices.map((serv) => (
              <TouchableOpacity
                key={serv.id}
                style={styles.card}
                onPress={() => handleServicePress(serv)}
                activeOpacity={0.85}
              >
                <Image source={{ uri: serv.image }} style={styles.cardImg} />
                <View style={styles.ratingBadge}>
                  <Star size={12} color="#f59e0b" fill="#f59e0b" />
                  <Text style={styles.ratingText}>{serv.rating}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.categoryLabel, { color: "#10b981" }]} numberOfLines={1}>
                    {serv.category || "SERVICE"}
                  </Text>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {serv.name}
                  </Text>
                  <Text style={styles.sellerName} numberOfLines={1}>{serv.provider}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>{serv.price}</Text>
                    <View style={[styles.buyBtn, { backgroundColor: "#10b981" }]}>
                      <Text style={styles.buyBtnText}>Book</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

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
  stickyHeader: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 44 : 12,
    paddingBottom: 10,
    backgroundColor: "#0d1117",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    zIndex: 10,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  pageTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#06b6d4",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  addBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  tabToggleRow: {
    flexDirection: "row",
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: "#06b6d4",
  },
  toggleText: {
    color: "#94a3b8",
    fontSize: 11.5,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#ffffff",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48.2%",
    backgroundColor: "#161b22",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1e293b",
    position: "relative",
    marginBottom: 12,
  },
  cardImg: {
    width: "100%",
    height: 130,
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(13, 17, 23, 0.8)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ratingText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  cardBody: {
    padding: 10,
  },
  categoryLabel: {
    color: "#06b6d4",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  sellerName: {
    color: "#64748b",
    fontSize: 10.5,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
  buyBtn: {
    backgroundColor: "#06b6d4",
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 10,
  },
  buyBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  servicesList: {
    gap: 14,
  },
  serviceCard: {
    backgroundColor: "#161b22",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  serviceImg: {
    width: "100%",
    height: 140,
  },
  serviceBody: {
    padding: 14,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  serviceTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  ratingBadgeInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  providerName: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 12,
  },
});
