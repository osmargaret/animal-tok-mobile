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
  Clock,
  Calendar,
  Package,
  Trash2,
  ChevronRight,
  User as UserIcon,
  MessageSquare,
  CheckCircle2,
  Hourglass,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface Order {
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
  buyerEmail?: string;
  buyerAvatar?: string;
  total: string;
  status: "confirmed" | "pending" | "delivered" | "fulfilled" | "cancelled";
  createdAt: string;
  targetDateTime?: string;
}

const DEFAULT_ORDERS: Order[] = [
  {
    id: "ORD-PEND-01",
    productId: "p1",
    productName: "Organic Salmon Treats",
    seller: "Pawsome Gourmet",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&fit=crop",
    type: "Organic",
    size: "1kg",
    color: "Natural",
    quantity: 2,
    fulfillment: "pickup",
    pickupLocation: "Official Pet Hub, Downtown Austin",
    pickupTime: "Tomorrow • 10:00 AM – 12:00 PM",
    buyerName: "Sarah Jenkins",
    buyerPhone: "+1 (512) 555-0199",
    total: "29.98",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ORD-FULF-02",
    productId: "p2",
    productName: "GPS Smart Pet Collar",
    seller: "TechPaws",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&fit=crop",
    type: "Standard",
    size: "Medium",
    color: "Midnight Black",
    quantity: 1,
    fulfillment: "delivery",
    deliveryAddress: "452 Oak Ridge Way, Apt 3B, Austin, TX",
    pickupTime: "Yesterday • 2:00 PM",
    buyerName: "Michael Davis",
    buyerPhone: "+1 (512) 555-0142",
    total: "59.99",
    status: "fulfilled",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

function isDatePassed(order: Order): boolean {
  if (order.status === "delivered" || order.status === "fulfilled") {
    return true;
  }
  if (order.status === "cancelled") {
    return true;
  }

  const now = new Date();

  // If pickup, parse pickup time string or target date
  if (order.fulfillment === "pickup") {
    const timeStr = (order.pickupTime || "").toLowerCase();
    if (timeStr.includes("yesterday") || timeStr.includes("last week") || timeStr.includes("completed")) {
      return true;
    }
    if (timeStr.includes("tomorrow") || timeStr.includes("saturday") || timeStr.includes("sunday")) {
      return false;
    }
    if (timeStr.includes("today")) {
      const eveningCutoff = new Date();
      eveningCutoff.setHours(21, 0, 0, 0);
      return now > eveningCutoff;
    }
    const parsed = new Date(order.pickupTime || "");
    if (!isNaN(parsed.getTime())) {
      return now.getTime() > parsed.getTime();
    }
  } else {
    // Delivery: standard delivery is 2-3 days
    if (order.createdAt) {
      const created = new Date(order.createdAt);
      if (!isNaN(created.getTime())) {
        const deliveryDueDate = new Date(created.getTime() + 2 * 24 * 60 * 60 * 1000);
        return now.getTime() > deliveryDueDate.getTime();
      }
    }
  }

  return false;
}

function formatOrderDate(iso: string) {
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
  const [activeTab, setActiveTab] = useState<"pending" | "fulfilled">("pending");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem("animaltok_product_orders");
      let list: Order[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list) || list.length === 0) {
        list = DEFAULT_ORDERS;
        await AsyncStorage.setItem("animaltok_product_orders", JSON.stringify(DEFAULT_ORDERS));
      }
      setOrders(list);
    } catch {
      setOrders(DEFAULT_ORDERS);
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
      if (typeof window !== "undefined" && window.confirm("Are you sure you want to delete this order?")) {
        doDelete();
      }
    } else {
      Alert.alert("Delete Order", "Are you sure you want to delete this order from records?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: doDelete },
      ]);
    }
  };

  const handleChatUser = (item: Order) => {
    const buyerDisplayName = item.buyerName || "Buyer";
    const threadId = `order_chat_${(buyerDisplayName).toLowerCase().replace(/[^a-z0-9]/g, "_")}_${item.id}`;
    router.push({
      pathname: "/(tabs)/message/[id]",
      params: {
        id: threadId,
        name: buyerDisplayName,
        avatar: item.buyerAvatar || "👤",
        itemTitle: item.productName,
        itemPrice: `$${item.total}`,
        itemType: "product",
        itemImage: item.image,
        initialMessage: `Hi ${buyerDisplayName}, regarding your order #${item.id} for "${item.productName}" (${item.quantity}x • ${item.type || "Standard"})...`,
      },
    });
  };

  // Split into Pending and Fulfilled
  const pendingOrders = orders.filter((o) => !isDatePassed(o));
  const fulfilledOrders = orders.filter((o) => isDatePassed(o));
  const displayedOrders = activeTab === "pending" ? pendingOrders : fulfilledOrders;

  const topInset = Math.max(
    insets.top,
    Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 8 : 0
  );

  const renderItem = ({ item }: { item: Order }) => {
    const isDelivery = item.fulfillment === "delivery";
    const dateDisplay = isDelivery
      ? (item.pickupTime || `Est. Delivery: ${formatOrderDate(item.createdAt)}`)
      : (item.pickupTime || `Pickup scheduled for ${formatOrderDate(item.createdAt)}`);

    return (
      <View style={styles.orderCard}>
        {/* Main Product Row */}
        <View style={styles.cardHeaderRow}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.productThumb} resizeMode="cover" />
          ) : (
            <View style={[styles.productThumb, styles.productThumbPlaceholder]}>
              <Package size={22} color="#64748b" />
            </View>
          )}

          <View style={styles.productInfoCol}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.productName}
            </Text>

            {/* Qty & Type Row */}
            <View style={styles.metaRow}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>Qty: {item.quantity}</Text>
              </View>
              {item.type ? (
                <View style={[styles.metaBadge, styles.typeBadge]}>
                  <Text style={styles.typeBadgeText}>Type: {item.type}</Text>
                </View>
              ) : null}
              {item.size ? (
                <View style={styles.metaBadge}>
                  <Text style={styles.metaBadgeText}>{item.size}</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.totalPriceText}>Total: ${item.total}</Text>
          </View>
        </View>

        {/* User Info Row */}
        <View style={styles.userInfoRow}>
          <View style={styles.userLeftBox}>
            <View style={styles.userAvatarCircle}>
              <UserIcon size={14} color="#06b6d4" />
            </View>
            <View>
              <Text style={styles.userNameText}>{item.buyerName || "Customer"}</Text>
              {item.buyerPhone ? (
                <Text style={styles.userPhoneText}>{item.buyerPhone}</Text>
              ) : null}
            </View>
          </View>

          {/* Fulfillment Badge */}
          <View
            style={[
              styles.fulfillmentBadge,
              isDelivery ? styles.deliveryBadge : styles.pickupBadge,
            ]}
          >
            {isDelivery ? (
              <Truck size={12} color="#06b6d4" />
            ) : (
              <MapPin size={12} color="#10b981" />
            )}
            <Text
              style={[
                styles.fulfillmentText,
                isDelivery ? { color: "#06b6d4" } : { color: "#10b981" },
              ]}
            >
              {isDelivery ? "Delivery" : "Store Pick up"}
            </Text>
          </View>
        </View>

        {/* Date & Time Row */}
        <View style={styles.dateTimeRow}>
          <Clock size={13} color="#94a3b8" />
          <Text style={styles.dateTimeText} numberOfLines={1}>
            {dateDisplay}
          </Text>
        </View>

        {/* Action Row: Message Buyer + Delete Order */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.messageBtn}
            onPress={() => handleChatUser(item)}
            activeOpacity={0.8}
          >
            <MessageSquare size={14} color="#ffffff" />
            <Text style={styles.messageBtnText}>Message Buyer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id)}
            activeOpacity={0.8}
          >
            <Trash2 size={15} color="#ef4444" />
            <Text style={styles.deleteBtnText}>Delete</Text>
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
          <Text style={styles.headerTitle}>Orders Management</Text>
          <Text style={styles.headerSub}>
            {orders.length} total orders recorded
          </Text>
        </View>
      </View>

      {/* Pending & Fulfilled Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "pending" && styles.tabButtonActive]}
          onPress={() => setActiveTab("pending")}
          activeOpacity={0.8}
        >
          <Hourglass size={14} color={activeTab === "pending" ? "#06b6d4" : "#64748b"} />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "pending" && styles.tabButtonTextActive,
            ]}
          >
            Pending Orders ({pendingOrders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "fulfilled" && styles.tabButtonActive]}
          onPress={() => setActiveTab("fulfilled")}
          activeOpacity={0.8}
        >
          <CheckCircle2 size={14} color={activeTab === "fulfilled" ? "#10b981" : "#64748b"} />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "fulfilled" && styles.tabButtonTextActiveFulfilled,
            ]}
          >
            Fulfilled Orders ({fulfilledOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Body List */}
      {loading ? (
        <View style={styles.centeredBox}>
          <ActivityIndicator size="large" color="#06b6d4" />
        </View>
      ) : displayedOrders.length === 0 ? (
        <View style={styles.centeredBox}>
          <ShoppingBag size={52} color="#1e293b" />
          <Text style={styles.emptyTitle}>
            {activeTab === "pending" ? "No Pending Orders" : "No Fulfilled Orders"}
          </Text>
          <Text style={styles.emptySub}>
            {activeTab === "pending"
              ? "All scheduled deliveries and pickups have been fulfilled or completed."
              : "Orders whose delivery or pickup date has passed will appear here."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
    gap: 12,
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
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#161b22",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  tabButtonActive: {
    borderColor: "#06b6d4",
    backgroundColor: "rgba(6, 182, 212, 0.12)",
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
  },
  tabButtonTextActive: {
    color: "#06b6d4",
  },
  tabButtonTextActiveFulfilled: {
    color: "#10b981",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: "#161b22",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cardHeaderRow: {
    flexDirection: "row",
    gap: 12,
  },
  productThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: "#0d1117",
  },
  productThumbPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  productInfoCol: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    flexWrap: "wrap",
  },
  metaBadge: {
    backgroundColor: "#0d1117",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
  },
  typeBadge: {
    borderColor: "rgba(6, 182, 212, 0.3)",
    backgroundColor: "rgba(6, 182, 212, 0.08)",
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#06b6d4",
  },
  totalPriceText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#06b6d4",
    marginTop: 6,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0d1117",
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  userLeftBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  userNameText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  userPhoneText: {
    fontSize: 11,
    color: "#64748b",
  },
  fulfillmentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deliveryBadge: {
    backgroundColor: "rgba(6, 182, 212, 0.12)",
  },
  pickupBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  fulfillmentText: {
    fontSize: 11,
    fontWeight: "700",
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  dateTimeText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  messageBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#06b6d4",
    paddingVertical: 8,
    borderRadius: 10,
  },
  messageBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  deleteBtn: {
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
  deleteBtnText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "700",
  },
  centeredBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 14,
  },
  emptySub: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
});
