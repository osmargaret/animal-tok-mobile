import React, { useState, useMemo } from "react";
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
  Alert,
} from "react-native";
import {
  Search,
  TrendingUp,
  Flame,
  Play,
  Trophy,
  Heart,
  Calendar,
  ShoppingBag,
  MapPin,
  Users,
  Check,
  Star,
  Sparkles,
  Scissors,
  GraduationCap,
  Package,
  Wrench,
  X,
  ChevronDown,
  Plus,
} from "lucide-react-native";
import { feedPosts, type FeedPost } from "@/data/feedData";
import { marketProducts, marketServices, type ProductItem, type ServiceItem } from "@/data/marketData";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import HostEventModal from "@/components/HostEventModal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Main 3 Tabs
type ExploreTab = "trending" | "events" | "marketplace";

// Pet Type Filters
const PET_FILTERS = [
  { id: "all", label: "All Pets", icon: "🐾" },
  { id: "dog", label: "Dogs", icon: "🐕" },
  { id: "cat", label: "Cats", icon: "🐈" },
  { id: "bird", label: "Birds", icon: "🦜" },
  { id: "rabbit", label: "Rabbits", icon: "🐇" },
  { id: "exotic", label: "Exotic", icon: "🦎" },
  { id: "horse", label: "Horses", icon: "🐎" },
];

// Tab-specific categories
const TRENDING_CATEGORIES = [
  { id: "all", label: "All Trending" },
  { id: "viral", label: "⚡ Viral Hits" },
  { id: "sports", label: "🏆 Sports & Agility" },
  { id: "mating", label: "❤️ Mating & Breeding" },
  { id: "funny", label: "😂 Funny & Fails" },
  { id: "tricks", label: "🎾 Tricks & Skills" },
  { id: "cute", label: "🍼 Cute & Puppies" },
];

const EVENT_CATEGORIES = [
  { id: "all", label: "All Events" },
  { id: "mating", label: "❤️ Mating & Breeding" },
  { id: "sports", label: "🏆 Sports & Agility" },
  { id: "meetup", label: "🐾 Meetups & Play" },
  { id: "adoption", label: "🏠 Adoptions & Rescues" },
  { id: "contest", label: "🎉 Contests & Shows" },
];

const MARKET_CATEGORIES = [
  { id: "all", label: "All Items" },
  { id: "products", label: "📦 Products" },
  { id: "services", label: "🛎️ Services" },
  { id: "food", label: "🥩 Food & Treats" },
  { id: "toys", label: "🧸 Toys & Gear" },
  { id: "grooming", label: "✨ Grooming & Spa" },
  { id: "training", label: "🎓 Training" },
];

// Extended events data with pet type & category tags
interface ExploreEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  category: "mating" | "sports" | "meetup" | "adoption" | "contest";
  categoryLabel: string;
  petType: "dog" | "cat" | "bird" | "rabbit" | "exotic" | "all";
  description: string;
  image: string;
}

