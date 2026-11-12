import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import {
  ShieldCheck,
  PawPrint,
  Award,
  LogOut,
  Grid,
  Heart,
  Bookmark,
  Edit2,
  Camera,
  Play,
  X,
  Music,
  Video as VideoIcon,
  Plus,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/AuthContext";
import { feedPosts, FeedPost } from "@/data/feedData";
import { useRouter, useFocusEffect } from "expo-router";
import { api } from "@/services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_SIZE = (SCREEN_WIDTH - 48) / 3;

export default function ProfileScreen() {
  const router = useRouter();
  const { activeProfile, user, switchProfile, switchToHandler, logout, pets } = useAuth();
  const [activeTab, setActiveTab] = useState<"grid" | "likes" | "saved">("grid");

  const [loading, setLoading] = useState(true);
  const [profileStats, setProfileStats] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const isAnimal = activeProfile?.type === "animal";

  const formatNumber = (num?: number | string | null) => {
    const val = typeof num === "number" ? num : Number(num) || 0;
    if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
    if (val >= 1000) return (val / 1000).toFixed(1) + "K";
    return val.toString();
  };

  const fetchStats = async () => {
    setLoading(true);

    // 1. Gather all posts (feedPosts + locally persisted custom posts)
    let allPosts: any[] = [...feedPosts];
    try {
      const stored = await AsyncStorage.getItem("animaltok_custom_posts");
      if (stored) {
        const custom = JSON.parse(stored);
        if (Array.isArray(custom)) {
          custom.forEach((p) => {
            if (!allPosts.some((existing) => String(existing.id) === String(p.id))) {
              allPosts.unshift(p);
            }
          });
        }
      }
    } catch (e) {}

    // Also attempt fetching from server
    try {
      const serverPosts = await api.getFeedPosts(1, 40);
      if (serverPosts && Array.isArray(serverPosts)) {
        serverPosts.forEach((p) => {
          if (!allPosts.some((existing) => String(existing.id) === String(p.id))) {
            allPosts.push(p);
          }
        });
      }
    } catch (e) {}

    if (isAnimal && activeProfile) {
      let animalData: any = null;
      try {
        animalData = await api.getAnimalProfile(activeProfile.id);
      } catch (e) {}

      // Find all posts belonging to this animal
      const animalPosts = allPosts.filter((p: any) => {
        const pAnimalId = p.animalId ? String(p.animalId).toLowerCase() : "";
        const curId = String(activeProfile.id).toLowerCase();
        if (pAnimalId && (pAnimalId === curId || pAnimalId === curId.replace(/^a_/, ""))) return true;

        const pUser = (p.username || "").toLowerCase().replace(/^@/, "");
        const curUser = (activeProfile.username || "").toLowerCase().replace(/^@/, "");
        if (pUser && curUser && (pUser === curUser || pUser.includes(curUser) || curUser.includes(pUser))) return true;

        const pName = (p.displayName || "").toLowerCase();
        const curName = (activeProfile.name || "").toLowerCase();
        if (pName && curName && (pName === curName || pName.includes(curName) || curName.includes(pName))) return true;

        return false;
      });

      // Sum likes on pet's posts
      const totalLikes = animalPosts.reduce((acc: number, p: any) => acc + (Number(p.likes) || 0), 0);

      // Follower count: real for user's pet (0 for new pet), seed numbers only for seeded demo pets
      const isSeed = ["1", "2", "3", "bailey", "luna", "coco"].includes(String(activeProfile.id).toLowerCase());
      const followersCount = isSeed ? (animalData?.followers ?? 1200) : (animalData?.followers ?? 0);

      // Bio: DO NOT use Bailey's tennis ball bio for other pets!
      let petBio = activeProfile.bio;
      if (!petBio && animalData?.bio) {
        if (isSeed || !animalData.bio.includes("tennis balls")) {
          petBio = animalData.bio;
        }
      }
      if (!petBio) {
        petBio = `Loving life on AnimalTok! 🐾`;
      }

      // Photos from profile gallery if any
      const galleryPhotos =
        activeProfile.photos && activeProfile.photos.length > 0
          ? activeProfile.photos
          : animalData?.photos && isSeed
          ? animalData.photos
          : [];

      // Combine animal posts or fallback to gallery photos
      const displayPosts =
        animalPosts.length > 0
          ? animalPosts
          : galleryPhotos.map((photoUrl: string, idx: number) => ({
              id: `gallery_${idx}`,
              posterUrl: photoUrl,
              imageUrl: photoUrl,
              videoUrl: "",
              caption: `${activeProfile.name}'s Photo`,
              likes: 0,
              comments: 0,
            }));

      setProfileStats({
        followers: followersCount,
        following: 0,
        likes: totalLikes > 0 ? formatNumber(totalLikes) : isSeed ? animalData?.likes || "0" : "0",
        bio: petBio,
        coverImage:
          activeProfile.coverImage ||
          animalData?.coverImage ||
          "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80",
        photos: galleryPhotos,
        avatar: activeProfile.avatar || animalData?.avatar || "🐾",
        badges: [{ icon: "🏆", label: "Top Creator" }],
        posts: displayPosts,
      });
    } else if (user) {
      // Handler profile: collect posts from all pets managed by this handler
      const handlerPosts = allPosts.filter((p: any) => {
        return pets.some((pet) => {
          const petId = String(pet.id).toLowerCase();
          const pAnimalId = String(p.animalId || "").toLowerCase();
          if (pAnimalId && (pAnimalId === petId || pAnimalId === petId.replace(/^a_/, ""))) return true;

          const petUser = (pet.username || "").toLowerCase().replace(/^@/, "");
          const pUser = (p.username || "").toLowerCase().replace(/^@/, "");
          if (petUser && pUser && (petUser === pUser || pUser.includes(petUser))) return true;

          const petName = (pet.name || "").toLowerCase();
          const pName = (p.displayName || "").toLowerCase();
          if (petName && pName && (petName === pName || pName.includes(petName))) return true;

          return false;
        });
      });

      const totalLikes = handlerPosts.reduce((acc: number, p: any) => acc + (Number(p.likes) || 0), 0);

      setProfileStats({
        followers: 124,
        following: pets.length,
        likes: totalLikes > 0 ? formatNumber(totalLikes) : "0",
        bio: (user as any)?.bio || `Handler & parent of ${pets.map((p) => p.name).join(", ") || "pets"}! 🐾`,
        coverImage: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80",
        badges: [{ icon: "🛡️", label: "Verified Handler" }],
        posts: handlerPosts,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [activeProfile, user]);

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
    }, [activeProfile, user])
  );

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.push("/auth");
        },
      },
    ]);
  };

  const currentPosts = profileStats?.posts || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.topBar}>
          <Text style={styles.barTitle}>
            {isAnimal ? `${activeProfile?.name || "Animal"}'s Profile` : "Handler Profile"}
          </Text>
          <View style={styles.topBarActions}>
            <TouchableOpacity style={styles.editTopBtn} onPress={() => router.push("/edit-profile")}>
              <Edit2 size={13} color="#06b6d4" />
              <Text style={styles.editTopBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
              <LogOut size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Card Main */}
        <View style={styles.compactHeaderCard}>
          {/* Cover Photo Banner */}
          <View style={styles.cardCoverBox}>
            <Image
              source={{
                uri:
                  profileStats?.coverImage ||
                  activeProfile?.coverImage ||
                  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80",
              }}
              style={styles.cardCoverImg}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.cardCoverEditBtn}
              onPress={() => router.push("/edit-profile")}
              activeOpacity={0.8}
            >
              <Camera size={11} color="#ffffff" />
              <Text style={styles.cardCoverEditText}>Change Cover</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar (Left) + Stats (Right) */}
          <View style={styles.avatarAndStatsRow}>
            <View style={styles.avatarWrap}>
              {activeProfile?.avatar &&
              (activeProfile.avatar.startsWith("http") ||
                activeProfile.avatar.startsWith("data:") ||
                activeProfile.avatar.startsWith("file:")) ? (
                <Image source={{ uri: activeProfile.avatar }} style={styles.avatarPhoto} />
              ) : activeProfile?.photos && activeProfile.photos.length > 0 ? (
                <Image source={{ uri: activeProfile.photos[0] }} style={styles.avatarPhoto} />
              ) : (
                <Text style={{ fontSize: 36 }}>{activeProfile?.avatar || "🐾"}</Text>
              )}
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{formatNumber(profileStats?.followers || 0)}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profileStats?.following || 0}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profileStats?.likes || 0}</Text>
                <Text style={styles.statLabel}>Likes</Text>
              </View>
            </View>
          </View>

          {/* Name & Info */}
          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{activeProfile?.name}</Text>
              <View style={[styles.typePill, isAnimal ? styles.typePillAnimal : styles.typePillHandler]}>
                {isAnimal ? <PawPrint size={12} color="#06b6d4" /> : <ShieldCheck size={12} color="#8b5cf6" />}
                <Text style={[styles.typePillText, isAnimal ? { color: "#06b6d4" } : { color: "#8b5cf6" }]}>
                  {isAnimal ? "Verified Pet" : "Handler"}
                </Text>
              </View>
            </View>
            <Text style={styles.profileUsername}>{activeProfile?.username}</Text>
            {profileStats?.bio ? <Text style={styles.bioText}>{profileStats.bio}</Text> : null}
          </View>
        </View>

        {/* Switch Active Profile - Horizontal Selector */}
        <View style={styles.switchWrapper}>
          <Text style={styles.switchHeaderTitle}>SWITCH PROFILE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.switchScroll}>
            {/* Handler Option */}
            <TouchableOpacity
              style={[styles.switchChip, !isAnimal && styles.switchChipActive]}
              onPress={switchToHandler}
            >
              <ShieldCheck size={15} color={!isAnimal ? "#8b5cf6" : "#64748b"} />
              <Text style={[styles.switchChipText, !isAnimal && styles.switchChipTextActive]}>
                Handler ({user?.name ? user.name.split(" ")[0] : "Me"})
              </Text>
            </TouchableOpacity>

            {/* Animals List */}
            {pets.map((pet) => {
              const isSelected = activeProfile?.id === pet.id && isAnimal;
              return (
                <TouchableOpacity
                  key={pet.id}
                  style={[styles.switchChip, isSelected && styles.switchChipActive]}
                  onPress={() => switchProfile(pet)}
                >
                  {pet.avatar &&
                  (pet.avatar.startsWith("http") ||
                    pet.avatar.startsWith("data:") ||
                    pet.avatar.startsWith("file:")) ? (
                    <Image source={{ uri: pet.avatar }} style={styles.switchPetPhoto} />
                  ) : (
                    <Text style={{ fontSize: 15 }}>{pet.avatar || "🐾"}</Text>
                  )}
                  <Text style={[styles.switchChipText, isSelected && styles.switchChipTextActive]}>
                    {pet.name}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Add Pet */}
            <TouchableOpacity style={[styles.switchChip, styles.addPetChip]} onPress={() => router.push("/onboarding")}>
              <Plus size={14} color="#06b6d4" />
              <Text style={styles.addPetText}>Add Pet</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#06b6d4" style={{ marginTop: 24 }} />
        ) : (
          <>
            {/* Pet Achievements (if any) */}
            {profileStats?.badges && profileStats.badges.length > 0 && (
              <View style={styles.badgesCard}>
                <View style={styles.badgeHeader}>
                  <Award size={15} color="#f59e0b" />
                  <Text style={styles.badgeTitle}>Achievements & Badges</Text>
                </View>
                <View style={styles.badgeRow}>
                  {profileStats.badges.map((badge: any, i: number) => (
                    <View key={i} style={styles.badgeChip}>
                      <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                      <Text style={styles.badgeText}>{badge.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Media Grid Tabs: Grid (Posts) | Likes | Saved */}
            <View style={styles.gridTabRow}>
              <TouchableOpacity
                style={[styles.gridTabBtn, activeTab === "grid" && styles.gridTabActive]}
                onPress={() => setActiveTab("grid")}
              >
                <Grid size={18} color={activeTab === "grid" ? "#06b6d4" : "#64748b"} />
                <Text style={[styles.gridTabLabel, activeTab === "grid" && styles.gridTabLabelActive]}>
                  Posts ({currentPosts.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.gridTabBtn, activeTab === "likes" && styles.gridTabActive]}
                onPress={() => setActiveTab("likes")}
              >
                <Heart size={18} color={activeTab === "likes" ? "#ef4444" : "#64748b"} />
                <Text style={[styles.gridTabLabel, activeTab === "likes" && styles.gridTabLabelActive]}>Likes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.gridTabBtn, activeTab === "saved" && styles.gridTabActive]}
                onPress={() => setActiveTab("saved")}
              >
                <Bookmark size={18} color={activeTab === "saved" ? "#f59e0b" : "#64748b"} />
                <Text style={[styles.gridTabLabel, activeTab === "saved" && styles.gridTabLabelActive]}>Saved</Text>
              </TouchableOpacity>
            </View>

            {/* Media Grid Content */}
            {activeTab === "grid" ? (
              currentPosts.length > 0 ? (
                <View style={styles.grid}>
                  {currentPosts.map((post: any, idx: number) => {
                    const isVid = !!(
                      post.videoUrl ||
                      (post.posterUrl && post.posterUrl.match(/\.(mp4|mov|webm)$/i))
                    );
                    const mediaUri =
                      post.imageUrl || post.posterUrl || post.videoUrl || (typeof post === "string" ? post : "");

                    return (
                      <TouchableOpacity
                        key={post.id || idx}
                        style={styles.gridItem}
                        activeOpacity={0.85}
                        onPress={() => setSelectedPost(post)}
                      >
                        <Image source={{ uri: mediaUri }} style={styles.gridImg} resizeMode="cover" />

                        {/* Video Badge with Play icon */}
                        {isVid && (
                          <View style={styles.gridVideoBadge}>
                            <Play size={10} color="#ffffff" fill="#ffffff" />
                            <Text style={styles.gridVideoBadgeText}>
                              {post.likes ? formatNumber(post.likes) : "Clip"}
                            </Text>
                          </View>
                        )}

                        {/* Bottom caption overlay */}
                        {post.caption ? (
                          <View style={styles.gridCaptionOverlay}>
                            <Text style={styles.gridCaptionText} numberOfLines={1}>
                              {post.caption}
                            </Text>
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyPostsBox}>
                  <Text style={{ fontSize: 44, marginBottom: 10 }}>🎬</Text>
                  <Text style={styles.emptyPostsTitle}>No posts yet for {activeProfile?.name}</Text>
                  <Text style={styles.emptyPostsSub}>
                    Capture live pet videos or upload photos to showcase your pet!
                  </Text>
                  <TouchableOpacity style={styles.createPostBtn} onPress={() => router.push("/create")}>
                    <Plus size={16} color="#ffffff" />
                    <Text style={styles.createPostBtnText}>Create First Post</Text>
                  </TouchableOpacity>
                </View>
              )
            ) : activeTab === "likes" ? (
              <View style={styles.emptyTabBox}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>❤️</Text>
                <Text style={styles.emptyTabText}>No liked posts yet</Text>
              </View>
            ) : (
              <View style={styles.emptyTabBox}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🔖</Text>
                <Text style={styles.emptyTabText}>No saved bookmarks yet</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Fullscreen Post Detail / Viewer Modal */}
      {selectedPost && (
        <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setSelectedPost(null)}>
          <View style={styles.postModalBackdrop}>
            <View style={styles.postModalCard}>
              {/* Modal Top Bar */}
              <View style={styles.postModalHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 20 }}>{activeProfile?.avatar || "🐾"}</Text>
                  <View>
                    <Text style={styles.postModalAuthor}>{selectedPost.displayName || activeProfile?.name}</Text>
                    <Text style={styles.postModalUsername}>{selectedPost.username || activeProfile?.username}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.postModalCloseBtn} onPress={() => setSelectedPost(null)}>
                  <X size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Media Container */}
              <View style={styles.postModalMediaBox}>
                {selectedPost.videoUrl && Platform.OS === "web" ? (
                  <video
                    src={selectedPost.videoUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      backgroundColor: "#000",
                    }}
                  />
                ) : (
                  <Image
                    source={{
                      uri: selectedPost.imageUrl || selectedPost.posterUrl || selectedPost.videoUrl,
                    }}
                    style={styles.postModalImage}
                    resizeMode="cover"
                  />
                )}
              </View>

              {/* Caption & Metadata */}
              <View style={styles.postModalInfo}>
                {selectedPost.caption ? (
                  <Text style={styles.postModalCaption}>{selectedPost.caption}</Text>
                ) : null}
                {selectedPost.hashtags ? (
                  <Text style={styles.postModalHashtags}>{selectedPost.hashtags}</Text>
                ) : null}
                {selectedPost.audioName ? (
                  <View style={styles.postModalAudioRow}>
                    <Music size={13} color="#06b6d4" />
                    <Text style={styles.postModalAudioText} numberOfLines={1}>
                      {selectedPost.audioName}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.postModalStatsRow}>
                  <View style={styles.postModalStatItem}>
                    <Heart size={14} color="#ef4444" />
                    <Text style={styles.postModalStatText}>{formatNumber(selectedPost.likes || 0)} Likes</Text>
                  </View>
                  <Text style={styles.postModalTimeText}>{selectedPost.time || "Recently posted"}</Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  barTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  topBarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editTopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.35)",
  },
  editTopBtnText: {
    color: "#06b6d4",
    fontSize: 12,
    fontWeight: "bold",
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#161b22",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  compactHeaderCard: {
    backgroundColor: "#161b22",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 12,
    overflow: "hidden",
  },
  cardCoverBox: {
    height: 120,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#0d1117",
    marginBottom: -26,
  },
  cardCoverImg: {
    width: "100%",
    height: "100%",
  },
  cardCoverEditBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  cardCoverEditText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  avatarAndStatsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 6,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#161b22",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#06b6d4",
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 5,
  },
  avatarPhoto: {
    width: "100%",
    height: "100%",
    borderRadius: 33,
  },
  switchPetPhoto: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 6,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 22,
    backgroundColor: "#1e293b",
  },
  nameSection: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(30, 41, 59, 0.6)",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  profileUsername: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 1,
    marginBottom: 4,
  },
  typePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  typePillAnimal: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
  },
  typePillHandler: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
  },
  typePillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  bioText: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  switchWrapper: {
    marginBottom: 12,
  },
  switchHeaderTitle: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  switchScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  switchChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#161b22",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#1e293b",
  },
  switchChipActive: {
    borderColor: "#06b6d4",
    backgroundColor: "rgba(6, 182, 212, 0.18)",
  },
  switchChipText: {
    color: "#94a3b8",
    fontSize: 12,
  },
  switchChipTextActive: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  addPetChip: {
    borderStyle: "dashed",
    borderColor: "rgba(6, 182, 212, 0.4)",
    backgroundColor: "rgba(6, 182, 212, 0.05)",
  },
  addPetText: {
    color: "#06b6d4",
    fontSize: 12,
    fontWeight: "700",
  },
  badgesCard: {
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 12,
  },
  badgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  badgeTitle: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  badgeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#0d1117",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeEmoji: {
    fontSize: 12,
  },
  badgeText: {
    color: "#cbd5e1",
    fontSize: 11,
  },
  gridTabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    marginBottom: 12,
  },
  gridTabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  gridTabLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },
  gridTabLabelActive: {
    color: "#06b6d4",
    fontWeight: "800",
  },
  gridTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#06b6d4",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gridItem: {
    width: GRID_SIZE,
    height: GRID_SIZE * 1.35,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  gridImg: {
    width: "100%",
    height: "100%",
  },
  gridVideoBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  gridVideoBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  gridCaptionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  gridCaptionText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "600",
  },
  emptyPostsBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: "#161b22",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#21262d",
    borderStyle: "dashed",
    marginTop: 8,
  },
  emptyPostsTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  emptyPostsSub: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },
  createPostBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#06b6d4",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  createPostBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
  emptyTabBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyTabText: {
    color: "#64748b",
    fontSize: 13,
  },
  postModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  postModalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#161b22",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#30363d",
  },
  postModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#21262d",
  },
  postModalAuthor: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
  postModalUsername: {
    color: "#94a3b8",
    fontSize: 11,
  },
  postModalCloseBtn: {
    padding: 6,
  },
  postModalMediaBox: {
    width: "100%",
    height: 360,
    backgroundColor: "#000",
  },
  postModalImage: {
    width: "100%",
    height: "100%",
  },
  postModalInfo: {
    padding: 12,
  },
  postModalCaption: {
    color: "#ffffff",
    fontSize: 14,
    lineHeight: 19,
    marginBottom: 4,
  },
  postModalHashtags: {
    color: "#06b6d4",
    fontSize: 12,
    marginBottom: 8,
  },
  postModalAudioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  postModalAudioText: {
    color: "#94a3b8",
    fontSize: 11,
  },
  postModalStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#21262d",
  },
  postModalStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  postModalStatText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "600",
  },
  postModalTimeText: {
    color: "#64748b",
    fontSize: 11,
  },
});
