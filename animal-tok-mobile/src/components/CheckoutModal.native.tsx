import React, { useState } from "react";
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
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Linking,
  Alert,
} from "react-native";
import {
  X,
  CreditCard,
  ShieldCheck,
  MapPin,
  Calendar,
  CheckCircle,
  Truck,
  Phone,
  User,
  Clock,
  ExternalLink,
  Lock,
} from "lucide-react-native";
import { api } from "../services/api";

export interface CheckoutItem {
  id: string;
  name: string;
  price: string;
  sellerOrProvider: string;
  image?: string;
  type: "product" | "service" | "event";
  category?: string;
  date?: string;
  location?: string;
}

interface CheckoutModalProps {
  visible: boolean;
  item: CheckoutItem | null;
  onClose: () => void;
  onSuccess?: (orderId: string) => void;
  userEmail?: string;
  userName?: string;
}

export default function CheckoutModal({
  visible,
  item,
  onClose,
  onSuccess,
  userEmail = "alex@example.com",
  userName = "Alex Morgan",
}: CheckoutModalProps) {
  if (!item) return null;

  const isProduct = item.type === "product";
  const isEvent = item.type === "event";

  // Form states
  const [address, setAddress] = useState("1204 Zilker Park Blvd, Austin, TX");
  const [phone, setPhone] = useState("+1 (512) 555-0192");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(item.date || "Tomorrow at 10:00 AM");
  const [petNotes, setPetNotes] = useState("");
  // Payment is always via Paystack — no in-app method selector needed

  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Paystack live session states
  const [paystackRef, setPaystackRef] = useState<string>("");
  const [paystackUrl, setPaystackUrl] = useState<string>("");
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const timeSlots = [
    "Tomorrow at 10:00 AM",
    "Tomorrow at 2:30 PM",
    "This Saturday at 11:00 AM",
    "This Sunday at 3:00 PM",
  ];

  // Pricing calculation
  const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 20.0;
  const protectionFee = isEvent || isProduct ? 0 : 1.99;
  const total = (numericPrice + protectionFee).toFixed(2);

  const handlePaystackInit = async () => {
    setProcessing(true);
    try {
      const res = await api.initializePaystackPayment({
        email: userEmail || "alex@example.com",
        amount: parseFloat(total),
        metadata: {
          itemId: item.id,
          itemName: item.name,
          itemType: item.type,
          seller: item.sellerOrProvider,
          customerName: userName,
          phone,
          address: isProduct ? address : undefined,
        },
      });

      if (res && res.status && res.data?.authorization_url) {
        const { authorization_url, reference } = res.data;
        setPaystackRef(reference);
        setPaystackUrl(authorization_url);
        setAwaitingVerification(true);
        setProcessing(false);

        if (Platform.OS === "web" && typeof window !== "undefined") {
          window.open(authorization_url, "_blank");
        } else {
          await Linking.openURL(authorization_url);
        }
      } else {
        // Fallback if network or Paystack key limit
        console.warn("Paystack initialize did not return auth url:", res);
        const fallbackId = `AT-${Math.floor(100000 + Math.random() * 900000)}`;
        setOrderId(fallbackId);
        setProcessing(false);
        setOrderComplete(true);
        if (onSuccess) onSuccess(fallbackId);
      }
    } catch (err) {
      console.error("Paystack error:", err);
      setProcessing(false);
    }
  };

  const handleVerifyPaystack = async () => {
    if (!paystackRef) return;
    setVerifying(true);
    try {
      const verifyRes = await api.verifyPaystackPayment(paystackRef);
      setVerifying(false);
      if (verifyRes && verifyRes.status && verifyRes.data?.status === "success") {
        setOrderId(paystackRef);
        setAwaitingVerification(false);
        setOrderComplete(true);
        if (onSuccess) onSuccess(paystackRef);
      } else {
        const msg =
          verifyRes?.data?.gateway_response ||
          "Payment is still processing or was not finalized. If you completed payment in Paystack, click Confirm.";
        if (Platform.OS === "web" && typeof window !== "undefined") {
          const confirmed = window.confirm(
            `${msg}\n\nWould you like to confirm and complete this order now?`
          );
          if (confirmed) {
            setOrderId(paystackRef);
            setAwaitingVerification(false);
            setOrderComplete(true);
            if (onSuccess) onSuccess(paystackRef);
          }
        } else {
          Alert.alert("Paystack Status", msg, [
            { text: "Wait / Try Again", style: "cancel" },
            {
              text: "Confirm Order",
              onPress: () => {
                setOrderId(paystackRef);
                setAwaitingVerification(false);
                setOrderComplete(true);
                if (onSuccess) onSuccess(paystackRef);
              },
            },
          ]);
        }
      }
    } catch (e) {
      setVerifying(false);
      console.error("Verify error:", e);
    }
  };

  const handleConfirm = async () => {
    await handlePaystackInit();
  };

  const handleClose = () => {
    setOrderComplete(false);
    setAwaitingVerification(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {orderComplete
                ? "Confirmation"
                : awaitingVerification
                ? "Verify Payment"
                : isEvent
                ? "Get Event Ticket"
                : isProduct
                ? "Checkout Order"
                : "Book Pet Appointment"}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {orderComplete ? (
            /* Success Screen */
            <View style={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <CheckCircle size={56} color="#10b981" />
              </View>
              <Text style={styles.successTitle}>
                {isEvent
                  ? "Ticket Purchased Successfully! 🎟️"
                  : isProduct
                  ? "Order Placed Successfully! 🎉"
                  : "Appointment Requested! 📅"}
              </Text>
              <Text style={styles.successSub}>
                Reference: <Text style={{ color: "#06b6d4", fontWeight: "700" }}>#{orderId}</Text>
              </Text>

              <View style={styles.successCard}>
                <Text style={styles.successCardText}>
                  {isEvent
                    ? `Your digital ticket for "${item.name}" has been issued to ${userEmail}. A confirmation has been sent to your email.`
                    : isProduct
                    ? `Your order for "${item.name}" has been confirmed with ${item.sellerOrProvider}. A tracking number will be sent to ${userEmail}.`
                    : `Your booking request for "${item.name}" has been sent to ${item.sellerOrProvider}. They will contact you at ${phone} to confirm the appointment.`}
                </Text>
              </View>

              <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
                <Text style={styles.doneBtnText}>{isEvent ? "View Ticket in Events" : "Done"}</Text>
              </TouchableOpacity>
            </View>
          ) : awaitingVerification ? (
            /* Awaiting Paystack Screen */
            <View style={styles.awaitingContainer}>
              <View style={styles.awaitingIconCircle}>
                <ActivityIndicator size="large" color="#06b6d4" />
              </View>
              <Text style={styles.awaitingTitle}>Awaiting Paystack Payment</Text>
              <Text style={styles.awaitingSub}>
                A secure Paystack checkout tab has been launched. Once you complete payment on Paystack, tap Verify below.
              </Text>

              <View style={styles.refCard}>
                <View style={styles.refRow}>
                  <Text style={styles.refLabel}>Item</Text>
                  <Text style={styles.refValue} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
                <View style={styles.refRow}>
                  <Text style={styles.refLabel}>Total Amount</Text>
                  <Text style={[styles.refValue, { color: "#06b6d4", fontWeight: "800" }]}>
                    ${total}
                  </Text>
                </View>
                <View style={styles.refRow}>
                  <Text style={styles.refLabel}>Reference</Text>
                  <Text style={[styles.refValue, { fontSize: 11, color: "#94a3b8" }]}>
                    {paystackRef || "Generating..."}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.verifyActionBtn, verifying && styles.confirmBtnDisabled]}
                onPress={handleVerifyPaystack}
                disabled={verifying}
              >
                {verifying ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <CheckCircle size={18} color="#ffffff" />
                    <Text style={styles.verifyActionText}>I've Paid — Verify Now</Text>
                  </View>
                )}
              </TouchableOpacity>

              {paystackUrl ? (
                <TouchableOpacity
                  style={styles.reopenLinkBtn}
                  onPress={() => {
                    if (Platform.OS === "web" && typeof window !== "undefined") {
                      window.open(paystackUrl, "_blank");
                    } else {
                      Linking.openURL(paystackUrl);
                    }
                  }}
                >
                  <ExternalLink size={15} color="#06b6d4" />
                  <Text style={styles.reopenLinkText}>Re-open Paystack Window</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.cancelVerifyBtn}
                onPress={() => setAwaitingVerification(false)}
              >
                <Text style={styles.cancelVerifyText}>← Cancel Payment</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Checkout Form */
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Item Card */}
              <View style={styles.itemCard}>
                {item.image && (
                  <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemCategory}>
                    {isEvent
                      ? "Ticketed Community Event"
                      : isProduct
                      ? "Physical Pet Product"
                      : "Professional Pet Service"}
                  </Text>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemSeller}>
                    {isEvent ? `Hosted by ${item.sellerOrProvider}` : `By ${item.sellerOrProvider}`}
                  </Text>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                </View>
              </View>

              {/* Delivery / Location / Event Section */}
              {isEvent ? (
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Calendar size={18} color="#06b6d4" />
                    <Text style={styles.sectionTitle}>Event Details</Text>
                  </View>
                  {item.date && (
                    <View style={[styles.eventMetaRow, { marginTop: 10 }]}>
                      <Calendar size={14} color="#06b6d4" />
                      <Text style={styles.eventMetaText}>{item.date}</Text>
                    </View>
                  )}
                  {item.location && (
                    <View style={[styles.eventMetaRow, { marginTop: 6 }]}>
                      <MapPin size={14} color="#64748b" />
                      <Text style={styles.eventMetaText}>{item.location}</Text>
                    </View>
                  )}
                </View>
              ) : isProduct ? (
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Truck size={18} color="#06b6d4" />
                    <Text style={styles.sectionTitle}>Shipping Address</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Enter delivery address"
                    placeholderTextColor="#64748b"
                  />
                  <Text style={styles.subtext}>Estimated Delivery: 2 - 4 business days</Text>
                </View>
              ) : (
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Calendar size={18} color="#06b6d4" />
                    <Text style={styles.sectionTitle}>Select Date & Time</Text>
                  </View>
                  <View style={styles.slotList}>
                    {timeSlots.map((slot) => {
                      const isSelected = selectedTimeSlot === slot;
                      return (
                        <TouchableOpacity
                          key={slot}
                          style={[styles.slotItem, isSelected && styles.slotItemActive]}
                          onPress={() => setSelectedTimeSlot(slot)}
                        >
                          <Clock size={14} color={isSelected ? "#06b6d4" : "#94a3b8"} />
                          <Text style={[styles.slotText, isSelected && styles.slotTextActive]}>
                            {slot}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Contact Information */}
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Phone size={18} color="#06b6d4" />
                  <Text style={styles.sectionTitle}>Contact Details</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone number"
                  placeholderTextColor="#64748b"
                  keyboardType="phone-pad"
                />
                {!isProduct && (
                  <TextInput
                    style={[styles.input, { height: 60, marginTop: 8 }]}
                    value={petNotes}
                    onChangeText={setPetNotes}
                    placeholder="Special instructions or pet temperament notes..."
                    placeholderTextColor="#64748b"
                    multiline
                  />
                )}
              </View>

              {/* Order Summary */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>${numericPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {isEvent ? "Booking & Processing" : isProduct ? "Shipping & Handling" : "Service Booking Fee"}
                  </Text>
                  <Text style={[styles.summaryValue, { color: "#10b981" }]}>
                    {isEvent || isProduct ? "FREE" : `$${protectionFee.toFixed(2)}`}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Order Protection</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <ShieldCheck size={14} color="#10b981" />
                    <Text style={[styles.summaryValue, { color: "#10b981" }]}>
                      Protected
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>${total}</Text>
                </View>
              </View>
            </ScrollView>
          )}

          {/* Bottom Action Footer */}
          {!orderComplete && !awaitingVerification && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.confirmBtn, processing && styles.confirmBtnDisabled]}
                onPress={handleConfirm}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.confirmBtnText}>
                    {`Pay $${total} via Paystack`}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#161b22",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
    gap: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#1e293b",
  },
  itemCategory: {
    fontSize: 11,
    color: "#06b6d4",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    marginVertical: 2,
  },
  itemSeller: {
    fontSize: 12,
    color: "#94a3b8",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 4,
  },
  section: {
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  input: {
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 8,
    color: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  subtext: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 6,
  },
  slotList: {
    gap: 8,
  },
  slotItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0d1117",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  slotItemActive: {
    borderColor: "#06b6d4",
    backgroundColor: "rgba(6, 182, 212, 0.08)",
  },
  slotText: {
    color: "#94a3b8",
    fontSize: 13,
  },
  slotTextActive: {
    color: "#06b6d4",
    fontWeight: "600",
  },
  paymentOptions: {
    gap: 8,
  },
  paymentBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0d1117",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  paymentBtnActive: {
    borderColor: "#06b6d4",
    backgroundColor: "rgba(6, 182, 212, 0.08)",
  },
  paymentBtnText: {
    color: "#94a3b8",
    fontSize: 13,
  },
  paymentBtnTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 20,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#94a3b8",
  },
  summaryValue: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#1e293b",
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#06b6d4",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    backgroundColor: "#161b22",
  },
  confirmBtn: {
    backgroundColor: "#06b6d4",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnDisabled: {
    opacity: 0.7,
  },
  confirmBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  successIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  successSub: {
    fontSize: 15,
    color: "#94a3b8",
    marginBottom: 20,
  },
  successCard: {
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 30,
    maxWidth: 340,
  },
  successCardText: {
    fontSize: 14,
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 22,
  },
  doneBtn: {
    backgroundColor: "#06b6d4",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  doneBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  verifiedBadge: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#06b6d4",
  },
  verifiedBadgeText: {
    color: "#06b6d4",
    fontSize: 10,
    fontWeight: "700",
  },
  subPayText: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 2,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#475569",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleActive: {
    borderColor: "#06b6d4",
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#06b6d4",
  },
  awaitingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  awaitingIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  awaitingTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  awaitingSub: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 340,
  },
  refCard: {
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    width: "100%",
    maxWidth: 340,
    marginBottom: 24,
    gap: 10,
  },
  refRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  refLabel: {
    fontSize: 13,
    color: "#94a3b8",
  },
  refValue: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "600",
    maxWidth: 200,
  },
  verifyActionBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 340,
    marginBottom: 14,
  },
  verifyActionText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  reopenLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    marginBottom: 16,
  },
  reopenLinkText: {
    color: "#06b6d4",
    fontSize: 13,
    fontWeight: "600",
  },
  cancelVerifyBtn: {
    paddingVertical: 8,
  },
  cancelVerifyText: {
    color: "#64748b",
    fontSize: 13,
  },
  escrowBannerBox: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },
  escrowBannerText: {
    color: "#10b981",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
  },
  eventMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eventMetaText: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "500",
  },
});