const EXPLORE_EVENTS: ExploreEvent[] = [
  {
    id: "e1",
    title: "Golden & Doodle Pedigree Mating Meetup ❤️",
    date: "Saturday, Nov 22 • 11:00 AM",
    location: "Cedar Creek Canine Estate, Austin TX",
    attendees: 38,
    category: "mating",
    categoryLabel: "Mating & Breeding",
    petType: "dog",
    description: "Pedigree certified stud dogs and dam meetups with on-site genetic verification and health clearances.",
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&fit=crop",
  },
  {
    id: "e2",
    title: "National Pet Agility & Sprint Cup 🏆",
    date: "Sunday, Nov 29 • 9:00 AM",
    location: "Zilker Metro Park, Austin TX",
    attendees: 112,
    category: "sports",
    categoryLabel: "Sports & Agility",
    petType: "dog",
    description: "Timed obstacle course, flyball tournaments, and high-jump competitions with medals for all skill tiers.",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&fit=crop",
  },
  {
    id: "e3",
    title: "Central Feline Championship & Cat Social 🐈",
    date: "Saturday, Dec 5 • 1:00 PM",
    location: "Civic Pavilion Expo Hall",
    attendees: 74,
    category: "contest",
    categoryLabel: "Contests & Shows",
    petType: "cat",
    description: "Pedigree cat beauty showcase, agility climbing trials, and luxury feline pampering lounge.",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&fit=crop",
  },
  {
    id: "e4",
    title: "Parrot & Exotic Bird Flight Encounter 🦜",
    date: "Sunday, Dec 13 • 10:30 AM",
    location: "Botanical Flight Atrium",
    attendees: 45,
    category: "meetup",
    categoryLabel: "Meetups & Play",
    petType: "bird",
    description: "Indoor free-flight socializing, harness training workshops, and exotic bird nutrition talks.",
    image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&fit=crop",
  },
  {
    id: "e5",
    title: "Clear the Shelters Mega Adoption Fair 🏠",
    date: "Saturday, Dec 19 • 10:00 AM",
    location: "Town Lake Animal Center",
    attendees: 210,
    category: "adoption",
    categoryLabel: "Adoptions & Rescues",
    petType: "all",
    description: "Over 150 dogs, cats, rabbits, and small pets looking for forever homes. Vaccinations & microchips included.",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&fit=crop",
  },
  {
    id: "e6",
    title: "Bengal & Ragdoll Stud Matching Gala ❤️",
    date: "Sunday, Jan 10 • 2:00 PM",
    location: "Hill Country Pet Resort",
    attendees: 31,
    category: "mating",
    categoryLabel: "Mating & Breeding",
    petType: "cat",
    description: "Purebred Bengal and Ragdoll registered breeders showcase and pedigree documentation exchange.",
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&fit=crop",
  },
];

