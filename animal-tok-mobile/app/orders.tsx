import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import {
  ArrowLeft,
  ShoppingBag,
  Truck,
  MapPin,
  CheckCircle,
  Clock,
  Calendar,
  Package,
  Trash2,
  ChevronRight,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Order {
  id: string;
  productId?: string;
  productName: string;
  seller: string;
  image?: string;
  type?: string;
  size?: string;
  color?: string;
  quantity: number;
  fulfillment: "delivery" | "pickup";
  deliveryAddress?: string;
  pickupLocation?: string;
  pickupTime?: string;
  buyerName?: string;
  buyerPhone?: string;
  total: string;
  status: "confirmed" | "pending" | "delivered" | "cancelled";
  createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  confirmed: "#06b6d4",
  pending: "#f59e0b",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem("animaltok_product_orders");
      const list: Order[] = raw ? JSON.parse(raw) : [];
      setOrders(Array.isArray(list) ? list : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const handleDelete = (orderId: string) => {
    const doDelete = async () => {
      const updated = orders.filter((o) => o.id !== orderId);
      setOrders(updated);
      await AsyncStorage.setItem("animaltok_product_orders", JSON.stringify(updated));
    };

    if (Platform.OS === "web") {
      if (window.confirm("Remove this order from your history?")) doDelete();
    } else {
      Alert.alert("Remove Order", "Remove this order from your history?", [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: doDelete },
      ]);
    }
  };

  const handleClearAll = () => {
    const doAll = async () => {
      setOrders([]);
      await AsyncStorage.removeItem("animaltok_product_orders");
    };
    if (Platform.OS === "web") {
      if (window.confirm("Clear all order history? This cannot be undone.")) doAll();
    } else {
      Alert.alert("Clear All Orders", "Clear all order history? This cannot be undone.", [
        { text: "Cancel", style: "cancel" },
        { text: "Clear All", style: "destructive", onPress: doAll },
      ]);
    }
  };

  const topInset = Math.max(
    insets.top,
    Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 8 : 0
  );

  const renderItem = ({ item }: { item: Order }) => {
    const statusColor = STATUS_COLOR[item.status] || "#94a3b8";
    const statusLabel = STATUS_LABEL[item.status] || item.status;
    const isDelivery = item.fulfillment === "delivery";

    return (
      <View style={styles.orderCard}>
        {/* Top Row: Image + Info */}
        <View style={styles.cardTopRow}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.productThumb} resizeMode="cover" />
          ) : (
            <View style={[styles.productThumb, styles.productThumbPlaceholder]}>
              <Package size={24} color="#64748b" />
            </View>
          )}

          <View style={styles.orderInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.productName}
            </Text>
            <Text style={styles.sellerText}>By {item.seller}</Text>

            {/* Variant summary row */}
            {(item.type || item.size || item.color) && (
              <Text style={styles.variantText} numberOfLines={1}>
                {[item.type, item.size, item.color].filter(Boolean).join(" · ")}
              </Text>
            )}

            <View style={styles.qtyPriceRow}>
              <Text style={styles.qtyText}>Qty: {item.quantity}</Text>
              <Text style={styles.orderTotal}>{item.total ? `$${item.total}` : "—"}</Text>
            </View>
          </View>
        </View>

        {/* Status + Date bar */}
        <View style={styles.statusBar}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          <Text style={styles.orderDate}>  ·  {formatDate(item.createdAt)}</Text>
        </View>

        {/* Fulfillment Row */}
        <View style={styles.fulfillmentRow}>
          {isDelivery ? (
            <>
              <Truck size={13} color="#94a3b8" />
              <Text style={styles.fulfillmentText} numberOfLines={1}>
                Delivery → {item.deliveryAddress || "Address not provided"}
              </Text>
            </>
          ) : (
            <>
              <MapPin size={13} color="#94a3b8" />
              <Text style={styles.fulfillmentText} numberOfLines={1}>
                Pick up · {item.pickupTime || "Time TBD"}
              </Text>
            </>
          )}
        </View>

        {/* Order ID + Delete */}
        <View style={styles.cardFooter}>
          <Text style={styles.orderIdText}>#{item.id}</Text>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.deleteBtn}
            activeOpacity={0.75}
          >
            <Trash2 size={14} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: topInset }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1117" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSub}>
            {orders.length === 0 ? "No orders yet" : `${orders.length} order${orders.length !== 1 ? "s" : ""}`}
          </Text>
        </View>
        {orders.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Body */}
      {loading ? (
        <View style={styles.centeredBox}>
          <ActivityIndicator size="large" color="#06b6d4" />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centeredBox}>
          <ShoppingBag size={56} color="#1e293b" />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySub}>
            Browse the marketplace and buy products — your order history will appear here.
          </Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.push("/(tabs)/explore")}>
            <ChevronRight size={16} color="#ffffff" />
            <Text style={styles.browseBtnText}>Browse Marketplace</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#161b22",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  headerSub: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 1,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  clearBtnText: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "600",
  },
  listContent: {
    padding: 14,
  },
  orderCard: {
    backgroundColor: "#161b22",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cardTopRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  productThumb: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: "#0d1117",
  },
  productThumbPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  orderInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: 19,
  },
  sellerText: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  variantText: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 3,
  },
  qtyPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  qtyText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: "800",
    color: "#06b6d4",
  },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  orderDate: {
    fontSize: 12,
    color: "#64748b",
  },
  fulfillmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#0d1117",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  fulfillmentText: {
    fontSize: 12,
    color: "#94a3b8",
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderIdText: {
    fontSize: 11,
    color: "#475569",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  deleteBtn: {
    padding: 4,
  },
  centeredBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 16,
  },
  emptySub: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  browseBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#06b6d4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 20,
  },
  browseBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});

