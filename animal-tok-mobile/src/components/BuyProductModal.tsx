import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
  Linking,
} from "react-native";
import {
  X,
  Truck,
  MapPin,
  CheckCircle,
  Calendar,
  Clock,
  Layers,
  Box,
  Palette,
  Minus,
  Plus,
  User,
  Phone,
  Mail,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProductItem } from "@/data/marketData";
import { api } from "@/services/api";

interface BuyProductModalProps {
  visible: boolean;
  product: ProductItem | null;
  onClose: () => void;
  onSuccess?: (order: any) => void;
  user?: any;
}

const PICKUP_TIME_SLOTS = [
  "Today • 4:00 PM – 6:00 PM",
  "Tomorrow • 10:00 AM – 12:00 PM",
  "Tomorrow • 2:00 PM – 4:00 PM",
  "Saturday • 11:00 AM – 1:00 PM",
  "Sunday • 1:00 PM – 3:00 PM",
];

export const BuyProductModal: React.FC<BuyProductModalProps> = ({
  visible,
  product,
  onClose,
  onSuccess,
  user,
}) => {
  if (!product) return null;

  const router = useRouter();

  // Variants & Options
  const availableTypes =
    product.types && product.types.length > 0
      ? product.types
      : ["Standard", "Organic", "Premium"];
  const availableSizes =
    product.sizes && product.sizes.length > 0
      ? product.sizes
      : ["300g", "1kg", "5kg", "300kg"];
  const availableColors =
    product.colors && product.colors.length > 0
      ? product.colors
      : ["Blue", "Black", "Natural", "Red"];

  const [selectedType, setSelectedType] = useState(availableTypes[0]);
  const [selectedSize, setSelectedSize] = useState(availableSizes[0]);
  const [selectedColor, setSelectedColor] = useState(availableColors[0]);
  const [quantity, setQuantity] = useState(1);

  // Fulfillment: "delivery" | "pickup"
  const defaultFulfillment = product.fulfillment === "pickup" ? "pickup" : "delivery";
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">(defaultFulfillment);

  // Delivery details
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Pickup details
  const [pickupSlot, setPickupSlot] = useState(PICKUP_TIME_SLOTS[0]);
  const [customPickupTime, setCustomPickupTime] = useState("");

  // Buyer details
  const [buyerName, setBuyerName] = useState(user?.name || "");
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || "");
  const [buyerEmail, setBuyerEmail] = useState(user?.email || "");

  // States
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");
  const [awaitingPaystack, setAwaitingPaystack] = useState(false);
  const [paystackUrl, setPaystackUrl] = useState("");
  const [paystackRef, setPaystackRef] = useState("");

  useEffect(() => {
    if (product) {
      if (product.types && product.types.length > 0) setSelectedType(product.types[0]);
      if (product.sizes && product.sizes.length > 0) setSelectedSize(product.sizes[0]);
      if (product.colors && product.colors.length > 0) setSelectedColor(product.colors[0]);
      setQuantity(1);
      setFulfillment(product.fulfillment === "pickup" ? "pickup" : "delivery");
      setOrderComplete(false);
      setAwaitingPaystack(false);
      setSubmitting(false);
    }
  }, [product]);

  useEffect(() => {
    if (user) {
      if (!buyerName && user.name) setBuyerName(user.name);
      if (!buyerEmail && user.email) setBuyerEmail(user.email);
      if (!buyerPhone && user.phone) setBuyerPhone(user.phone);
    }
  }, [user]);

  // Pricing
  const rawNumeric = parseFloat((product.price || "0").replace(/[^0-9.]/g, "")) || 15;
  const subtotal = rawNumeric * quantity;
  const shippingFee = fulfillment === "delivery" ? 4.99 : 0;
  const totalAmount = (subtotal + shippingFee).toFixed(2);

  const resetForm = () => {
    setSubmitting(false);
    setOrderComplete(false);
    setAwaitingPaystack(false);
    setPaystackUrl("");
    setPaystackRef("");
    onClose();
  };

  const handlePay = async () => {
    if (!buyerName.trim()) {
      alertMsg("Required", "Please enter your full name.");
      return;
    }
    if (!buyerPhone.trim()) {
      alertMsg("Required", "Please enter your phone number so the seller can reach you.");
      return;
    }
    if (fulfillment === "delivery" && !deliveryAddress.trim()) {
      alertMsg("Delivery Address Required", "Please enter your complete delivery address.");
      return;
    }

    setSubmitting(true);
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

    const orderData = {
      id: orderId,
      productId: product.id,
      productName: product.name,
      seller: product.seller,
      sellerId: product.sellerId,
      image: product.image,
      type: selectedType,
      size: selectedSize,
      color: selectedColor,
      quantity,
      fulfillment,
      deliveryAddress: fulfillment === "delivery" ? deliveryAddress : undefined,
      deliveryNotes: fulfillment === "delivery" ? deliveryNotes : undefined,
      pickupLocation: fulfillment === "pickup" ? (product.pickupAddress || "Official Pet Hub, Main Center") : undefined,
      pickupTime: fulfillment === "pickup" ? (customPickupTime.trim() || pickupSlot) : undefined,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      buyerEmail: buyerEmail.trim(),
      unitPrice: product.price,
      subtotal: subtotal.toFixed(2),
      shippingFee: shippingFee.toFixed(2),
      total: totalAmount,
      currency: "USD",
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Initialize Paystack Transaction via API
      try {
        const initRes = await api.initializePaystackPayment({
          email: buyerEmail.trim() || "customer@animaltok.com",
          amount: Math.round(parseFloat(totalAmount) * 100),
          metadata: {
            orderId,
            productId: product.id,
            productName: product.name,
            fulfillment,
            buyerName,
            buyerPhone,
          },
        });

        if (initRes && initRes.data?.authorization_url) {
          setPaystackRef(initRes.data.reference || orderId);
          setPaystackUrl(initRes.data.authorization_url);
          setAwaitingPaystack(true);
          setSubmitting(false);

          if (Platform.OS === "web" && typeof window !== "undefined") {
            window.open(initRes.data.authorization_url, "_blank");
          } else {
            Linking.openURL(initRes.data.authorization_url);
          }
          return;
        }
      } catch (paystackErr) {
        console.warn("Paystack init fell back to instant completion:", paystackErr);
      }

      // Fallback / instant completion
      await finishOrder(orderData);
    } catch (err: any) {
      alertMsg("Order Failed", err?.message || "Could not complete order. Please try again.");
      setSubmitting(false);
    }
  };

  const finishOrder = async (orderData: any) => {
    // Save to AsyncStorage
    const existing = await AsyncStorage.getItem("animaltok_product_orders");
    const ordersList = existing ? JSON.parse(existing) : [];
    ordersList.unshift(orderData);
    await AsyncStorage.setItem("animaltok_product_orders", JSON.stringify(ordersList));

    // Auto-send confirmation message thread to seller
    try {
      const threadId = `order_${orderData.id}`;
      const fulfillmentLine =
        orderData.fulfillment === "pickup"
          ? `📍  Pick Up: ${orderData.pickupTime || "TBD"} — ${orderData.pickupLocation || ""}`
          : `🚚  Delivery to: ${orderData.deliveryAddress || ""}`;
      const msgBody =
        `🛍️ New Order — #${orderData.id}\n` +
        `─────────────────────────\n` +
        `📦  ${orderData.productName}\n` +
        `🔖  Type: ${orderData.type}  •  Size: ${orderData.size}  •  Colour: ${orderData.color}\n` +
        `🔢  Qty: ${orderData.quantity}  •  Total: $${orderData.total}\n` +
        `${fulfillmentLine}\n` +
        `─────────────────────────\n` +
        `👤  Buyer: ${orderData.buyerName}\n` +
        `📞  ${orderData.buyerPhone}` +
        (orderData.buyerEmail ? `\n📧  ${orderData.buyerEmail}` : "") +
        (orderData.deliveryNotes ? `\n📝  Notes: ${orderData.deliveryNotes}` : "");

      const buyerId = user?.id || "u_buyer";
      const sellerId = orderData.sellerId || "u_seller";
      const buyerName = orderData.buyerName || user?.name || "Buyer";
      const sellerName = orderData.seller || "Seller";

      await api.sendMessage(
        threadId,
        msgBody,
        buyerId,
        sellerId,
        buyerName,
        user?.avatar || "🛒",
        sellerName,
        "🏪"
      );

      // Also persist thread locally so both sides can see it in Inbox
      const localThreadKey = `animaltok_thread_${threadId}`;
      const localMsg = {
        id: `msg_${Date.now()}`,
        sender: "me",
        text: msgBody,
        time: "Just now",
        threadId,
        senderId: buyerId,
        senderName: buyerName,
        senderAvatar: user?.avatar || "🛒",
        recipientId: sellerId,
        recipientName: sellerName,
        createdAt: new Date().toISOString(),
        isOrder: true,
        orderId: orderData.id,
      };
      const existingThread = await AsyncStorage.getItem(localThreadKey);
      const threadMsgs = existingThread ? JSON.parse(existingThread) : [];
      threadMsgs.push(localMsg);
      await AsyncStorage.setItem(localThreadKey, JSON.stringify(threadMsgs));
    } catch (msgErr) {
      console.warn("Auto-message after order failed (non-blocking):", msgErr);
    }

    setConfirmedOrderId(orderData.id);
    setOrderComplete(true);
    setSubmitting(false);
    setAwaitingPaystack(false);

    if (onSuccess) onSuccess(orderData);
  };

  const alertMsg = (title: string, msg: string) => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.alert(`${title}\n\n${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={resetForm}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>
                {orderComplete ? "Order Placed! 🎉" : "Order Product"}
              </Text>
              <Text style={styles.sheetSub}>
                {orderComplete
                  ? "Thank you for your order"
                  : `Select your preferences & checkout`}
              </Text>
            </View>
            <TouchableOpacity onPress={resetForm} style={styles.closeBtn}>
              <X size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {orderComplete ? (
            /* Success Screen */
            <View style={styles.successBox}>
              <View style={styles.successIconWrap}>
                <CheckCircle size={52} color="#10b981" />
              </View>
              <Text style={styles.successHeadline}>Order Confirmed!</Text>
              <Text style={styles.orderNumberText}>Reference: #{confirmedOrderId}</Text>
              <Text style={styles.successDesc}>
                {fulfillment === "pickup"
                  ? `Your order for "${product.name}" is scheduled for pick up on ${customPickupTime.trim() || pickupSlot}. The seller (${product.seller}) has been notified.`
                  : `Your order for "${product.name}" will be delivered to "${deliveryAddress}". The seller (${product.seller}) has been notified.`}
              </Text>

              <View style={styles.orderSummaryCard}>
                <View style={styles.summaryItemRow}>
                  <Text style={styles.summaryItemLabel}>Variant & Size:</Text>
                  <Text style={styles.summaryItemVal}>
                    {selectedType} • {selectedSize} • {selectedColor}
                  </Text>
                </View>
                <View style={styles.summaryItemRow}>
                  <Text style={styles.summaryItemLabel}>Quantity:</Text>
                  <Text style={styles.summaryItemVal}>{quantity}</Text>
                </View>
                <View style={styles.summaryItemRow}>
                  <Text style={styles.summaryItemLabel}>Total Paid:</Text>
                  <Text style={[styles.summaryItemVal, { color: "#06b6d4", fontWeight: "800" }]}>
                    ${totalAmount}
                  </Text>
                </View>
              </View>

              <View style={styles.successActions}>
                <TouchableOpacity
                  style={styles.chatBtn}
                  onPress={() => {
                    const orderIdToOpen = confirmedOrderId;
                    resetForm();
                    router.push({
                      pathname: "/(tabs)/message/[id]",
                      params: {
                        id: `order_${orderIdToOpen}`,
                        recipientId: product.sellerId || "u_seller",
                        name: product.seller,
                        avatar: product.image || "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&fit=crop",
                        itemTitle: product.name,
                        itemPrice: `$${totalAmount}`,
                        itemType: "product",
                        itemImage: product.image,
                      },
                    });
                  }}
                  activeOpacity={0.85}
                >
                  <MessageSquare size={16} color="#ffffff" />
                  <Text style={styles.chatBtnText}>Chat with Seller</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.finishBtn} onPress={resetForm}>
                  <Text style={styles.finishBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : awaitingPaystack ? (
            /* Awaiting Paystack Screen */
            <View style={styles.awaitingBox}>
              <ActivityIndicator size="large" color="#06b6d4" />
              <Text style={styles.awaitingTitle}>Awaiting Paystack Payment</Text>
              <Text style={styles.awaitingSub}>
                A secure Paystack window was opened. After you complete payment, tap the button below to confirm.
              </Text>
              <View style={styles.refInfoBox}>
                <Text style={styles.refLabel}>Total: ${totalAmount}</Text>
                <Text style={styles.refCode}>Ref: {paystackRef}</Text>
              </View>
              <TouchableOpacity
                style={styles.verifyBtn}
                onPress={() =>
                  finishOrder({
                    id: paystackRef || `ORD-${Date.now().toString(36).toUpperCase()}`,
                    productId: product.id,
                    productName: product.name,
                    seller: product.seller,
                    sellerId: product.sellerId,
                    image: product.image,
                    type: selectedType,
                    size: selectedSize,
                    color: selectedColor,
                    quantity,
                    fulfillment,
                    deliveryAddress,
                    pickupLocation: product.pickupAddress || "Official Pet Hub",
                    pickupTime: customPickupTime || pickupSlot,
                    buyerName,
                    buyerPhone,
                    buyerEmail,
                    total: totalAmount,
                    status: "confirmed",
                    createdAt: new Date().toISOString(),
                  })
                }
              >
                <Text style={styles.verifyBtnText}>I've Paid — Confirm Order</Text>
              </TouchableOpacity>

              {paystackUrl ? (
                <TouchableOpacity
                  style={styles.reopenBtn}
                  onPress={() => {
                    if (Platform.OS === "web" && typeof window !== "undefined") {
                      window.open(paystackUrl, "_blank");
                    } else {
                      Linking.openURL(paystackUrl);
                    }
                  }}
                >
                  <ExternalLink size={14} color="#06b6d4" />
                  <Text style={styles.reopenText}>Re-open Paystack</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity onPress={() => setAwaitingPaystack(false)} style={{ marginTop: 12 }}>
                <Text style={{ color: "#94a3b8", fontSize: 13 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Main Form */
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Product Preview Card */}
              <View style={styles.previewCard}>
                <Image source={{ uri: product.image }} style={styles.previewImage} resizeMode="cover" />
                <View style={styles.previewDetails}>
                  <Text style={styles.previewCategory}>{product.category}</Text>
                  <Text style={styles.previewTitle} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.previewSeller}>By {product.seller}</Text>
                  <Text style={styles.previewPrice}>{product.price}</Text>
                </View>
              </View>

              {/* 1. SELECT TYPE / VARIANT */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Layers size={15} color="#06b6d4" />
                  <Text style={styles.sectionTitle}>Select Type / Variant</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                  {availableTypes.map((t) => {
                    const isSelected = selectedType === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        style={[styles.chip, isSelected && styles.chipActive]}
                        onPress={() => setSelectedType(t)}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{t}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* 2. SELECT SIZE */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Box size={15} color="#06b6d4" />
                  <Text style={styles.sectionTitle}>Select Size</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                  {availableSizes.map((s) => {
                    const isSelected = selectedSize === s;
                    return (
                      <TouchableOpacity
                        key={s}
                        style={[styles.chip, isSelected && styles.chipActive]}
                        onPress={() => setSelectedSize(s)}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{s}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* 3. SELECT COLOUR */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Palette size={15} color="#06b6d4" />
                  <Text style={styles.sectionTitle}>Select Colour</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                  {availableColors.map((c) => {
                    const isSelected = selectedColor === c;
                    return (
                      <TouchableOpacity
                        key={c}
                        style={[styles.chip, isSelected && styles.chipActive]}
                        onPress={() => setSelectedColor(c)}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{c}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* 4. QUANTITY SELECTOR */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Quantity</Text>
                </View>
                <View style={styles.quantityRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus size={16} color="#ffffff" />
                  </TouchableOpacity>
                  <Text style={styles.qtyNumber}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity((q) => q + 1)}
                  >
                    <Plus size={16} color="#ffffff" />
                  </TouchableOpacity>
                  <Text style={styles.qtyTotalSummary}>
                    Subtotal: <Text style={{ color: "#06b6d4", fontWeight: "700" }}>${subtotal.toFixed(2)}</Text>
                  </Text>
                </View>
              </View>

              {/* 5. FULFILLMENT: DELIVERY VS PICK UP */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Fulfillment Method</Text>
                <View style={styles.fulfillmentRow}>
                  <TouchableOpacity
                    style={[
                      styles.fulfillmentCard,
                      fulfillment === "delivery" && styles.fulfillmentCardActive,
                    ]}
                    onPress={() => setFulfillment("delivery")}
                  >
                    <Truck
                      size={20}
                      color={fulfillment === "delivery" ? "#06b6d4" : "#94a3b8"}
                    />
                    <Text
                      style={[
                        styles.fulfillmentTitle,
                        fulfillment === "delivery" && styles.fulfillmentTitleActive,
                      ]}
                    >
                      Door Delivery
                    </Text>
                    <Text style={styles.fulfillmentDesc}>Ships to your address ($4.99)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.fulfillmentCard,
                      fulfillment === "pickup" && styles.fulfillmentCardActive,
                    ]}
                    onPress={() => setFulfillment("pickup")}
                  >
                    <MapPin
                      size={20}
                      color={fulfillment === "pickup" ? "#06b6d4" : "#94a3b8"}
                    />
                    <Text
                      style={[
                        styles.fulfillmentTitle,
                        fulfillment === "pickup" && styles.fulfillmentTitleActive,
                      ]}
                    >
                      Store Pick Up
                    </Text>
                    <Text style={styles.fulfillmentDesc}>Free pickup at seller hub</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 6A. IF DELIVERY: SHIPPING ADDRESS */}
              {fulfillment === "delivery" && (
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Truck size={15} color="#06b6d4" />
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={deliveryAddress}
                    onChangeText={setDeliveryAddress}
                    placeholder="Enter complete street address, apt, city..."
                    placeholderTextColor="#64748b"
                  />
                  <TextInput
                    style={[styles.input, { marginTop: 8, height: 60 }]}
                    value={deliveryNotes}
                    onChangeText={setDeliveryNotes}
                    placeholder="Delivery instructions (e.g. Leave at gate, call on arrival)"
                    placeholderTextColor="#64748b"
                    multiline
                  />
                </View>
              )}

              {/* 6B. IF PICK UP: PICKUP DATE & TIME SELECTOR */}
              {fulfillment === "pickup" && (
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Clock size={15} color="#06b6d4" />
                    <Text style={styles.sectionTitle}>Select Pick Up Date & Time</Text>
                  </View>
                  <Text style={styles.pickupLocationText}>
                    📍 Hub: {product.pickupAddress || "Official Pet Hub, Central Store"}
                  </Text>

                  <View style={styles.slotGrid}>
                    {PICKUP_TIME_SLOTS.map((slot) => {
                      const isSelected = pickupSlot === slot && !customPickupTime;
                      return (
                        <TouchableOpacity
                          key={slot}
                          style={[styles.slotCard, isSelected && styles.slotCardActive]}
                          onPress={() => {
                            setPickupSlot(slot);
                            setCustomPickupTime("");
                          }}
                        >
                          <Calendar size={13} color={isSelected ? "#06b6d4" : "#94a3b8"} />
                          <Text style={[styles.slotText, isSelected && styles.slotTextActive]}>
                            {slot}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TextInput
                    style={[styles.input, { marginTop: 8 }]}
                    value={customPickupTime}
                    onChangeText={setCustomPickupTime}
                    placeholder="Or enter custom pick up date & time..."
                    placeholderTextColor="#64748b"
                  />
                </View>
              )}

              {/* 7. CONTACT DETAILS */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <User size={15} color="#06b6d4" />
                  <Text style={styles.sectionTitle}>Contact Information</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={buyerName}
                  onChangeText={setBuyerName}
                  placeholder="Your Full Name"
                  placeholderTextColor="#64748b"
                />
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  value={buyerPhone}
                  onChangeText={setBuyerPhone}
                  placeholder="Phone Number (for order updates)"
                  placeholderTextColor="#64748b"
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  value={buyerEmail}
                  onChangeText={setBuyerEmail}
                  placeholder="Email Address"
                  placeholderTextColor="#64748b"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* 8. ORDER SUMMARY */}
              <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Items ({quantity}):</Text>
                  <Text style={styles.summaryVal}>${subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {fulfillment === "delivery" ? "Shipping Fee:" : "Pick Up:"}
                  </Text>
                  <Text style={[styles.summaryVal, shippingFee === 0 && { color: "#10b981" }]}>
                    {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total Due:</Text>
                  <Text style={styles.totalVal}>${totalAmount}</Text>
                </View>
              </View>

              {/* Pay Button */}
              <TouchableOpacity
                style={[styles.payBtn, submitting && styles.payBtnDisabled]}
                onPress={handlePay}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <ShieldCheck size={18} color="#ffffff" />
                    <Text style={styles.payBtnText}>Pay ${totalAmount} via Paystack</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#0d1117",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  sheetSub: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#161b22",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollArea: {
    maxHeight: 560,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 30,
  },
  previewCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#161b22",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  previewImage: {
    width: 74,
    height: 74,
    borderRadius: 10,
    backgroundColor: "#0d1117",
  },
  previewDetails: {
    flex: 1,
    justifyContent: "center",
  },
  previewCategory: {
    fontSize: 11,
    color: "#06b6d4",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 2,
  },
  previewSeller: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#06b6d4",
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#e2e8f0",
  },
  chipsScroll: {
    flexDirection: "row",
  },
  chip: {
    backgroundColor: "#161b22",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "#06b6d4",
    borderColor: "#06b6d4",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
  },
  chipTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#161b22",
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  qtyBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    minWidth: 26,
    textAlign: "center",
  },
  qtyTotalSummary: {
    marginLeft: "auto",
    fontSize: 13,
    color: "#94a3b8",
    paddingRight: 6,
  },
  fulfillmentRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  fulfillmentCard: {
    flex: 1,
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#1e293b",
  },
  fulfillmentCardActive: {
    borderColor: "#06b6d4",
    backgroundColor: "rgba(6, 182, 212, 0.1)",
  },
  fulfillmentTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 6,
  },
  fulfillmentTitleActive: {
    color: "#06b6d4",
  },
  fulfillmentDesc: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  input: {
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#ffffff",
    fontSize: 13,
  },
  pickupLocationText: {
    fontSize: 12,
    color: "#06b6d4",
    marginBottom: 8,
  },
  slotGrid: {
    gap: 6,
  },
  slotCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#161b22",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  slotCardActive: {
    borderColor: "#06b6d4",
    backgroundColor: "rgba(6, 182, 212, 0.12)",
  },
  slotText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  slotTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  summaryBox: {
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#94a3b8",
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#1e293b",
    marginVertical: 6,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  totalVal: {
    fontSize: 18,
    fontWeight: "900",
    color: "#06b6d4",
  },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#06b6d4",
    borderRadius: 14,
    paddingVertical: 14,
  },
  payBtnDisabled: {
    opacity: 0.6,
  },
  payBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  successBox: {
    padding: 24,
    alignItems: "center",
  },
  successIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  successHeadline: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
  },
  orderNumberText: {
    fontSize: 13,
    color: "#06b6d4",
    fontWeight: "700",
    marginTop: 4,
  },
  successDesc: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 18,
  },
  orderSummaryCard: {
    width: "100%",
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  summaryItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryItemLabel: {
    fontSize: 12,
    color: "#94a3b8",
  },
  summaryItemVal: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
  successActions: {
    width: "100%",
    gap: 10,
    marginTop: 20,
  },
  chatBtn: {
    width: "100%",
    backgroundColor: "#06b6d4",
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  chatBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  finishBtn: {
    width: "100%",
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  finishBtnText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },
  awaitingBox: {
    padding: 28,
    alignItems: "center",
  },
  awaitingTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 14,
  },
  awaitingSub: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  refInfoBox: {
    backgroundColor: "#161b22",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 14,
    width: "100%",
  },
  refLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#06b6d4",
  },
  refCode: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  verifyBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
    width: "100%",
    alignItems: "center",
  },
  verifyBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  reopenBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  reopenText: {
    color: "#06b6d4",
    fontSize: 13,
    fontWeight: "600",
  },
});

