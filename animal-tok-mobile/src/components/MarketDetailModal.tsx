import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import {
  X,
  Star,
  MapPin,
  Clock,
  Building,
  Video as VideoIcon,
  ShoppingBag,
  Calendar,
  Layers,
  Box,
  Palette,
  Truck,
  Sparkles,
  ShieldCheck,
} from "lucide-react-native";
import { ProductItem, ServiceItem } from "@/data/marketData";

interface MarketDetailModalProps {
  visible: boolean;
  item: (ProductItem & Partial<ServiceItem>) | (ServiceItem & Partial<ProductItem>) | null;
  type: "product" | "service";
  onClose: () => void;
  onAction: () => void;
}

const { width } = Dimensions.get("window");

export const MarketDetailModal: React.FC<MarketDetailModalProps> = ({
  visible,
  item,
  type,
  onClose,
  onAction,
}) => {
  if (!item) return null;

  const isProduct = type === "product";
  const sellerOrProvider = isProduct ? item.seller : (item as any).provider;

  const displayTypes = item.types && item.types.length > 0 ? item.types : ["Standard", "Premium"];
  const displaySizes = item.sizes && item.sizes.length > 0 ? item.sizes : ["300g", "1kg", "5kg", "300kg"];
  const displayColors = item.colors && item.colors.length > 0 ? item.colors : ["Blue", "Black", "Natural", "Red"];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header Image with Floating Close Button & Category */}
          <View style={styles.imageBox}>
            <Image source={{ uri: item.image }} style={styles.bannerImage} resizeMode="cover" />
            <View style={styles.imageOverlayGradient} />

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <X size={20} color="#ffffff" />
            </TouchableOpacity>

            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{item.category || (isProduct ? "Product" : "Service")}</Text>
            </View>
          </View>

          {/* Scrollable Details */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Title & Author Row */}
            <View style={styles.titleSection}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <View style={styles.authorRow}>
                <Text style={styles.authorLabel}>
                  {isProduct ? "Sold by:" : "Offered by:"}{" "}
                  <Text style={styles.authorName}>{sellerOrProvider}</Text>
                </Text>
                <View style={styles.ratingBadge}>
                  <Star size={12} color="#f59e0b" fill="#f59e0b" />
                  <Text style={styles.ratingText}>{item.rating || "5.0"}</Text>
                </View>
              </View>
            </View>

            {/* BOLD PROMINENT PRICE DISPLAY */}
            <View style={styles.priceHighlightBox}>
              <View>
                <Text style={styles.priceHighlightLabel}>Official Marketplace Price</Text>
                <Text style={styles.boldPriceText}>{item.price}</Text>
              </View>
              <View style={styles.verifiedTag}>
                <ShieldCheck size={16} color="#10b981" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>

            {/* PRODUCT SPECIFIC: Variants, Sizes, Colors */}
            {isProduct && (
              <View style={styles.specsSection}>
                {/* Available Variants */}
                <View style={styles.specGroup}>
                  <View style={styles.specHeaderRow}>
                    <Layers size={14} color="#06b6d4" />
                    <Text style={styles.specLabel}>Available Types / Variants</Text>
                  </View>
                  <View style={styles.chipsRow}>
                    {displayTypes.map((t) => (
                      <View key={t} style={styles.specChip}>
                        <Text style={styles.specChipText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Available Sizes */}
                <View style={styles.specGroup}>
                  <View style={styles.specHeaderRow}>
                    <Box size={14} color="#06b6d4" />
                    <Text style={styles.specLabel}>Available Sizes</Text>
                  </View>
                  <View style={styles.chipsRow}>
                    {displaySizes.map((s) => (
                      <View key={s} style={styles.specChip}>
                        <Text style={styles.specChipText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Available Colours */}
                <View style={styles.specGroup}>
                  <View style={styles.specHeaderRow}>
                    <Palette size={14} color="#06b6d4" />
                    <Text style={styles.specLabel}>Available Colours</Text>
                  </View>
                  <View style={styles.chipsRow}>
                    {displayColors.map((c) => (
                      <View key={c} style={styles.specChip}>
                        <Text style={styles.specChipText}>{c}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Fulfillment */}
                <View style={styles.fulfillmentNotice}>
                  <Truck size={16} color="#06b6d4" />
                  <Text style={styles.fulfillmentNoticeText}>
                    {item.fulfillment === "pickup"
                      ? "📍 In-store pickup available at official hub"
                      : item.fulfillment === "delivery"
                      ? "🚚 Fast home delivery straight to your door"
                      : "🚚 Home Delivery and 📍 In-store Pick Up available"}
                  </Text>
                </View>
              </View>
            )}

            {/* SERVICE SPECIFIC: Mode, Availability, Location */}
            {!isProduct && (
              <View style={styles.specsSection}>
                {/* Mode */}
                <View style={styles.specGroup}>
                  <View style={styles.specHeaderRow}>
                    {item.mode === "virtual" ? (
                      <VideoIcon size={14} color="#06b6d4" />
                    ) : item.mode === "both" ? (
                      <Sparkles size={14} color="#06b6d4" />
                    ) : (
                      <Building size={14} color="#06b6d4" />
                    )}
                    <Text style={styles.specLabel}>Service Mode</Text>
                  </View>
                  <View style={styles.modeBadge}>
                    <Text style={styles.modeBadgeText}>
                      {item.mode === "virtual"
                        ? "Virtual / Online Consultation"
                        : item.mode === "both"
                        ? "Onsite / In-Person & Virtual"
                        : "Onsite / In-Person"}
                    </Text>
                  </View>
                </View>

                {/* Availability Days & Hours */}
                {item.availability ? (
                  <View style={styles.specGroup}>
                    <View style={styles.specHeaderRow}>
                      <Clock size={14} color="#06b6d4" />
                      <Text style={styles.specLabel}>Availability Days & Hours</Text>
                    </View>
                    <Text style={styles.specDetailText}>{item.availability}</Text>
                  </View>
                ) : null}

                {/* Location */}
                {(item.locationName || item.locationAddress) ? (
                  <View style={styles.specGroup}>
                    <View style={styles.specHeaderRow}>
                      <MapPin size={14} color="#06b6d4" />
                      <Text style={styles.specLabel}>Location / Facility</Text>
                    </View>
                    {item.locationName ? (
                      <Text style={[styles.specDetailText, { fontWeight: "700", color: "#ffffff" }]}>
                        {item.locationName}
                      </Text>
                    ) : null}
                    {item.locationAddress ? (
                      <Text style={styles.specDetailText}>{item.locationAddress}</Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            )}

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionTitle}>About this {isProduct ? "Product" : "Service"}</Text>
              <Text style={styles.descriptionText}>
                {item.description ||
                  (isProduct
                    ? "Premium quality pet supplies sourced from verified community sellers and breeders. Guaranteed authentic and pet-safe."
                    : "Certified pet wellness service designed to give your pet the best care and comfort. Flexible scheduling available.")}
              </Text>
            </View>
          </ScrollView>

          {/* Sticky Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.actionBtn, !isProduct && { backgroundColor: "#10b981" }]}
              onPress={() => {
                onClose();
                onAction();
              }}
              activeOpacity={0.85}
            >
              {isProduct ? (
                <>
                  <ShoppingBag size={18} color="#ffffff" />
                  <Text style={styles.actionBtnText}>Buy Now • {item.price}</Text>
                </>
              ) : (
                <>
                  <Calendar size={18} color="#ffffff" />
                  <Text style={styles.actionBtnText}>Book Service • {item.price}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
    borderWidth: 1,
    borderColor: "#1e293b",
    overflow: "hidden",
  },
  imageBox: {
    height: 200,
    width: "100%",
    position: "relative",
    backgroundColor: "#161b22",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlayGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(13, 17, 23, 0.4)",
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryPill: {
    position: "absolute",
    bottom: 12,
    left: 14,
    backgroundColor: "rgba(6, 182, 212, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
    textTransform: "uppercase",
  },
  scrollArea: {
    maxHeight: 460,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
  },
  titleSection: {
    marginBottom: 14,
  },
  itemTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
    lineHeight: 28,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  authorLabel: {
    fontSize: 13,
    color: "#94a3b8",
  },
  authorName: {
    color: "#e2e8f0",
    fontWeight: "600",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#161b22",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#f59e0b",
  },
  priceHighlightBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#161b22",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
    marginBottom: 16,
  },
  priceHighlightLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  boldPriceText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#06b6d4",
    marginTop: 2,
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#10b981",
  },
  specsSection: {
    marginBottom: 16,
    backgroundColor: "#161b22",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 12,
  },
  specGroup: {},
  specHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  specLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  specChip: {
    backgroundColor: "#0d1117",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  specChipText: {
    fontSize: 12,
    color: "#e2e8f0",
    fontWeight: "600",
  },
  fulfillmentNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(6, 182, 212, 0.08)",
    padding: 10,
    borderRadius: 10,
  },
  fulfillmentNoticeText: {
    fontSize: 12,
    color: "#06b6d4",
    flex: 1,
    lineHeight: 16,
  },
  modeBadge: {
    backgroundColor: "#0d1117",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
    alignSelf: "flex-start",
  },
  modeBadgeText: {
    fontSize: 12,
    color: "#06b6d4",
    fontWeight: "700",
  },
  specDetailText: {
    fontSize: 13,
    color: "#cbd5e1",
    lineHeight: 18,
    marginTop: 2,
  },
  descriptionSection: {
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    color: "#94a3b8",
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    backgroundColor: "#0d1117",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#06b6d4",
    borderRadius: 14,
    paddingVertical: 14,
  },
  actionBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
});

