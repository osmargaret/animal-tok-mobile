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

export default function MarketplaceScreen() {
  const [activeTab, setActiveTab] = useState<"products" | "services">("products");
  const [displayProducts, setDisplayProducts] = useState<ProductItem[]>(marketProducts);
  const [displayServices, setDisplayServices] = useState<ServiceItem[]>(marketServices);
  
  const router = useRouter();
  const { user } = useAuth();
  
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

  return (
    <SafeAreaView style={styles.container}>
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
                style={[styles.card, { width: cardWidth }]} 
                onPress={() => router.push({ pathname: '/product/[id]', params: item as any })}
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.image }} style={styles.cardImg} />
                <View style={styles.ratingBadge}>
                  <Star size={12} color="#f59e0b" fill="#f59e0b" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.categoryLabel}>{item.category}</Text>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.sellerName}>{item.seller}</Text>

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
          <View style={styles.servicesList}>
            {displayServices.map((serv) => (
              <TouchableOpacity 
                key={serv.id} 
                style={styles.serviceCard}
                onPress={() => router.push({ pathname: '/service/[id]', params: serv as any })}
                activeOpacity={0.8}
              >
                <Image source={{ uri: serv.image }} style={styles.serviceImg} />
                <View style={styles.serviceBody}>
                  <View style={styles.serviceHeader}>
                    <Text style={styles.serviceTitle}>{serv.name}</Text>
                    <View style={styles.ratingBadgeInline}>
                      <Star size={12} color="#f59e0b" fill="#f59e0b" />
                      <Text style={styles.ratingText}>{serv.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.providerName}>{serv.provider}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>{serv.price}</Text>
                    <View style={styles.buyBtn}>
                      <Text style={styles.buyBtnText}>Details</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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
    marginBottom: 16,
  },
  pageTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#06b6d4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
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
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: "#06b6d4",
  },
  toggleText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#ffffff",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    backgroundColor: "#161b22",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1e293b",
    position: "relative",
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
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  sellerName: {
    color: "#64748b",
    fontSize: 11,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  buyBtn: {
    backgroundColor: "#06b6d4",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  buyBtnText: {
    color: "#ffffff",
    fontSize: 12,
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
