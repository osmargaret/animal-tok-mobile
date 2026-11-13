import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MessageCircle, Heart, ShieldCheck, MapPin, ArrowLeft } from "lucide-react-native";
import { api, type AnimalProfileData } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_SIZE = (SCREEN_WIDTH - 40) / 3;

export default function AnimalProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  const [animal, setAnimal] = useState<AnimalProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const profileId = id || "1";

    const loadData = async () => {
      setLoading(true);
      const [fetchedAnimal, followingStatus] = await Promise.all([
        api.getAnimalProfile(profileId),
        user ? api.checkIsFollowing(profileId, user.id) : Promise.resolve(false)
      ]);
      
      setAnimal(fetchedAnimal);
      setIsFollowing(followingStatus);
      setLoading(false);
    };
    
    loadData();

    // Subscribe to real-time websocket updates
    const socket = api.connectSocket(profileId);
    if (socket) {
      socket.on("followers_updated", (data: { animalId?: string; followerCount: number }) => {
        if (!data.animalId || data.animalId === profileId) {
          setAnimal(prev => prev ? { ...prev, followers: data.followerCount } : null);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("followers_updated");
        socket.disconnect();
      }
    };
  }, [id, user]);

  const handleFollow = async () => {
    if (!user) {
      router.push({ pathname: "/auth", params: { mode: "signup" } });
      return;
    }
    if (!animal || followLoading) return;
    
    const userId = user.id;

    // Optimistic UI Update
    setFollowLoading(true);
    const prevFollowing = isFollowing;
    const prevFollowers = typeof animal.followers === "number" ? animal.followers : ((animal as any).followersCount || 0);
    
    setIsFollowing(!prevFollowing);
    setAnimal({
      ...animal,
      followers: prevFollowing ? Math.max(0, prevFollowers - 1) : prevFollowers + 1
    });

    try {
      // Real API Call to persistent backend
      const result = await api.toggleFollow(animal.id, userId);
      
      // Reconcile exact state
      if (result) {
        setIsFollowing(result.isFollowing);
        setAnimal(prev => prev ? { ...prev, followers: result.followerCount } : null);
      }
    } catch (e) {
      // Revert if failed
      setIsFollowing(prevFollowing);
      setAnimal(prev => prev ? { ...prev, followers: prevFollowers } : null);
    } finally {
      setFollowLoading(false);
    }
  };

  const formatFollowers = (count?: number | null) => {
    const num = typeof count === "number" ? count : Number(count) || 0;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (loading || !animal) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cover Photo Banner */}
        <View style={styles.coverBox}>
          <Image 
            source={{ uri: animal.coverImage || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80" }} 
            style={styles.coverImg} 
          />
          
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>

          {/* Improved Face / Profile Avatar */}
          <View style={styles.avatarOverlay}>
            {animal.photos && animal.photos.length > 0 ? (
              <Image source={{ uri: animal.photos[0] }} style={styles.avatarPhoto} />
            ) : animal.avatar && (animal.avatar.startsWith("http") || animal.avatar.startsWith("data:")) ? (
              <Image source={{ uri: animal.avatar }} style={styles.avatarPhoto} />
            ) : (
              <Text style={{ fontSize: 40 }}>{animal.avatar || "🐾"}</Text>
            )}
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
            </View>
          </View>
        </View>

        {/* Info Header */}
        <View style={styles.infoCard}>
          <View style={styles.nameRow}>
            <Text style={styles.animalName}>{animal.name}</Text>
            <View style={styles.verifiedPetBadge}>
              <ShieldCheck size={12} color="#06b6d4" />
              <Text style={styles.verifiedPetText}>Verified Pet</Text>
            </View>
          </View>
          <Text style={styles.animalUsername}>{animal.username}</Text>

          {/* Micro Tag Pills */}
          <View style={styles.tagsRow}>
            <View style={styles.tagPill}>
              <Text style={styles.tagPillText}>{animal.breed || "Pet"}</Text>
            </View>
            <View style={styles.tagPill}>
              <Text style={styles.tagPillText}>{animal.age || "Friendly"}</Text>
            </View>
            <View style={[styles.tagPill, styles.tagPillFollowers]}>
              <Text style={styles.tagPillHighlight}>{formatFollowers(animal.followers ?? (animal as any).followersCount)} Followers</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <MapPin size={13} color="#06b6d4" />
            <Text style={styles.locationText}>{animal.location}</Text>
          </View>

          <Text style={styles.bio}>{animal.bio}</Text>

          {/* Action Buttons - Smaller, Thinner & Sleeker Pills */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.followBtn, isFollowing && styles.followingBtn]} 
              onPress={handleFollow}
              disabled={followLoading}
            >
              <Heart size={14} color={isFollowing ? "#ef4444" : "#ffffff"} fill={isFollowing ? "#ef4444" : "transparent"} />
              <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.messageBtn}
              onPress={() => {
                if (!user) {
                  router.push({ pathname: "/auth", params: { mode: "signup" } });
                  return;
                }
                const currentUserId = user.id;
                const threadId = `t_${animal.id}_${currentUserId}`;
                const handlerTitle = `${animal.name}'s Handler (${animal.handler || animal.handlerName || "Handler"})`;
                router.push({
                  pathname: "/(tabs)/message/[id]",
                  params: {
                    id: threadId,
                    recipientId: animal.handlerId || "u_1",
                    name: handlerTitle,
                    avatar: animal.avatar || "🐾",
                    animalId: animal.id,
                  },
                });
              }}
            >
              <MessageCircle size={14} color="#ffffff" />
              <Text style={styles.messageBtnText}>Message Handler</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Handler Details Card */}
        <View style={styles.handlerCard}>
          <ShieldCheck size={20} color="#8b5cf6" />
          <View style={{ flex: 1 }}>
            <Text style={styles.handlerLabel}>Primary Handler</Text>
            <Text style={styles.handlerName}>{animal.handler}</Text>
          </View>
          <Text style={styles.verifiedText}>Verified Owner ✓</Text>
        </View>

        {/* Photos Gallery */}
        <Text style={styles.sectionTitle}>Photo Gallery</Text>
        <View style={styles.grid}>
          {(animal.photos || []).map((img: string, idx: number) => (
            <View key={idx} style={styles.gridItem}>
              <Image source={{ uri: img }} style={styles.gridImg} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  coverBox: {
    height: 180,
    position: "relative",
    backgroundColor: "#161b22",
  },
  coverImg: {
    width: "100%",
    height: "100%",
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
  avatarOverlay: {
    position: "absolute",
    bottom: -36,
    left: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#161b22",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#06b6d4",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  avatarPhoto: {
    width: "100%",
    height: "100%",
    borderRadius: 37,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#0d1117",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10b981",
  },
  infoCard: {
    marginTop: 44,
    paddingHorizontal: 20,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  animalName: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
  },
  verifiedPetBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
  },
  verifiedPetText: {
    color: "#06b6d4",
    fontSize: 11,
    fontWeight: "700",
  },
  animalUsername: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  tagPill: {
    backgroundColor: "#161b22",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  tagPillFollowers: {
    borderColor: "rgba(6, 182, 212, 0.3)",
    backgroundColor: "rgba(6, 182, 212, 0.08)",
  },
  tagPillText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "500",
  },
  tagPillHighlight: {
    color: "#06b6d4",
    fontSize: 11,
    fontWeight: "700",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  locationText: {
    color: "#64748b",
    fontSize: 13,
  },
  bio: {
    color: "#e2e8f0",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  followBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ef4444",
    height: 35,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  followingBtn: {
    backgroundColor: "transparent",
    borderColor: "#ef4444",
  },
  followBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  followingBtnText: {
    color: "#ef4444",
  },
  messageBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#06b6d4",
    height: 35,
    borderRadius: 18,
  },
  messageBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  handlerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#161b22",
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 20,
  },
  handlerLabel: {
    color: "#64748b",
    fontSize: 11,
  },
  handlerName: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  verifiedText: {
    color: "#8b5cf6",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
  },
  gridItem: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    borderRadius: 10,
    overflow: "hidden",
  },
  gridImg: {
    width: "100%",
    height: "100%",
  },
});