// Hashtags for trending tab
const TRENDING_HASHTAGS = [
  { tag: "#AgilityChampion", posts: "42.8K" },
  { tag: "#PuppyZoomies", posts: "91.2K" },
  { tag: "#CatNinja", posts: "56.4K" },
  { tag: "#PedigreeStuds", posts: "18.7K" },
  { tag: "#BirdTalk", posts: "24.1K" },
  { tag: "#SmartPaws", posts: "33.9K" },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { activeProfile } = useAuth();

  // Selected state
  const [activeTab, setActiveTab] = useState<ExploreTab>("trending");
  const [selectedPetFilter, setSelectedPetFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rsvps, setRsvps] = useState<Record<string, boolean>>({});
  const [petDropdownOpen, setPetDropdownOpen] = useState(false);
  const [eventsList, setEventsList] = useState<ExploreEvent[]>(EXPLORE_EVENTS);
  const [hostModalVisible, setHostModalVisible] = useState(false);

  const currentPet = useMemo(
    () => PET_FILTERS.find((p) => p.id === selectedPetFilter) || PET_FILTERS[0],
    [selectedPetFilter]
  );

  // Reset category when switching tabs
  const handleTabChange = (tab: ExploreTab) => {
    setActiveTab(tab);
    setSelectedCategory("all");
  };

  const toggleRsvp = (eventId: string, title: string) => {
    const nextState = !rsvps[eventId];
    setRsvps((prev) => ({ ...prev, [eventId]: nextState }));
    Alert.alert(
      nextState ? "RSVP Confirmed! 🎉" : "RSVP Cancelled",
      nextState
        ? `You are now on the attendee list for "${title}". We'll remind you 24 hours prior.`
        : `You have removed your reservation for "${title}".`
    );
  };

  const handleBuyProduct = (item: ProductItem) => {
    const threadId = `trade_${(item.seller || "seller").toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    router.push({
      pathname: "/(tabs)/message/[id]",
      params: {
        id: threadId,
        name: item.seller || "Pet Shop Seller",
        avatar: "🛍️",
        itemTitle: item.name,
        itemPrice: item.price,
        itemType: "product",
        itemImage: item.image,
        initialMessage: `Hi! I would like to buy "${item.name}" (${item.price}). Is it available?`,
      },
    });
  };

  const handleBookService = (item: ServiceItem) => {
    const threadId = `booking_${(item.provider || "provider").toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    router.push({
      pathname: "/(tabs)/message/[id]",
      params: {
        id: threadId,
        name: item.provider || "Service Provider",
        avatar: "👨‍⚕️",
        itemTitle: item.name,
        itemPrice: item.price,
        itemType: "service",
        itemImage: item.image,
        initialMessage: `Hello! I would like to book your "${item.name}" service (${item.price}). When is your earliest opening?`,
      },
    });
  };

  // Filtered Trending Posts
  const filteredPosts = useMemo(() => {
    return feedPosts.filter((post) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.hashtags.toLowerCase().includes(searchQuery.toLowerCase());

      // Pet Type filter
      let matchesPet = true;
      if (selectedPetFilter === "dog") {
        matchesPet = post.avatar === "🐕" || /dog|pup|retriever|husky|lab/i.test(post.caption + post.hashtags);
      } else if (selectedPetFilter === "cat") {
        matchesPet = post.avatar === "🐈" || /cat|feline|kitten|maine/i.test(post.caption + post.hashtags);
      } else if (selectedPetFilter === "bird") {
        matchesPet = post.avatar === "🦜" || /bird|parrot|avian/i.test(post.caption + post.hashtags);
      } else if (selectedPetFilter === "rabbit") {
        matchesPet = post.avatar === "🐇" || /rabbit|bunny/i.test(post.caption + post.hashtags);
      } else if (selectedPetFilter === "exotic") {
        matchesPet = /reptile|gecko|snake|exotic/i.test(post.caption + post.hashtags);
      }

      // Category filter
      let matchesCategory = true;
      if (selectedCategory === "sports") {
        matchesCategory = /sport|agility|run|park|fetch|jump/i.test(post.caption + post.hashtags);
      } else if (selectedCategory === "mating") {
        matchesCategory = /mate|pedigree|breed|champion/i.test(post.caption + post.hashtags);
      } else if (selectedCategory === "viral") {
        matchesCategory = post.likes > 2000;
      } else if (selectedCategory === "funny") {
        matchesCategory = /funny|box|fail|derp|haha|smile/i.test(post.caption + post.hashtags);
      } else if (selectedCategory === "tricks") {
        matchesCategory = /trick|skill|clever|smart/i.test(post.caption + post.hashtags);
      } else if (selectedCategory === "cute") {
        matchesCategory = /cute|baby|puppy|kitten|sweet/i.test(post.caption + post.hashtags);
      }

      return matchesSearch && matchesPet && matchesCategory;
    });
  }, [searchQuery, selectedPetFilter, selectedCategory]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return eventsList.filter((evt) => {
      // Search
      const matchesSearch =
        !searchQuery ||
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Pet Type
      const matchesPet =
        selectedPetFilter === "all" ||
        evt.petType === "all" ||
        evt.petType === selectedPetFilter;

      // Category
      const matchesCategory =
        selectedCategory === "all" || evt.category === selectedCategory;

      return matchesSearch && matchesPet && matchesCategory;
    });
  }, [searchQuery, selectedPetFilter, selectedCategory]);

  // Filtered Marketplace (Products & Services)
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "services" || selectedCategory === "grooming" || selectedCategory === "training") {
      return [];
    }
    return marketProducts.filter((prod) => {
      const matchesSearch =
        !searchQuery ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Pet Type
      let matchesPet = true;
      if (selectedPetFilter === "dog") {
        matchesPet = !/feather|cat/i.test(prod.name + prod.category);
      } else if (selectedPetFilter === "cat") {
        matchesPet = !/collar|bark/i.test(prod.name) || /feather|feline|cat/i.test(prod.name + prod.seller);
      }

      // Category
      let matchesCategory = true;
      if (selectedCategory === "food") {
        matchesCategory = /food|treat/i.test(prod.category);
      } else if (selectedCategory === "toys") {
        matchesCategory = /toy|wand|interactive/i.test(prod.category + prod.name);
      }

      return matchesSearch && matchesPet && matchesCategory;
    });
  }, [searchQuery, selectedPetFilter, selectedCategory]);

  const filteredServices = useMemo(() => {
    if (selectedCategory === "products" || selectedCategory === "food" || selectedCategory === "toys") {
      return [];
    }
    return marketServices.filter((srv) => {
      const matchesSearch =
        !searchQuery ||
        srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.provider.toLowerCase().includes(searchQuery.toLowerCase());

      // Pet Type
      let matchesPet = true;
      if (selectedPetFilter === "cat") {
        matchesPet = !/puppy|canine|bark/i.test(srv.name + srv.provider);
      }

      // Category
      let matchesCategory = true;
      if (selectedCategory === "grooming") {
        matchesCategory = /groom|spa|bath/i.test(srv.name);
      } else if (selectedCategory === "training") {
        matchesCategory = /train|behavior|academy/i.test(srv.name);
      }

      return matchesSearch && matchesPet && matchesCategory;
    });
  }, [searchQuery, selectedPetFilter, selectedCategory]);

  // Active Category list
  const currentCategories =
    activeTab === "trending"
      ? TRENDING_CATEGORIES
      : activeTab === "events"
      ? EVENT_CATEGORIES
      : MARKET_CATEGORIES;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScrollBeginDrag={() => setPetDropdownOpen(false)}
      >
        
        {/* Top Header */}
        <View style={styles.topHeader}>
          <Text style={styles.pageTitle}>Explore</Text>
          <Text style={styles.pageSub}>Discover trending pets, live events & marketplace</Text>
        </View>

        {/* Search & Pet Filter Input Group */}
        <View style={styles.inputGroupWrapper}>
          <View style={styles.inputGroupContainer}>
            {/* Left: Search Bar */}
            <View style={styles.searchLeftBox}>
              <Search size={17} color="#94a3b8" />
              <TextInput
                style={styles.searchInput}
                placeholder={
                  activeTab === "trending"
                    ? "Search videos, tags, pets..."
                    : activeTab === "events"
                    ? "Search mating, agility, events..."
                    : "Search products, grooming..."
                }
                placeholderTextColor="#64748b"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setPetDropdownOpen(false)}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={15} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Input Group Divider */}
            <View style={styles.inputGroupDivider} />

            {/* Right: Pet Filter Dropdown Trigger */}
            <TouchableOpacity
              style={[styles.dropdownTrigger, petDropdownOpen && styles.dropdownTriggerActive]}
              onPress={() => setPetDropdownOpen(!petDropdownOpen)}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownTriggerIcon}>{currentPet.icon}</Text>
              <Text style={styles.dropdownTriggerText} numberOfLines={1}>
                {currentPet.label}
              </Text>
              <ChevronDown
                size={14}
                color={selectedPetFilter !== "all" ? "#06b6d4" : "#94a3b8"}
                style={petDropdownOpen ? { transform: [{ rotate: "180deg" }] } : undefined}
              />
            </TouchableOpacity>
          </View>

          {/* Floating Dropdown Menu Options */}
          {petDropdownOpen && (
            <View style={styles.dropdownMenu}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownHeaderText}>Select Pet Species</Text>
              </View>
              {PET_FILTERS.map((pet) => {
                const isSelected = selectedPetFilter === pet.id;
                return (
                  <TouchableOpacity
                    key={pet.id}
                    style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                    onPress={() => {
                      setSelectedPetFilter(pet.id);
                      setPetDropdownOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dropdownItemIcon}>{pet.icon}</Text>
                    <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextActive]}>
                      {pet.label}
                    </Text>
                    {isSelected && <Check size={14} color="#06b6d4" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* 3 Main Tabs: Trending | Events | Marketplace */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "trending" && styles.tabButtonActive]}
            onPress={() => {
              setPetDropdownOpen(false);
              handleTabChange("trending");
            }}
          >
            <Flame size={16} color={activeTab === "trending" ? "#06b6d4" : "#94a3b8"} />
            <Text style={[styles.tabButtonText, activeTab === "trending" && styles.tabButtonTextActive]}>
              Trending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "events" && styles.tabButtonActive]}
            onPress={() => {
              setPetDropdownOpen(false);
              handleTabChange("events");
            }}
          >
            <Calendar size={16} color={activeTab === "events" ? "#06b6d4" : "#94a3b8"} />
            <Text style={[styles.tabButtonText, activeTab === "events" && styles.tabButtonTextActive]}>
              Events
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "marketplace" && styles.tabButtonActive]}
            onPress={() => {
              setPetDropdownOpen(false);
              handleTabChange("marketplace");
            }}
          >
            <ShoppingBag size={16} color={activeTab === "marketplace" ? "#06b6d4" : "#94a3b8"} />
            <Text style={[styles.tabButtonText, activeTab === "marketplace" && styles.tabButtonTextActive]}>
              Marketplace
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Row (Tab-Specific Categories) */}
        <View style={styles.categorySection}>
          <Text style={styles.filterSectionLabel}>Categories:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {currentCategories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ============================================================== */}
        {/* TAB 1: TRENDING TAB CONTENT                                    */}
        {/* ============================================================== */}
        {activeTab === "trending" && (
          <View style={styles.tabContentContainer}>
            {/* Trending Hashtags Bar */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Flame size={18} color="#f59e0b" />
                <Text style={styles.sectionTitle}>Trending Tags</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hashtagScroll}>
              {TRENDING_HASHTAGS.map((item) => (
                <TouchableOpacity
                  key={item.tag}
                  style={styles.hashtagCard}
                  onPress={() => setSearchQuery(item.tag)}
                >
                  <Text style={styles.hashtagName}>{item.tag}</Text>
                  <Text style={styles.hashtagCount}>{item.posts}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Video Posts Grid */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <TrendingUp size={18} color="#06b6d4" />
                <Text style={styles.sectionTitle}>
                  {selectedCategory !== "all"
                    ? currentCategories.find((c) => c.id === selectedCategory)?.label
                    : "Popular Videos"}
                </Text>
              </View>
              <Text style={styles.resultsCount}>{filteredPosts.length} videos</Text>
            </View>

            {filteredPosts.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>🐾</Text>
                <Text style={styles.emptyTitle}>No trending videos found</Text>
                <Text style={styles.emptySub}>Try clearing filters or search terms</Text>
              </View>
            ) : (
              <View style={styles.mediaGrid}>
                {filteredPosts.map((post) => (
                  <TouchableOpacity
                    key={post.id}
                    style={styles.gridCard}
                    onPress={() => router.push("/(tabs)/")}
                  >
                    <Image source={{ uri: post.posterUrl }} style={styles.gridImage} />
                    <View style={styles.playOverlay}>
                      <Play size={13} color="#ffffff" fill="#ffffff" />
                      <Text style={styles.viewCount}>{post.likes} likes</Text>
                    </View>
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardAvatar}>{post.avatar}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {post.displayName}
                        </Text>
                        <Text style={styles.cardCaption} numberOfLines={1}>
                          {post.caption}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ============================================================== */}
        {/* TAB 2: EVENTS TAB CONTENT                                      */}
        {/* ============================================================== */}
        {activeTab === "events" && (
          <View style={styles.tabContentContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Calendar size={18} color="#06b6d4" />
                <Text style={styles.sectionTitle}>Upcoming Pet Events</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <TouchableOpacity
                  style={styles.hostEventBtn}
                  onPress={() => setHostModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Plus size={13} color="#ffffff" />
                  <Text style={styles.hostEventBtnText}>Host Event</Text>
                </TouchableOpacity>
                <Text style={styles.resultsCount}>{filteredEvents.length} events</Text>
              </View>
            </View>

            {filteredEvents.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>📅</Text>
                <Text style={styles.emptyTitle}>No events matching criteria</Text>
                <Text style={styles.emptySub}>Select "All Pets" or "All Events" to view all schedule</Text>
              </View>
            ) : (
              <View style={styles.eventsList}>
                {filteredEvents.map((event) => {
                  const isAttending = !!rsvps[event.id];
                  const categoryBadgeColor =
                    event.category === "mating"
                      ? "#ec4899"
                      : event.category === "sports"
                      ? "#f59e0b"
                      : event.category === "contest"
                      ? "#8b5cf6"
                      : "#06b6d4";

                  return (
                    <View key={event.id} style={styles.eventCard}>
                      <Image source={{ uri: event.image }} style={styles.eventImage} />
                      <View style={styles.eventBody}>
                        {/* Badges Row */}
                        <View style={styles.eventBadgeRow}>
                          <View style={[styles.categoryBadge, { backgroundColor: `${categoryBadgeColor}20`, borderColor: categoryBadgeColor }]}>
                            <Text style={[styles.categoryBadgeText, { color: categoryBadgeColor }]}>
                              {event.categoryLabel}
                            </Text>
                          </View>
                          <View style={styles.petTypeBadge}>
                            <Text style={styles.petTypeBadgeText}>
                              {event.petType === "dog" ? "🐕 Dog" : event.petType === "cat" ? "🐈 Cat" : event.petType === "bird" ? "🦜 Bird" : "🐾 All Pets"}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <Text style={styles.eventDesc} numberOfLines={2}>
                          {event.description}
                        </Text>

                        {/* Date & Location */}
                        <View style={styles.eventMetaRow}>
                          <Calendar size={14} color="#06b6d4" />
                          <Text style={styles.eventMetaText}>{event.date}</Text>
                        </View>

                        <View style={styles.eventMetaRow}>
                          <MapPin size={14} color="#64748b" />
                          <Text style={styles.eventMetaText} numberOfLines={1}>{event.location}</Text>
                        </View>

                        {/* Bottom Actions */}
                        <View style={styles.eventFooterRow}>
                          <View style={styles.attendeesBox}>
                            <Users size={14} color="#94a3b8" />
                            <Text style={styles.attendeesText}>
                              {event.attendees + (isAttending ? 1 : 0)} attending
                            </Text>
                          </View>

                          <TouchableOpacity
                            style={[styles.rsvpButton, isAttending && styles.rsvpButtonActive]}
                            onPress={() => toggleRsvp(event.id, event.title)}
                          >
                            {isAttending ? (
                              <>
                                <Check size={14} color="#ffffff" />
                                <Text style={styles.rsvpButtonTextActive}>Going</Text>
                              </>
                            ) : (
                              <Text style={styles.rsvpButtonText}>RSVP</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ============================================================== */}
        {/* TAB 3: MARKETPLACE TAB CONTENT                                 */}
        {/* ============================================================== */}
        {activeTab === "marketplace" && (
          <View style={styles.tabContentContainer}>
            {/* Products Section */}
            {filteredProducts.length > 0 && (
              <View style={styles.marketGroup}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Package size={18} color="#06b6d4" />
                    <Text style={styles.sectionTitle}>Featured Products</Text>
                  </View>
                  <Text style={styles.resultsCount}>{filteredProducts.length} items</Text>
                </View>

                <View style={styles.productsGrid}>
                  {filteredProducts.map((prod) => (
                    <View key={prod.id} style={styles.productCard}>
                      <Image source={{ uri: prod.image }} style={styles.productImage} />
                      <View style={styles.productBody}>
                        <Text style={styles.productTag}>{prod.category}</Text>
                        <Text style={styles.productName} numberOfLines={1}>{prod.name}</Text>
                        <Text style={styles.productSeller} numberOfLines={1}>by {prod.seller}</Text>

                        <View style={styles.productPriceRow}>
                          <Text style={styles.productPrice}>{prod.price}</Text>
                          <View style={styles.ratingBox}>
                            <Star size={11} color="#f59e0b" fill="#f59e0b" />
                            <Text style={styles.ratingText}>{prod.rating}</Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          style={styles.buyButton}
                          onPress={() => handleBuyProduct(prod)}
                        >
                          <ShoppingBag size={13} color="#ffffff" />
                          <Text style={styles.buyButtonText}>Buy Now</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Services Section */}
            {filteredServices.length > 0 && (
              <View style={[styles.marketGroup, { marginTop: 16 }]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Wrench size={18} color="#10b981" />
                    <Text style={styles.sectionTitle}>Professional Services</Text>
                  </View>
                  <Text style={styles.resultsCount}>{filteredServices.length} services</Text>
                </View>

                <View style={styles.servicesList}>
                  {filteredServices.map((srv) => (
                    <View key={srv.id} style={styles.serviceCard}>
                      <Image source={{ uri: srv.image }} style={styles.serviceImage} />
                      <View style={styles.serviceBody}>
                        <Text style={styles.serviceName}>{srv.name}</Text>
                        <Text style={styles.serviceProvider}>Provider: {srv.provider}</Text>

                        <View style={styles.servicePriceRow}>
                          <Text style={styles.servicePrice}>{srv.price}</Text>
                          <View style={styles.ratingBox}>
                            <Star size={11} color="#f59e0b" fill="#f59e0b" />
                            <Text style={styles.ratingText}>{srv.rating}</Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          style={styles.bookButton}
                          onPress={() => handleBookService(srv)}
                        >
                          <Calendar size={13} color="#ffffff" />
                          <Text style={styles.bookButtonText}>Book Service</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {filteredProducts.length === 0 && filteredServices.length === 0 && (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>🛍️</Text>
                <Text style={styles.emptyTitle}>No marketplace items found</Text>
                <Text style={styles.emptySub}>Try adjusting your pet filter or category pills</Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>

      {/* Host Event Modal */}
      <HostEventModal
        visible={hostModalVisible}
        onClose={() => setHostModalVisible(false)}
        onEventCreated={(newEvent) => {
          setEventsList((prev) => [
            {
              id: newEvent.id,
              title: newEvent.title,
              date: newEvent.date,
              location: newEvent.location,
              attendees: newEvent.attendeesCount || 1,
              category: (newEvent.category?.toLowerCase() || "meetup") as any,
              categoryLabel: newEvent.category || "Meetup",
              petType: (newEvent.petType?.toLowerCase() || "all") as any,
              description: newEvent.description || "",
              image: newEvent.image || "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&fit=crop",
            },
            ...prev,
          ]);
        }}
      />
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
    paddingBottom: 50,
  },
  topHeader: {
    marginTop: 8,
    marginBottom: 12,
  },
  pageTitle: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "900",
  },
  pageSub: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 2,
  },
  // Input Group & Dropdown Styles
  inputGroupWrapper: {
    position: "relative",
    zIndex: 999,
    marginBottom: 14,
  },
  inputGroupContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161b22",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    height: 48,
    paddingHorizontal: 12,
  },
  searchLeftBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 13,
    paddingVertical: 0,
  },
  inputGroupDivider: {
    width: 1,
    height: 22,
    backgroundColor: "#334155",
    marginHorizontal: 8,
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "rgba(30, 41, 59, 0.4)",
    maxWidth: 130,
  },
  dropdownTriggerActive: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    borderWidth: 1,
    borderColor: "#06b6d4",
  },
  dropdownTriggerIcon: {
    fontSize: 14,
  },
  dropdownTriggerText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "600",
  },
  dropdownMenu: {
    position: "absolute",
    top: 54,
    right: 0,
    width: 195,
    backgroundColor: "#161b22",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 20,
    zIndex: 1000,
  },
  dropdownHeader: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    marginBottom: 4,
  },
  dropdownHeaderText: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  dropdownItemActive: {
    backgroundColor: "rgba(6, 182, 212, 0.12)",
  },
  dropdownItemIcon: {
    fontSize: 14,
  },
  dropdownItemText: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  dropdownItemTextActive: {
    color: "#06b6d4",
    fontWeight: "700",
  },

  // 3-Tab Segment Switcher
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#161b22",
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    borderWidth: 1,
    borderColor: "#06b6d4",
  },
  tabButtonText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
  },
  tabButtonTextActive: {
    color: "#06b6d4",
  },

  filterSectionLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  // Category Pills
  categorySection: {
    marginBottom: 16,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
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
    fontSize: 12,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },

  // Content Containers
  tabContentContainer: {
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultsCount: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
  },
  hostEventBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#06b6d4",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  hostEventBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },

  // Hashtags
  hashtagScroll: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 16,
  },
  hashtagCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#161b22",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  hashtagName: {
    color: "#06b6d4",
    fontSize: 12,
    fontWeight: "bold",
  },
  hashtagCount: {
    color: "#64748b",
    fontSize: 10,
    backgroundColor: "rgba(100, 116, 139, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },

  // Media Grid (Trending)
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
    borderWidth: 1,
    borderColor: "#1e293b",
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
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewCount: {
    color: "#ffffff",
    fontSize: 10,
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
    backgroundColor: "rgba(13, 17, 23, 0.88)",
  },
  cardAvatar: {
    fontSize: 14,
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  cardCaption: {
    color: "#94a3b8",
    fontSize: 10,
  },

  // Events List
  eventsList: {
    gap: 14,
  },
  eventCard: {
    backgroundColor: "#161b22",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 6,
  },
  eventImage: {
    width: "100%",
    height: 140,
  },
  eventBody: {
    padding: 14,
  },
  eventBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  petTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#21262d",
  },
  petTypeBadgeText: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "600",
  },
  eventTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  eventDesc: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  eventMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 5,
  },
  eventMetaText: {
    color: "#cbd5e1",
    fontSize: 12,
    flex: 1,
  },
  eventFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#21262d",
  },
  attendeesBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  attendeesText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "500",
  },
  rsvpButton: {
    backgroundColor: "#06b6d4",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  rsvpButtonActive: {
    backgroundColor: "#10b981",
  },
  rsvpButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  rsvpButtonTextActive: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },

  // Marketplace: Products Grid
  marketGroup: {
    marginBottom: 10,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48.2%",
    backgroundColor: "#161b22",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 12,
  },
  productImage: {
    width: "100%",
    height: 120,
  },
  productBody: {
    padding: 10,
  },
  productTag: {
    color: "#06b6d4",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 2,
  },
  productName: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  productSeller: {
    color: "#64748b",
    fontSize: 11,
    marginBottom: 6,
  },
  productPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productPrice: {
    color: "#10b981",
    fontSize: 14,
    fontWeight: "800",
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "600",
  },
  buyButton: {
    backgroundColor: "#06b6d4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 7,
    borderRadius: 8,
  },
  buyButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },

  // Marketplace: Services List
  servicesList: {
    gap: 10,
  },
  serviceCard: {
    flexDirection: "row",
    backgroundColor: "#161b22",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 10,
    gap: 12,
  },
  serviceImage: {
    width: 86,
    height: 86,
    borderRadius: 10,
  },
  serviceBody: {
    flex: 1,
    justifyContent: "space-between",
  },
  serviceName: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  serviceProvider: {
    color: "#64748b",
    fontSize: 11,
  },
  servicePriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  servicePrice: {
    color: "#10b981",
    fontSize: 13,
    fontWeight: "800",
  },
  bookButton: {
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bookButtonText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },

  // Empty state
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#161b22",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginTop: 8,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  emptySub: {
    color: "#64748b",
    fontSize: 12,
  },
});
