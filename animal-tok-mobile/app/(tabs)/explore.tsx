import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
} from "react-native";
import {
  Search,
  TrendingUp,
  Flame,
  Play,
  Trophy,
  Gamepad2,
  Heart,
  Stethoscope,
  Calendar,
  ShoppingBag,
} from "lucide-react-native";
import { feedPosts, type FeedPost } from "@/data/feedData";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_ITEM_SIZE = (SCREEN_WIDTH - 44) / 2;

const CATEGORIES = ["All Pets", "🐕 Dogs", "🐈 Cats", "🦜 Birds", "🐇 Rabbits", "🦎 Exotic"];

const PILLAR_HUBS = [
  { id: "sports", label: "Sports & Agility", icon: Trophy, color: "#f59e0b", sub: "Races, Agility & Fetch", filter: "sports" },
  { id: "vet", label: "Vet Programs", icon: Stethoscope, color: "#10b981", sub: "Doctor Advice & Health", filter: "vet" },
  { id: "gaming", label: "Pet Gaming", icon: Gamepad2, color: "#8b5cf6", sub: "Interactive Play & Tricks", filter: "gaming" },
  { id: "mating", label: "Mating & Breeding", icon: Heart, color: "#ec4899", sub: "Pedigree Studs & Matches", filter: "mating" },
  { id: "events", label: "Events & Meetups", icon: Calendar, color: "#06b6d4", sub: "Park Days & Expos", route: "/(tabs)/events" },
  { id: "market", label: "Pet Marketplace", icon: ShoppingBag, color: "#3b82f6", sub: "Food, Toys & Grooming", route: "/(tabs)/marketplace" },
];

const HASHTAGS = [
  { tag: "#AgilityChampion", posts: "34.2K videos" },
  { tag: "#VetAdviceDaily", posts: "58.1K videos" },
  { tag: "#PetGamingZone", posts: "22.8K videos" },
  { tag: "#PuppyLove", posts: "98.1K videos" },
  { tag: "#CatZoomies", posts: "64.5K videos" },
  { tag: "#ParrotTricks", posts: "18.3K videos" },
  { tag: "#PedigreeMatch", posts: "12.7K videos" },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { activeProfile } = useAuth();
  const [selectedCat, setSelectedCat] = useState("All Pets");
  const [searchQuery, setSearchQuery] = useState("");
  const [explorePosts, setExplorePosts] = useState<FeedPost[]>(feedPosts);

  React.useEffect(() => {
    if (activeProfile?.id) {
      const shuffled = [...feedPosts].sort(() => Math.random() - 0.5);
      setExplorePosts(shuffled);
    }
  }, [activeProfile?.id]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <Text style={styles.pageTitle}>Explore & Discover</Text>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Search size={18} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pets, breeds, or #hashtags..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Pills Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCat === cat && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCat(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCat === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trending Hashtags Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Flame size={20} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Trending Hashtags</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hashtagScroll}
        >
          {HASHTAGS.map((item) => (
            <TouchableOpacity key={item.tag} style={styles.hashtagCard}>
              <Text style={styles.hashtagName}>{item.tag}</Text>
              <Text style={styles.hashtagCount}>{item.posts.replace(" videos", "")}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Animal Programs & Hubs (Sports, Vet, Gaming, Mating, Events, Market) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pet Hubs & Programs</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hubsScroll}
        >
          {PILLAR_HUBS.map((hub) => {
            const IconComp = hub.icon;
            return (
              <TouchableOpacity
                key={hub.id}
                style={[styles.hubCard, { borderColor: hub.color }]}
                onPress={() => {
                  if (hub.route) {
                    router.push(hub.route as any);
                  } else {
                    setSelectedCat(hub.label);
                  }
                }}
              >
                <View style={[styles.hubIconCircle, { backgroundColor: hub.color }]}>
                  <IconComp size={20} color="#ffffff" />
                </View>
                <Text style={styles.hubTitle}>{hub.label}</Text>
                <Text style={styles.hubSub}>{hub.sub}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Popular Videos Grid */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <TrendingUp size={20} color="#06b6d4" />
            <Text style={styles.sectionTitle}>Popular Today</Text>
          </View>
        </View>

        <View style={styles.mediaGrid}>
          {explorePosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.gridCard}
              onPress={() => router.push("/(tabs)/")}
            >
              <Image source={{ uri: post.posterUrl }} style={styles.gridImage} />
              <View style={styles.playOverlay}>
                <Play size={16} color="#ffffff" fill="#ffffff" />
                <Text style={styles.viewCount}>{post.likes} likes</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardAvatar}>{post.avatar}</Text>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {post.displayName}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  pageTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 10,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161b22",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    marginLeft: 10,
    fontSize: 14,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  categoryChipActive: {
    backgroundColor: "#06b6d4",
    borderColor: "#06b6d4",
  },
  categoryText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#ffffff",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
  },
  hashtagScroll: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 18,
  },
  hashtagCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#161b22",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  hashtagName: {
    color: "#06b6d4",
    fontSize: 13,
    fontWeight: "bold",
  },
  hashtagCount: {
    color: "#64748b",
    fontSize: 11,
    backgroundColor: "rgba(100, 116, 139, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCard: {
    width: "48.2%",
    aspectRatio: 0.72,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#161b22",
    position: "relative",
    marginBottom: 12,
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewCount: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  cardFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    backgroundColor: "rgba(13, 17, 23, 0.8)",
  },
  cardAvatar: {
    fontSize: 14,
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  hubsScroll: {
    gap: 12,
    paddingBottom: 8,
    marginBottom: 16,
  },
  hubCard: {
    width: 150,
    backgroundColor: "#161b22",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  hubIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  hubTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  hubSub: {
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 15,
  },
});
