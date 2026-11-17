import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
  Platform,
  StatusBar,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Search,
  TrendingUp,
  Flame,
  Play,
  Trophy,
  Heart,
  Calendar,
  ShoppingBag,
  Store,
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
  ChevronUp,
  Plus,
  ShieldCheck,
  Ticket,
  MessageSquare,
  PawPrint,
  User as UserIcon,
} from "lucide-react-native";
import { feedPosts, type FeedPost } from "@/data/feedData";
import { marketProducts, marketServices, type ProductItem, type ServiceItem } from "@/data/marketData";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/AuthContext";
import {
  api,
  type SearchHandlerResult,
  type SearchPetSummary,
  type ExploreSearchResponse,
} from "@/services/api";
import HostEventModal from "@/components/HostEventModal";
import AttendEventModal from "@/components/AttendEventModal";
import EventDetailModal, { type EventDetailItem } from "@/components/EventDetailModal";
import GuestAuthModal from "@/components/GuestAuthModal";
import { BuyProductModal } from "@/components/BuyProductModal";
import BookServiceModal from "@/components/BookServiceModal";
import { MarketDetailModal } from "@/components/MarketDetailModal";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";

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
  { id: "mating", label: "🐾 Mating & Breeding" },
  { id: "funny", label: "😂 Funny & Fails" },
  { id: "tricks", label: "🎾 Tricks & Skills" },
  { id: "cute", label: "🍼 Cute & Puppies" },
];

const EVENT_CATEGORIES = [
  { id: "all", label: "All Events" },
  { id: "mating", label: "🐾 Mating & Breeding" },
  { id: "sports", label: "🏆 Sports & Agility" },
  { id: "meetup", label: "🐾 Meetups & Play" },
  { id: "adoption", label: "🏠 Adoptions & Rescues" },
  { id: "contest", label: "🎉 Contests & Shows" },
];

const MARKET_PRODUCT_CATEGORIES = [
  { id: "all", label: "All Products" },
  { id: "food", label: "🥩 Food & Treats" },
  { id: "toys", label: "🧸 Toys & Gear" },
];

const MARKET_SERVICE_CATEGORIES = [
  { id: "all", label: "All Services" },
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
  isPaid?: boolean;
  ticketPrice?: string;
  capacity?: number;
  escrowStatus?: string;
  organizerId?: string;
  organizerName?: string;
  organizerAvatar?: string;
}

const EXPLORE_EVENTS: ExploreEvent[] = [
  {
    id: "e1",
    title: "Golden & Doodle Pedigree Mating Meetup 🐾",
    date: "Saturday, Nov 22 • 11:00 AM",
    location: "Cedar Creek Canine Estate, Austin TX",
    attendees: 38,
    category: "mating",
    categoryLabel: "Mating & Breeding",
    petType: "dog",
    description: "Pedigree certified stud dogs and dam meetups with on-site genetic verification and health clearances.",
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&fit=crop",
    isPaid: true,
    ticketPrice: "$25.00",
    capacity: 40,
    escrowStatus: "held",
    organizerName: "Cedar Creek Canine Estate",
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
    isPaid: true,
    ticketPrice: "$35.00",
    capacity: 120,
    escrowStatus: "held",
    organizerName: "Texas Canine League",
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
    isPaid: false,
    ticketPrice: "Free",
    capacity: 100,
    organizerName: "Austin Feline Club",
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
    isPaid: true,
    ticketPrice: "$15.00",
    capacity: 50,
    escrowStatus: "held",
    organizerName: "Botanical Avian Society",
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
    isPaid: false,
    ticketPrice: "Free",
    capacity: 300,
    organizerName: "Town Lake Animal Center",
  },
  {
    id: "e6",
    title: "Bengal & Ragdoll Stud Matching Gala 🐾",
    date: "Sunday, Jan 10 • 2:00 PM",
    location: "Hill Country Pet Resort",
    attendees: 31,
    category: "mating",
    categoryLabel: "Mating & Breeding",
    petType: "cat",
    description: "Purebred Bengal and Ragdoll registered breeders showcase and pedigree documentation exchange.",
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&fit=crop",
    organizerName: "Hill Country Pet Resort",
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
  const insets = useSafeAreaInsets();
  const topSafeInset = Math.max(insets.top, Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 20);
  const { activeProfile, user, pets: myPets } = useAuth();

  // Selected state
  const [activeTab, setActiveTab] = useState<ExploreTab>("trending");
  const [marketSubTab, setMarketSubTab] = useState<"products" | "services">("products");
  const [marketDropdownOpen, setMarketDropdownOpen] = useState(false);
  const [selectedPetFilter, setSelectedPetFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [rsvps, setRsvps] = useState<Record<string, boolean>>({});
  const [petDropdownOpen, setPetDropdownOpen] = useState(false);
  const [livePosts, setLivePosts] = useState<FeedPost[]>(feedPosts);
  const [eventsList, setEventsList] = useState<ExploreEvent[]>(EXPLORE_EVENTS);
  const [liveProducts, setLiveProducts] = useState<ProductItem[]>(marketProducts);
  const [liveServices, setLiveServices] = useState<ServiceItem[]>(marketServices);
  const [remoteSearch, setRemoteSearch] = useState<ExploreSearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedHandler, setSelectedHandler] = useState<SearchHandlerResult | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const [hostModalVisible, setHostModalVisible] = useState(false);
  const [selectedAttendEvent, setSelectedAttendEvent] = useState<ExploreEvent | null>(null);
  const [selectedEventDetail, setSelectedEventDetail] = useState<ExploreEvent | null>(null);
  const [purchasedTickets, setPurchasedTickets] = useState<Record<string, boolean>>({});
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  const toggleEventExpand = (id: string) => {
    setExpandedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Guest Auth Modal state
  const [guestAuthVisible, setGuestAuthVisible] = useState(false);
  const [guestAuthTitle, setGuestAuthTitle] = useState("Join Animandler 🐾");
  const [guestAuthSubtitle, setGuestAuthSubtitle] = useState("");

  const syncExploreData = useCallback(async () => {
    try {
      const [serverFeed, serverEvents, serverProds, serverSrvs] = await Promise.all([
        api.getFeedPosts(1, 50).catch(() => []),
        api.getEvents().catch(() => null),
        api.getMarketplaceProducts().catch(() => null),
        api.getMarketplaceServices().catch(() => null),
      ]);

      // Merge Posts (local custom + server + fallback)
      let customPosts: FeedPost[] = [];
      try {
        const storedPosts = await AsyncStorage.getItem("animaltok_custom_posts");
        if (storedPosts) customPosts = JSON.parse(storedPosts);
      } catch {}

      const mergedPosts: FeedPost[] = [];
      const seenPostIds = new Set<string>();
      for (const p of [...customPosts, ...(Array.isArray(serverFeed) ? serverFeed : []), ...feedPosts]) {
        const key = String(p.id);
        if (!seenPostIds.has(key) && !(p as any).isAd) {
          seenPostIds.add(key);
          mergedPosts.push(p);
        }
      }
      setLivePosts(mergedPosts);

      // Merge Products
      let customProds: any[] = [];
      try {
        const storedProds = await AsyncStorage.getItem("animaltok_custom_products");
        if (storedProds) customProds = JSON.parse(storedProds);
      } catch {}
      const mergedProds: ProductItem[] = [];
      const seenProdIds = new Set<string>();
      for (const cp of [...customProds, ...(Array.isArray(serverProds) ? serverProds : []), ...marketProducts]) {
        const key = String(cp.id);
        if (!seenProdIds.has(key)) {
          seenProdIds.add(key);
          mergedProds.push(cp);
        }
      }
      setLiveProducts(mergedProds);

      // Merge Services
      let customSrvs: any[] = [];
      try {
        const storedSrvs = await AsyncStorage.getItem("animaltok_custom_services");
        if (storedSrvs) customSrvs = JSON.parse(storedSrvs);
      } catch {}
      const mergedSrvs: ServiceItem[] = [];
      const seenSrvIds = new Set<string>();
      for (const cs of [...customSrvs, ...(Array.isArray(serverSrvs) ? serverSrvs : []), ...marketServices]) {
        const key = String(cs.id);
        if (!seenSrvIds.has(key)) {
          seenSrvIds.add(key);
          mergedSrvs.push(cs);
        }
      }
      setLiveServices(mergedSrvs);

      // Merge Events
      let customEvts: any[] = [];
      try {
        const storedEvts = await AsyncStorage.getItem("animaltok_custom_events");
        if (storedEvts) customEvts = JSON.parse(storedEvts);
      } catch {}
      const mergedEvts: ExploreEvent[] = [];
      const seenEvtIds = new Set<string>();
      for (const ce of [...customEvts, ...(Array.isArray(serverEvents) ? serverEvents : []), ...EXPLORE_EVENTS]) {
        const key = String(ce.id);
        if (!seenEvtIds.has(key)) {
          seenEvtIds.add(key);
          mergedEvts.push({
            ...ce,
            category: String(ce.category || "meetup").toLowerCase(),
            categoryLabel: ce.categoryLabel || ce.category || "Meetup",
            petType: String(ce.petType || "all").toLowerCase(),
          });
        }
      }
      setEventsList(mergedEvts);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      console.warn("Explore sync warning:", e);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      syncExploreData();
    }, [syncExploreData])
  );

  // Real-time Socket.IO sync so newly published posts, pets, or handlers appear live
  useEffect(() => {
    const socket = api.connectSocket(user?.id);
    if (!socket) return;

    const refreshAll = () => {
      syncExploreData();
    };

    socket.on("post_created", refreshAll);
    socket.on("post_deleted", refreshAll);
    socket.on("animal_created", refreshAll);
    socket.on("animal_updated", refreshAll);

    return () => {
      socket.off("post_created", refreshAll);
      socket.off("post_deleted", refreshAll);
      socket.off("animal_created", refreshAll);
      socket.off("animal_updated", refreshAll);
    };
  }, [user?.id, syncExploreData]);

  // Real-time debounced search against /api/search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      if (searchAbortRef.current) searchAbortRef.current.abort();
      setRemoteSearch(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
      const controller = new AbortController();
      searchAbortRef.current = controller;

      const res = await api.searchExplore(trimmed, selectedPetFilter, controller.signal);
      if (!controller.signal.aborted) {
        if (res) setRemoteSearch(res);
        setIsSearching(false);
      }
    }, 180);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery, selectedPetFilter]);

  const currentPet = useMemo(
    () => PET_FILTERS.find((p) => p.id === selectedPetFilter) || PET_FILTERS[0],
    [selectedPetFilter]
  );

  // Reset category when switching tabs
  const handleTabChange = (tab: ExploreTab) => {
    setMarketDropdownOpen(false);
    setActiveTab(tab);
    setSelectedCategory("all");
  };

  const handleSelectMarketOption = (opt: "products" | "services") => {
    setMarketSubTab(opt);
    setMarketDropdownOpen(false);
    setActiveTab("marketplace");
    setSelectedCategory("all");
  };

  const handleSwipeLeft = () => {
    setPetDropdownOpen(false);
    setMarketDropdownOpen(false);
    if (activeTab === "trending") {
      handleTabChange("events");
    } else if (activeTab === "events") {
      setMarketSubTab("products");
      handleTabChange("marketplace");
    } else if (activeTab === "marketplace") {
      if (marketSubTab === "products") {
        setMarketSubTab("services");
        setSelectedCategory("all");
      } else {
        router.replace("/(tabs)/inbox");
      }
    }
  };

  const handleSwipeRight = () => {
    setPetDropdownOpen(false);
    setMarketDropdownOpen(false);
    if (activeTab === "marketplace") {
      if (marketSubTab === "services") {
        setMarketSubTab("products");
        setSelectedCategory("all");
      } else {
        handleTabChange("events");
      }
    } else if (activeTab === "events") {
      handleTabChange("trending");
    } else if (activeTab === "trending") {
      router.replace("/(tabs)/");
    }
  };

  const handleAttendEvent = (event: ExploreEvent) => {
    if (!user) {
      setGuestAuthTitle("Attend Pet Event 🎉");
      setGuestAuthSubtitle("Create an account or sign in to register and reserve your spot!");
      setGuestAuthVisible(true);
      return;
    }
    setSelectedAttendEvent(event);
  };

  const handleRegistrationSuccess = (eventId: string) => {
    setRsvps((prev) => ({ ...prev, [eventId]: true }));
    if (selectedAttendEvent?.isPaid) {
      setPurchasedTickets((prev) => ({ ...prev, [eventId]: true }));
    }
    setEventsList((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, attendees: (e.attendees || 0) + 1 } : e))
    );
  };

  const toggleRsvp = (eventId: string, title: string) => {
    if (!user) {
      setGuestAuthTitle("RSVP for Events 🐾");
      setGuestAuthSubtitle("Create an account or sign in to reserve your spot at pet events and meet other pet parents!");
      setGuestAuthVisible(true);
      return;
    }
    const nextState = !rsvps[eventId];
    setRsvps((prev) => ({ ...prev, [eventId]: nextState }));
    Alert.alert(
      nextState ? "RSVP Confirmed! 🎉" : "RSVP Cancelled",
      nextState
        ? `You are now on the attendee list for "${title}". We'll remind you 24 hours prior.`
        : `You have removed your reservation for "${title}".`
    );
  };

  // Detail & Action Modals
  const [selectedDetailItem, setSelectedDetailItem] = useState<any>(null);
  const [detailModalType, setDetailModalType] = useState<"product" | "service">("product");
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const [buyProductModalVisible, setBuyProductModalVisible] = useState(false);
  const [selectedProductForBuy, setSelectedProductForBuy] = useState<ProductItem | null>(null);

  const [bookServiceModalVisible, setBookServiceModalVisible] = useState(false);
  const [selectedServiceForBook, setSelectedServiceForBook] = useState<ServiceItem | null>(null);

  const handleOpenEventDetail = (event: ExploreEvent) => {
    if (!user) {
      setGuestAuthTitle("View Pet Event Details 🎪");
      setGuestAuthSubtitle("Create a free account to view full event details, venue location, attendees, and RSVP!");
      setGuestAuthVisible(true);
      return;
    }
    setSelectedEventDetail(event);
  };

  const handleToggleEventAttendance = (evt: EventDetailItem) => {
    const matched = eventsList.find((e) => String(e.id) === String(evt.id));
    if (matched && (rsvps[matched.id] || purchasedTickets[matched.id])) {
      // Cancel attendance cleanly
      setRsvps((prev) => ({ ...prev, [matched.id]: false }));
      setPurchasedTickets((prev) => ({ ...prev, [matched.id]: false }));
      setEventsList((prev) =>
        prev.map((e) => (e.id === matched.id ? { ...e, attendees: Math.max(0, (e.attendees || 1) - 1) } : e))
      );
      setSelectedEventDetail((prev) =>
        prev && String(prev.id) === String(matched.id)
          ? { ...prev, attendees: Math.max(0, (prev.attendees || 1) - 1) }
          : prev
      );
      api.toggleEventRsvp(matched.id);
      Alert.alert("Attendance Cancelled", `You removed your RSVP for "${matched.title}".`);
      return;
    }

    if (matched) {
      setSelectedEventDetail(null);
      handleAttendEvent(matched);
    }
  };

  const isAnyModalOpen =
    guestAuthVisible ||
    hostModalVisible ||
    !!selectedAttendEvent ||
    !!selectedEventDetail ||
    !!selectedHandler ||
    buyProductModalVisible ||
    bookServiceModalVisible ||
    detailModalVisible;

  const swipeHandlers = useSwipeGesture({
    enabled: !isAnyModalOpen,
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
  });

  const handleOpenProductDetail = (item: ProductItem) => {
    if (!user) {
      setGuestAuthTitle("View Pet Product 🛍️");
      setGuestAuthSubtitle("Create a free account to view full product details, prices, seller ratings, and order pet essentials!");
      setGuestAuthVisible(true);
      return;
    }
    setSelectedDetailItem(item);
    setDetailModalType("product");
    setDetailModalVisible(true);
  };

  const handleOpenServiceDetail = (item: ServiceItem) => {
    if (!user) {
      setGuestAuthTitle("View Pet Care Service 🩺");
      setGuestAuthSubtitle("Create a free account to view certified provider details, rates, reviews, and book appointments!");
      setGuestAuthVisible(true);
      return;
    }
    setSelectedDetailItem(item);
    setDetailModalType("service");
    setDetailModalVisible(true);
  };

  const handleBuyProduct = (item: ProductItem) => {
    if (!user) {
      setGuestAuthTitle("Buy Pet Products 🛍️");
      setGuestAuthSubtitle("Create an account or sign in to purchase items and track orders.");
      setGuestAuthVisible(true);
      return;
    }
    setSelectedProductForBuy(item);
    setBuyProductModalVisible(true);
  };

  const handleBookService = (item: ServiceItem) => {
    if (!user) {
      setGuestAuthTitle("Book Pet Services 🩺");
      setGuestAuthSubtitle("Create an account or sign in to book grooming, training, vet appointments, and care services.");
      setGuestAuthVisible(true);
      return;
    }
    setSelectedServiceForBook(item);
    setBookServiceModalVisible(true);
  };

  const matchesQuery = useCallback((queryStr: string, ...fields: (string | undefined | null)[]) => {
    const trimmed = queryStr.trim().toLowerCase();
    if (!trimmed) return true;
    const clean = trimmed.replace(/^[@#]+/, "");
    const hay = fields.filter(Boolean).join(" ").toLowerCase();
    return hay.includes(trimmed) || (clean.length > 0 && hay.includes(clean));
  }, []);

  // Matching Handlers (Live server search + local profile fallback)
  const matchedHandlers = useMemo<SearchHandlerResult[]>(() => {
    if (!searchQuery.trim()) return [];
    const results: SearchHandlerResult[] = [];
    const seenIds = new Set<string>();

    if (remoteSearch?.handlers) {
      for (const h of remoteSearch.handlers) {
        if (!seenIds.has(String(h.id))) {
          seenIds.add(String(h.id));
          results.push(h);
        }
      }
    }

    if (
      user &&
      !seenIds.has(String(user.id)) &&
      matchesQuery(
        searchQuery,
        user.name,
        user.username,
        user.clinicName,
        user.specialization,
        user.accountType
      )
    ) {
      seenIds.add(String(user.id));
      results.push({
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar || "🐾",
        role: user.role,
        accountType: user.accountType,
        clinicName: user.clinicName,
        specialization: user.specialization,
        pets: myPets.map((p) => ({
          id: p.id,
          name: p.name,
          username: p.username,
          avatar: p.avatar,
          breed: p.breed,
          age: p.age,
        })),
      });
    }

    return results;
  }, [searchQuery, remoteSearch, user, myPets, matchesQuery]);

  // Matching Pets (Live server search + local posts/myPets fallback)
  const matchedPets = useMemo<SearchPetSummary[]>(() => {
    if (!searchQuery.trim()) return [];
    const results: SearchPetSummary[] = [];
    const seenIds = new Set<string>();

    if (remoteSearch?.pets) {
      for (const p of remoteSearch.pets) {
        const key = String(p.id).toLowerCase();
        if (!seenIds.has(key)) {
          seenIds.add(key);
          results.push(p);
        }
      }
    }

    for (const p of myPets) {
      const key = String(p.id).toLowerCase();
      if (!seenIds.has(key) && matchesQuery(searchQuery, p.name, p.username, p.breed, p.bio)) {
        seenIds.add(key);
        results.push({
          id: p.id,
          name: p.name,
          username: p.username,
          avatar: p.avatar,
          breed: p.breed,
          age: p.age,
          handlerName: user?.name,
        });
      }
    }

    for (const post of livePosts) {
      const pid = String(post.animalId || post.username?.replace(/^@+/, "") || post.id);
      const key = pid.toLowerCase();
      if (
        !seenIds.has(key) &&
        matchesQuery(searchQuery, post.displayName, post.username, (post as any).handlerName, post.hashtags)
      ) {
        seenIds.add(key);
        results.push({
          id: pid,
          name: post.displayName,
          username: post.username,
          avatar: post.avatar,
          handlerName: (post as any).handlerName,
        });
      }
    }

    return results;
  }, [searchQuery, remoteSearch, myPets, livePosts, user?.name, matchesQuery]);

  // Filtered Trending Posts (real-time server results + local live feed)
  const filteredPosts = useMemo(() => {
    const sourcePosts: FeedPost[] = [];
    const seen = new Set<string>();
    const pool = searchQuery.trim() && remoteSearch?.posts ? [...remoteSearch.posts, ...livePosts] : livePosts;
    for (const p of pool) {
      const key = String(p.id);
      if (!seen.has(key) && !(p as any).isAd) {
        seen.add(key);
        sourcePosts.push(p);
      }
    }

    const filtered = sourcePosts.filter((post) => {
      const matchesSearch = matchesQuery(
        searchQuery,
        post.caption,
        post.displayName,
        post.username,
        post.hashtags,
        post.audioName,
        (post as any).handlerName
      );

      // Pet Type filter
      const petHay = `${post.caption || ""} ${post.hashtags || ""} ${post.displayName || ""} ${post.username || ""}`;
      let matchesPet = true;
      if (selectedPetFilter === "dog") {
        matchesPet =
          post.avatar === "🐕" ||
          post.avatar === "🐕‍🦺" ||
          post.avatar === "🐩" ||
          /dog|pup|retriever|husky|lab|shepherd|doodle|canine/i.test(petHay);
      } else if (selectedPetFilter === "cat") {
        matchesPet = post.avatar === "🐈" || /cat|feline|kitten|maine|bengal|ragdoll/i.test(petHay);
      } else if (selectedPetFilter === "bird") {
        matchesPet = post.avatar === "🦜" || /bird|parrot|avian/i.test(petHay);
      } else if (selectedPetFilter === "rabbit") {
        matchesPet = post.avatar === "🐇" || post.avatar === "🐰" || /rabbit|bunny/i.test(petHay);
      } else if (selectedPetFilter === "exotic") {
        matchesPet = post.avatar === "🦎" || /reptile|gecko|snake|exotic|lizard/i.test(petHay);
      } else if (selectedPetFilter === "horse") {
        matchesPet = post.avatar === "🐎" || /horse|equine|pony/i.test(petHay);
      }

      // Category filter
      let matchesCategory = true;
      const catHay = `${post.caption || ""} ${post.hashtags || ""}`;
      if (selectedCategory === "sports") {
        matchesCategory = /sport|agility|run|park|fetch|jump|sprint|zoomies/i.test(catHay);
      } else if (selectedCategory === "mating") {
        matchesCategory = /mate|mating|pedigree|breed|champion|stud/i.test(catHay);
      } else if (selectedCategory === "viral") {
        matchesCategory = true; // Sorted by top trending below so live viral clips always surface
      } else if (selectedCategory === "funny") {
        matchesCategory = /funny|box|fail|derp|haha|smile|comedy/i.test(catHay);
      } else if (selectedCategory === "tricks") {
        matchesCategory = /trick|skill|clever|smart|whistle/i.test(catHay);
      } else if (selectedCategory === "cute") {
        matchesCategory = /cute|baby|puppy|kitten|sweet|cozy|nap/i.test(catHay);
      }

      return matchesSearch && matchesPet && matchesCategory;
    });

    if (selectedCategory === "viral") {
      return [...filtered].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    return filtered;
  }, [searchQuery, remoteSearch, livePosts, selectedPetFilter, selectedCategory, matchesQuery, refreshKey]);

  // Filtered Events (real-time server results + local events)
  const filteredEvents = useMemo(() => {
    const pool: ExploreEvent[] = [];
    const seen = new Set<string>();
    const raw = searchQuery.trim() && remoteSearch?.events ? [...remoteSearch.events, ...eventsList] : eventsList;
    for (const e of raw) {
      const key = String(e.id);
      if (!seen.has(key)) {
        seen.add(key);
        pool.push({
          ...e,
          category: String(e.category || "meetup").toLowerCase(),
          petType: String(e.petType || "all").toLowerCase(),
        });
      }
    }

    return pool.filter((evt) => {
      const matchesSearch = matchesQuery(
        searchQuery,
        evt.title,
        evt.location,
        evt.description,
        evt.organizerName,
        evt.categoryLabel
      );

      const matchesPet =
        selectedPetFilter === "all" ||
        evt.petType === "all" ||
        evt.petType === selectedPetFilter;

      const matchesCategory =
        selectedCategory === "all" || evt.category.toLowerCase().includes(selectedCategory);

      return matchesSearch && matchesPet && matchesCategory;
    });
  }, [searchQuery, remoteSearch, eventsList, selectedPetFilter, selectedCategory, matchesQuery, refreshKey]);

  // Filtered Marketplace (Products & Services)
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "services" || selectedCategory === "grooming" || selectedCategory === "training") {
      return [];
    }
    const pool: ProductItem[] = [];
    const seen = new Set<string>();
    const raw = searchQuery.trim() && remoteSearch?.products ? [...remoteSearch.products, ...liveProducts] : liveProducts;
    for (const p of raw) {
      const key = String(p.id);
      if (!seen.has(key)) {
        seen.add(key);
        pool.push(p);
      }
    }

    return pool.filter((prod) => {
      const matchesSearch = matchesQuery(searchQuery, prod.name, prod.seller, prod.category);

      let matchesPet = true;
      if (selectedPetFilter === "dog") {
        matchesPet = !/feather|cat/i.test(prod.name + prod.category);
      } else if (selectedPetFilter === "cat") {
        matchesPet = !/collar|bark/i.test(prod.name) || /feather|feline|cat/i.test(prod.name + prod.seller);
      }

      let matchesCategory = true;
      if (selectedCategory === "food") {
        matchesCategory = /food|treat/i.test(prod.category);
      } else if (selectedCategory === "toys") {
        matchesCategory = /toy|wand|interactive/i.test(prod.category + prod.name);
      }

      return matchesSearch && matchesPet && matchesCategory;
    });
  }, [searchQuery, remoteSearch, liveProducts, selectedPetFilter, selectedCategory, matchesQuery, refreshKey]);

  const filteredServices = useMemo(() => {
    if (selectedCategory === "products" || selectedCategory === "food" || selectedCategory === "toys") {
      return [];
    }
    const pool: ServiceItem[] = [];
    const seen = new Set<string>();
    const raw = searchQuery.trim() && remoteSearch?.services ? [...remoteSearch.services, ...liveServices] : liveServices;
    for (const s of raw) {
      const key = String(s.id);
      if (!seen.has(key)) {
        seen.add(key);
        pool.push(s);
      }
    }

    return pool.filter((srv) => {
      const matchesSearch = matchesQuery(searchQuery, srv.name, srv.provider, srv.category);

      let matchesPet = true;
      if (selectedPetFilter === "cat") {
        matchesPet = !/puppy|canine|bark/i.test(srv.name + srv.provider);
      }

      let matchesCategory = true;
      if (selectedCategory === "grooming") {
        matchesCategory = /groom|spa|bath/i.test(srv.name);
      } else if (selectedCategory === "training") {
        matchesCategory = /train|behavior|academy/i.test(srv.name);
      }

      return matchesSearch && matchesPet && matchesCategory;
    });
  }, [searchQuery, remoteSearch, liveServices, selectedPetFilter, selectedCategory, matchesQuery, refreshKey]);

  // Active Category list
  const currentCategories =
    activeTab === "trending"
      ? TRENDING_CATEGORIES
      : activeTab === "events"
      ? EVENT_CATEGORIES
      : marketSubTab === "services"
      ? MARKET_SERVICE_CATEGORIES
      : MARKET_PRODUCT_CATEGORIES;

  const isImageAvatar = (avatar?: string | null) =>
    !!avatar && (avatar.startsWith("http") || avatar.startsWith("data:") || avatar.startsWith("file:") || avatar.startsWith("/"));

  const renderAvatarBubble = (avatar: string | undefined, size: number, fallback = "🐾") =>
    isImageAvatar(avatar) ? (
      <Image source={{ uri: avatar }} style={{ width: size, height: size, borderRadius: size / 2 }} resizeMode="cover" />
    ) : (
      <Text style={{ fontSize: Math.round(size * 0.56) }}>{avatar || fallback}</Text>
    );

  const handleMessageHandler = (handler: SearchHandlerResult) => {
    setSelectedHandler(null);
    if (!user) {
      setGuestAuthTitle(`Message ${handler.name} 💬`);
      setGuestAuthSubtitle("Create a free account to message handlers, pet parents, and care providers directly!");
      setGuestAuthVisible(true);
      return;
    }
    const threadId = `dm_${handler.id}`;
    router.push({
      pathname: "/(tabs)/message/[id]",
      params: {
        id: threadId,
        recipientId: handler.id,
        name: handler.name,
        avatar: handler.avatar || "🐾",
      },
    });
  };

  return (
    <View style={styles.container} {...swipeHandlers}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        contentContainerStyle={styles.scrollContent}
        onScrollBeginDrag={() => {
          setPetDropdownOpen(false);
          setMarketDropdownOpen(false);
        }}
      >
        <View style={[styles.stickyHeaderContainer, { paddingTop: topSafeInset + 10 }]}>
          {/* Top Header */}
          <View style={styles.topHeader}>
            <Text style={styles.pageTitle}>Explore</Text>
            <Text style={styles.pageSub}>Discover trending pets, live events & marketplace</Text>
          </View>

          {/* 3 Main Tabs: Trending | Events | Marketplace (Dropdown: Products / Services) */}
          <View style={styles.tabsWrapper}>
            <View style={styles.tabsRow}>
              <TouchableOpacity
                style={[styles.tabButton, { flex: 0.95 }, activeTab === "trending" && styles.tabButtonActive]}
                onPress={() => {
                  setPetDropdownOpen(false);
                  handleTabChange("trending");
                }}
              >
                <Flame size={13} color={activeTab === "trending" ? "#06b6d4" : "#94a3b8"} />
                <Text
                  style={[styles.tabButtonText, activeTab === "trending" && styles.tabButtonTextActive]}
                  numberOfLines={1}
                >
                  Trending
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, { flex: 0.85 }, activeTab === "events" && styles.tabButtonActive]}
                onPress={() => {
                  setPetDropdownOpen(false);
                  handleTabChange("events");
                }}
              >
                <Calendar size={13} color={activeTab === "events" ? "#06b6d4" : "#94a3b8"} />
                <Text
                  style={[styles.tabButtonText, activeTab === "events" && styles.tabButtonTextActive]}
                  numberOfLines={1}
                >
                  Events
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, { flex: 1.25 }, activeTab === "marketplace" && styles.tabButtonActive]}
                onPress={() => {
                  setPetDropdownOpen(false);
                  setMarketDropdownOpen((prev) => !prev);
                }}
              >
                <Store size={13} color={activeTab === "marketplace" ? "#06b6d4" : "#94a3b8"} />
                <Text
                  style={[styles.tabButtonText, activeTab === "marketplace" && styles.tabButtonTextActive]}
                  numberOfLines={1}
                >
                  {activeTab === "marketplace"
                    ? marketSubTab === "services"
                      ? "Services"
                      : "Products"
                    : "Marketplace"}
                </Text>
                <ChevronDown
                  size={11}
                  color={activeTab === "marketplace" ? "#06b6d4" : "#94a3b8"}
                  style={marketDropdownOpen ? { transform: [{ rotate: "180deg" }] } : undefined}
                />
              </TouchableOpacity>
            </View>

            {/* Floating Marketplace Dropdown: Products | Services */}
            {marketDropdownOpen && (
              <View style={styles.marketDropdownMenu}>
                <View style={styles.dropdownHeader}>
                  <Text style={styles.dropdownHeaderText}>Choose Marketplace</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.marketDropdownItem,
                    activeTab === "marketplace" && marketSubTab === "products" && styles.dropdownItemActive,
                  ]}
                  onPress={() => handleSelectMarketOption("products")}
                  activeOpacity={0.75}
                >
                  <Package size={16} color="#06b6d4" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.marketDropdownTitle}>Products</Text>
                    <Text style={styles.marketDropdownSub}>Pet food, toys & accessories</Text>
                  </View>
                  {activeTab === "marketplace" && marketSubTab === "products" && (
                    <Check size={15} color="#06b6d4" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.marketDropdownItem,
                    activeTab === "marketplace" && marketSubTab === "services" && styles.dropdownItemActive,
                  ]}
                  onPress={() => handleSelectMarketOption("services")}
                  activeOpacity={0.75}
                >
                  <Wrench size={16} color="#10b981" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.marketDropdownTitle}>Services</Text>
                    <Text style={styles.marketDropdownSub}>Grooming, vet consults & training</Text>
                  </View>
                  {activeTab === "marketplace" && marketSubTab === "services" && (
                    <Check size={15} color="#10b981" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Search & Pet Filter Input Group */}
          <View style={styles.inputGroupWrapper}>
            <View style={[styles.inputGroupContainer, searchFocused && styles.inputGroupContainerFocused]}>
              {/* Left: Search Bar */}
              <View style={styles.searchLeftBox}>
                <Search size={15} color={searchFocused ? "#06b6d4" : "#94a3b8"} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={
                    activeTab === "trending"
                      ? "Search handlers, pets, videos, tags..."
                      : activeTab === "events"
                      ? "Search events, handlers, breeds..."
                      : "Search products, services, sellers..."
                  }
                  placeholderTextColor="#64748b"
                  selectionColor="#06b6d4"
                  underlineColorAndroid="transparent"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => {
                    setPetDropdownOpen(false);
                    setSearchFocused(true);
                  }}
                  onBlur={() => setSearchFocused(false)}
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

        {/* Real-time Handlers & Pets Search Results */}
        {searchQuery.trim().length > 0 && (isSearching || matchedHandlers.length > 0 || matchedPets.length > 0) && (
          <View style={styles.searchPeopleSection}>
            <View style={styles.searchPeopleHeader}>
              <View style={styles.sectionTitleRow}>
                <Users size={14} color="#06b6d4" />
                <Text style={styles.searchPeopleTitle} numberOfLines={1}>Handlers & Pets</Text>
                {isSearching && <ActivityIndicator size="small" color="#06b6d4" style={{ marginLeft: 4 }} />}
              </View>
              <Text style={styles.resultsCount}>
                {matchedHandlers.length + matchedPets.length} matches
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.peopleCardsScroll}
            >
              {matchedHandlers.map((handler) => (
                <TouchableOpacity
                  key={`h_${handler.id}`}
                  style={styles.peopleCard}
                  onPress={() => setSelectedHandler(handler)}
                  activeOpacity={0.8}
                >
                  <View style={styles.peopleAvatarCircle}>
                    {renderAvatarBubble(handler.avatar, 40)}
                  </View>
                  <View style={styles.peopleCardBody}>
                    <View style={styles.peopleNameRow}>
                      <Text style={styles.peopleName} numberOfLines={1}>
                        {handler.name}
                      </Text>
                      <ShieldCheck size={12} color="#2dd4bf" />
                    </View>
                    <Text style={styles.peopleHandle} numberOfLines={1}>
                      {handler.username.startsWith("@") ? handler.username : `@${handler.username}`}
                    </Text>
                    <View style={styles.peopleRoleBadge}>
                      <UserIcon size={10} color="#06b6d4" />
                      <Text style={styles.peopleRoleText} numberOfLines={1}>
                        {handler.accountType === "vet"
                          ? "Vet"
                          : handler.accountType === "business"
                          ? "Store"
                          : "Handler"}
                        {handler.pets?.length ? ` • ${handler.pets.length} pet${handler.pets.length > 1 ? "s" : ""}` : ""}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {matchedPets.map((pet) => (
                <TouchableOpacity
                  key={`p_${pet.id}`}
                  style={[styles.peopleCard, styles.petResultCard]}
                  onPress={() => router.push(`/(tabs)/animal/${pet.id}` as any)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.peopleAvatarCircle, { borderColor: "#2dd4bf" }]}>
                    {renderAvatarBubble(pet.avatar, 40)}
                  </View>
                  <View style={styles.peopleCardBody}>
                    <View style={styles.peopleNameRow}>
                      <Text style={styles.peopleName} numberOfLines={1}>
                        {pet.name}
                      </Text>
                      <PawPrint size={11} color="#2dd4bf" />
                    </View>
                    <Text style={styles.peopleHandle} numberOfLines={1}>
                      {pet.breed || (pet.username?.startsWith("@") ? pet.username : `@${pet.username || "pet"}`)}
                    </Text>
                    <Text style={styles.peopleSubNote} numberOfLines={1}>
                      {pet.handlerName ? `Handler: ${pet.handlerName}` : "View Pet Profile"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ============================================================== */}
        {/* TAB 1: TRENDING TAB CONTENT                                    */}
        {/* ============================================================== */}
        {activeTab === "trending" && (
          <View style={styles.tabContentContainer}>
            {/* Trending Hashtags Bar */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Flame size={14} color="#f59e0b" />
                <Text style={styles.sectionTitle} numberOfLines={1}>Trending Tags</Text>
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
                <TrendingUp size={14} color="#06b6d4" />
                <Text style={styles.sectionTitle} numberOfLines={1}>
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
              <View style={styles.productsGrid}>
                {filteredPosts.map((post) => (
                  <TouchableOpacity
                    key={post.id}
                    style={styles.productCard}
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/",
                        params: { focusPostId: String(post.id) },
                      })
                    }
                    activeOpacity={0.85}
                  >
                    <View style={styles.uniformCardMediaBox}>
                      <Image source={{ uri: post.posterUrl }} style={styles.productImage} resizeMode="cover" />
                      <View style={styles.playOverlay}>
                        <Play size={11} color="#ffffff" fill="#ffffff" />
                        <Text style={styles.viewCount}>{post.likes} likes</Text>
                      </View>
                    </View>
                    <View style={styles.productBody}>
                      <View style={styles.uniformAuthorRow}>
                        {renderAvatarBubble(post.avatar, 18)}
                        <Text style={styles.productTag} numberOfLines={1}>
                          {post.displayName}
                        </Text>
                      </View>
                      <Text style={styles.productName} numberOfLines={1}>
                        {post.caption || "Featured Pet Moment"}
                      </Text>
                      <Text style={styles.productSeller} numberOfLines={1}>
                        {post.hashtags || "#animandler"}
                      </Text>
                      <View style={[styles.buyButton, { marginTop: 4 }]}>
                        <Play size={12} color="#ffffff" fill="#ffffff" />
                        <Text style={styles.buyButtonText}>Watch Post</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ============================================================== */}
        {/* TAB 2: EVENTS TAB CONTENT (Uniform 2-Column Grid + Modal)      */}
        {/* ============================================================== */}
        {activeTab === "events" && (
          <View style={styles.tabContentContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Calendar size={14} color="#06b6d4" />
                <Text style={styles.sectionTitle} numberOfLines={1}>Upcoming Pet Events</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <TouchableOpacity
                  style={styles.hostEventBtn}
                  onPress={() => {
                    if (!user) {
                      setGuestAuthTitle("Host a Pet Event 🐾");
                      setGuestAuthSubtitle("Create an account or sign in to host pet meetups, breeding events, and agility competitions!");
                      setGuestAuthVisible(true);
                      return;
                    }
                    setHostModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Plus size={11} color="#ffffff" />
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
              <View style={styles.productsGrid}>
                {filteredEvents.map((event) => {
                  const isAttending = !!rsvps[event.id] || !!purchasedTickets[event.id];
                  return (
                    <TouchableOpacity
                      key={event.id}
                      style={styles.productCard}
                      onPress={() => handleOpenEventDetail(event)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.uniformCardMediaBox}>
                        <Image source={{ uri: event.image }} style={styles.productImage} resizeMode="cover" />
                        <View style={event.isPaid ? styles.imagePaidBadge : styles.imageFreeBadge}>
                          <Text style={event.isPaid ? styles.imagePaidBadgeText : styles.imageFreeBadgeText}>
                            {event.isPaid ? event.ticketPrice : "Free"}
                          </Text>
                        </View>
                        {isAttending && (
                          <View style={styles.uniformAttendingBadge}>
                            <Check size={10} color="#ffffff" />
                            <Text style={styles.uniformAttendingBadgeText}>Going</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.productBody}>
                        <Text style={styles.productTag} numberOfLines={1}>
                          {event.categoryLabel}
                        </Text>
                        <Text style={styles.productName} numberOfLines={2}>
                          {event.title}
                        </Text>
                        <Text style={styles.productSeller} numberOfLines={1}>
                          {event.date}
                        </Text>
                        <View style={styles.productPriceRow}>
                          <View style={styles.ratingBox}>
                            <Users size={11} color="#06b6d4" />
                            <Text style={styles.ratingText}>{event.attendees} going</Text>
                          </View>
                          <Text style={styles.tapDetailsText}>View Details</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ============================================================== */}
        {/* TAB 3: MARKETPLACE TAB CONTENT (Products OR Services 2-Col Grid) */}
        {/* ============================================================== */}
        {activeTab === "marketplace" && (
          <View style={styles.tabContentContainer}>
            {/* Sub-tab indicator pill bar right above grid for instant switching */}
            <View style={styles.marketSubBar}>
              <TouchableOpacity
                style={[styles.marketSubChip, marketSubTab === "products" && styles.marketSubChipActive]}
                onPress={() => handleSelectMarketOption("products")}
              >
                <Package size={13} color={marketSubTab === "products" ? "#ffffff" : "#94a3b8"} />
                <Text style={[styles.marketSubChipText, marketSubTab === "products" && styles.marketSubChipTextActive]}>
                  Products ({filteredProducts.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.marketSubChip, marketSubTab === "services" && styles.marketSubChipServicesActive]}
                onPress={() => handleSelectMarketOption("services")}
              >
                <Wrench size={13} color={marketSubTab === "services" ? "#ffffff" : "#94a3b8"} />
                <Text style={[styles.marketSubChipText, marketSubTab === "services" && styles.marketSubChipTextActive]}>
                  Services ({filteredServices.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Products Section (when Products option selected) */}
            {marketSubTab === "products" && (
              filteredProducts.length > 0 ? (
                <View style={styles.marketGroup}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                      <Package size={14} color="#06b6d4" />
                      <Text style={styles.sectionTitle} numberOfLines={1}>Featured Products</Text>
                    </View>
                    <Text style={styles.resultsCount}>{filteredProducts.length} items</Text>
                  </View>

                  <View style={styles.productsGrid}>
                    {filteredProducts.map((prod) => (
                      <TouchableOpacity
                        key={prod.id}
                        style={styles.productCard}
                        onPress={() => handleOpenProductDetail(prod)}
                        activeOpacity={0.85}
                      >
                        <Image source={{ uri: prod.image }} style={styles.productImage} />
                        <View style={styles.productBody}>
                          <Text style={styles.productTag} numberOfLines={1}>{prod.category}</Text>
                          <Text style={styles.productName} numberOfLines={1}>{prod.name}</Text>
                          <Text style={styles.productSeller} numberOfLines={1}>by {prod.seller}</Text>

                          <View style={styles.productPriceRow}>
                            <View style={styles.ratingBox}>
                              <Star size={11} color="#f59e0b" fill="#f59e0b" />
                              <Text style={styles.ratingText}>{prod.rating}</Text>
                            </View>
                            <Text style={styles.tapDetailsText}>Tap for Details</Text>
                          </View>

                          <TouchableOpacity
                            style={styles.buyButton}
                            onPress={() => handleOpenProductDetail(prod)}
                          >
                            <ShoppingBag size={13} color="#ffffff" />
                            <Text style={styles.buyButtonText}>View & Buy</Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyIcon}>🛍️</Text>
                  <Text style={styles.emptyTitle}>No products found</Text>
                  <Text style={styles.emptySub}>Try adjusting your pet filter or category pills</Text>
                </View>
              )
            )}

            {/* Services Section (Uniform 2-Column Grid when Services option selected) */}
            {marketSubTab === "services" && (
              filteredServices.length > 0 ? (
                <View style={styles.marketGroup}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                      <Wrench size={14} color="#10b981" />
                      <Text style={styles.sectionTitle} numberOfLines={1}>Professional Services</Text>
                    </View>
                    <Text style={styles.resultsCount}>{filteredServices.length} services</Text>
                  </View>

                  <View style={styles.productsGrid}>
                    {filteredServices.map((srv) => (
                      <TouchableOpacity
                        key={srv.id}
                        style={styles.productCard}
                        onPress={() => handleOpenServiceDetail(srv)}
                        activeOpacity={0.85}
                      >
                        <Image source={{ uri: srv.image }} style={styles.productImage} />
                        <View style={styles.productBody}>
                          <Text style={[styles.productTag, { color: "#10b981" }]} numberOfLines={1}>
                            {srv.category || "Care Service"}
                          </Text>
                          <Text style={styles.productName} numberOfLines={1}>{srv.name}</Text>
                          <Text style={styles.productSeller} numberOfLines={1}>by {srv.provider}</Text>

                          <View style={styles.productPriceRow}>
                            <View style={styles.ratingBox}>
                              <Star size={11} color="#f59e0b" fill="#f59e0b" />
                              <Text style={styles.ratingText}>{srv.rating}</Text>
                            </View>
                            <Text style={styles.tapDetailsText}>Tap for Details</Text>
                          </View>

                          <TouchableOpacity
                            style={[styles.buyButton, { backgroundColor: "#10b981" }]}
                            onPress={() => handleOpenServiceDetail(srv)}
                          >
                            <Calendar size={13} color="#ffffff" />
                            <Text style={styles.buyButtonText}>View & Book</Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyIcon}>🛎️</Text>
                  <Text style={styles.emptyTitle}>No services found</Text>
                  <Text style={styles.emptySub}>Try adjusting your pet filter or category pills</Text>
                </View>
              )
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
              isPaid: newEvent.isPaid,
              ticketPrice: newEvent.ticketPrice,
              capacity: newEvent.capacity,
              escrowStatus: newEvent.escrowStatus,
              organizerId: newEvent.organizerId,
              organizerName: newEvent.organizerName || "Community Host",
            },
            ...prev,
          ]);
        }}
      />

      {/* Event Detail Popup Modal */}
      <EventDetailModal
        visible={!!selectedEventDetail}
        event={selectedEventDetail}
        isAttending={selectedEventDetail ? !!rsvps[selectedEventDetail.id] : false}
        hasPurchasedTicket={selectedEventDetail ? !!purchasedTickets[selectedEventDetail.id] : false}
        onClose={() => setSelectedEventDetail(null)}
        onToggleAttend={handleToggleEventAttendance}
      />

      {/* Attend Event Form Modal */}
      {selectedAttendEvent && (
        <AttendEventModal
          visible={!!selectedAttendEvent}
          event={{
            id: selectedAttendEvent.id,
            title: selectedAttendEvent.title,
            date: selectedAttendEvent.date,
            location: selectedAttendEvent.location,
            image: selectedAttendEvent.image,
            categoryLabel: selectedAttendEvent.categoryLabel,
            organizerId: selectedAttendEvent.organizerId,
            organizerName: selectedAttendEvent.organizerName,
            organizerAvatar: selectedAttendEvent.organizerAvatar,
            isPaid: selectedAttendEvent.isPaid,
            ticketPrice: selectedAttendEvent.ticketPrice,
            attendees: selectedAttendEvent.attendees,
          }}
          user={user}
          onClose={() => setSelectedAttendEvent(null)}
          onSuccess={(eventId) => {
            handleRegistrationSuccess(eventId);
          }}
        />
      )}

      {/* Market Detail Modal */}
      <MarketDetailModal
        visible={detailModalVisible}
        item={selectedDetailItem}
        type={detailModalType}
        onClose={() => setDetailModalVisible(false)}
        onAction={() => {
          if (detailModalType === "product") {
            handleBuyProduct(selectedDetailItem);
          } else {
            handleBookService(selectedDetailItem);
          }
        }}
      />

      {/* Buy Product Modal */}
      <BuyProductModal
        visible={buyProductModalVisible}
        product={selectedProductForBuy}
        onClose={() => setBuyProductModalVisible(false)}
        user={user}
      />

      {/* Book Service Modal */}
      <BookServiceModal
        visible={bookServiceModalVisible}
        service={selectedServiceForBook}
        onClose={() => setBookServiceModalVisible(false)}
        user={user}
      />

      {/* Guest Auth Modal */}
      <GuestAuthModal
        visible={guestAuthVisible}
        onClose={() => setGuestAuthVisible(false)}
        title={guestAuthTitle}
        subtitle={guestAuthSubtitle}
      />

      {/* Handler Quick Profile & Pets Modal */}
      <Modal
        visible={!!selectedHandler}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedHandler(null)}
      >
        <View style={styles.handlerModalBackdrop}>
          <View style={styles.handlerModalCard}>
            <View style={styles.handlerModalHeader}>
              <View style={styles.handlerModalTitleRow}>
                <View style={styles.handlerModalAvatar}>
                  {selectedHandler && renderAvatarBubble(selectedHandler.avatar, 50)}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={styles.handlerModalName} numberOfLines={1}>
                      {selectedHandler?.name}
                    </Text>
                    <ShieldCheck size={15} color="#2dd4bf" />
                  </View>
                  <Text style={styles.handlerModalUsername}>
                    {selectedHandler?.username?.startsWith("@")
                      ? selectedHandler.username
                      : `@${selectedHandler?.username || "handler"}`}
                  </Text>
                  <View style={styles.handlerModalRolePill}>
                    <Text style={styles.handlerModalRoleText}>
                      {selectedHandler?.clinicName ||
                        selectedHandler?.businessName ||
                        (selectedHandler?.accountType === "vet"
                          ? "Verified Veterinarian"
                          : selectedHandler?.accountType === "business"
                          ? "Pet Business Partner"
                          : "Verified Pet Handler")}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedHandler(null)} hitSlop={10}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {selectedHandler?.bio ? (
              <Text style={styles.handlerModalBio}>{selectedHandler.bio}</Text>
            ) : selectedHandler?.specialization ? (
              <Text style={styles.handlerModalBio}>Specialization: {selectedHandler.specialization}</Text>
            ) : null}

            {selectedHandler?.pets && selectedHandler.pets.length > 0 ? (
              <View style={styles.handlerModalPetsSection}>
                <Text style={styles.handlerModalPetsTitle}>
                  Pets ({selectedHandler.pets.length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {selectedHandler.pets.map((pet) => (
                    <TouchableOpacity
                      key={pet.id}
                      style={styles.handlerModalPetChip}
                      onPress={() => {
                        setSelectedHandler(null);
                        router.push(`/(tabs)/animal/${pet.id}` as any);
                      }}
                    >
                      <View style={styles.handlerModalPetAvatar}>
                        {renderAvatarBubble(pet.avatar, 32)}
                      </View>
                      <View>
                        <Text style={styles.handlerModalPetName}>{pet.name}</Text>
                        <Text style={styles.handlerModalPetBreed}>{pet.breed || "Pet Profile"}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.handlerModalMsgBtn}
              onPress={() => selectedHandler && handleMessageHandler(selectedHandler)}
              activeOpacity={0.85}
            >
              <MessageSquare size={16} color="#ffffff" />
              <Text style={styles.handlerModalMsgText}>Message {selectedHandler?.name}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  stickyHeaderContainer: {
    backgroundColor: "#0d1117",
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    zIndex: 999,
  },
  topHeader: {
    paddingTop: 0,
    marginBottom: 8,
  },
  pageTitle: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  pageSub: {
    color: "#64748b",
    fontSize: 11.5,
    marginTop: 1,
  },
  // Input Group & Dropdown Styles
  inputGroupWrapper: {
    position: "relative",
    zIndex: 999,
    marginBottom: 10,
  },
  inputGroupContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161b22",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    height: 42,
    paddingHorizontal: 10,
  },
  inputGroupContainerFocused: {
    borderColor: "#06b6d4",
  },
  searchLeftBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 12,
    paddingVertical: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    ...(Platform.OS === "web"
      ? ({ outlineStyle: "none", outlineWidth: 0, outlineColor: "transparent", boxShadow: "none" } as any)
      : {}),
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
    fontSize: 13,
  },
  dropdownTriggerText: {
    color: "#cbd5e1",
    fontSize: 11.5,
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
    borderRadius: 12,
    padding: 3,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    borderWidth: 1,
    borderColor: "#06b6d4",
  },
  tabButtonText: {
    color: "#94a3b8",
    fontSize: 11.5,
    fontWeight: "700",
  },
  tabButtonTextActive: {
    color: "#06b6d4",
  },

  filterSectionLabel: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  // Category Pills
  categorySection: {
    paddingTop: 10,
    marginBottom: 12,
  },
  categoryScroll: {
    gap: 7,
    paddingBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 15,
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
    fontSize: 11.5,
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
    gap: 8,
    marginBottom: 10,
  },
  sectionTitleRow: {
    flex: 1,
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 13.5,
    fontWeight: "700",
    flexShrink: 1,
  },
  resultsCount: {
    color: "#64748b",
    fontSize: 10.5,
    fontWeight: "500",
    flexShrink: 0,
  },
  hostEventBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#06b6d4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hostEventBtnText: {
    color: "#ffffff",
    fontSize: 10.5,
    fontWeight: "700",
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
    gap: 12,
  },
  eventCard: {
    backgroundColor: "#161b22",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 4,
  },
  eventImageWrap: {
    width: "100%",
    height: 125,
    position: "relative",
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  imageFreeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(13, 17, 23, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.45)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  imageFreeBadgeText: {
    color: "#06b6d4",
    fontSize: 10.5,
    fontWeight: "700",
  },
  imagePaidBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(13, 17, 23, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.45)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  imagePaidBadgeText: {
    color: "#f59e0b",
    fontSize: 10.5,
    fontWeight: "700",
  },
  eventBody: {
    padding: 12,
  },
  eventBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  petTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "#21262d",
  },
  petTypeBadgeText: {
    color: "#cbd5e1",
    fontSize: 10.5,
    fontWeight: "600",
  },
  eventTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  eventExpandedDetails: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(30, 41, 59, 0.6)",
  },
  eventDesc: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  eventMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  eventMetaText: {
    color: "#cbd5e1",
    fontSize: 11.5,
    flex: 1,
  },
  expandToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingVertical: 4,
    marginTop: 2,
    marginBottom: 2,
  },
  expandToggleBtnText: {
    color: "#06b6d4",
    fontSize: 11.5,
    fontWeight: "600",
  },
  eventFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
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
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.35)",
  },
  paidBadgeText: {
    color: "#06b6d4",
    fontSize: 10.5,
    fontWeight: "700",
  },
  freeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.25)",
  },
  freeBadgeText: {
    color: "#06b6d4",
    fontSize: 10.5,
    fontWeight: "700",
  },
  buyTicketBtn: {
    backgroundColor: "#06b6d4",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  buyTicketText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  ticketActiveBtn: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  ticketActiveText: {
    color: "#10b981",
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
    padding: 9,
  },
  productTag: {
    color: "#06b6d4",
    fontSize: 9.5,
    fontWeight: "700",
    marginBottom: 2,
  },
  productName: {
    color: "#ffffff",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  productSeller: {
    color: "#64748b",
    fontSize: 10.5,
    marginBottom: 6,
  },
  productPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  productPrice: {
    color: "#10b981",
    fontSize: 13,
    fontWeight: "800",
  },
  tapDetailsText: {
    color: "#06b6d4",
    fontSize: 10.5,
    fontWeight: "600",
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    color: "#cbd5e1",
    fontSize: 10.5,
    fontWeight: "600",
  },
  buyButton: {
    backgroundColor: "#06b6d4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buyButtonText: {
    color: "#ffffff",
    fontSize: 11,
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
  lockedExploreContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
    backgroundColor: "#161b22",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginTop: 16,
  },
  lockedIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(6, 182, 212, 0.14)",
    borderWidth: 1.5,
    borderColor: "rgba(6, 182, 212, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  lockedTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  lockedSubtitle: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
  },
  lockedPrimaryBtn: {
    width: "100%",
    backgroundColor: "#06b6d4",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  lockedPrimaryBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  lockedSecondaryBtn: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "#30363d",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  lockedSecondaryBtnText: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "600",
  },

  // Real-Time Handlers & Pets Search Results
  searchPeopleSection: {
    marginBottom: 16,
  },
  searchPeopleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  searchPeopleTitle: {
    color: "#ffffff",
    fontSize: 13.5,
    fontWeight: "700",
  },
  peopleCardsScroll: {
    gap: 10,
    paddingBottom: 2,
  },
  peopleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 14,
    padding: 10,
    width: 215,
  },
  petResultCard: {
    borderColor: "rgba(45, 212, 191, 0.35)",
  },
  peopleAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0d1117",
    borderWidth: 1.5,
    borderColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  peopleCardBody: {
    flex: 1,
  },
  peopleNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  peopleName: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
  },
  peopleHandle: {
    color: "#94a3b8",
    fontSize: 11.5,
    marginTop: 1,
  },
  peopleRoleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  peopleRoleText: {
    color: "#06b6d4",
    fontSize: 10.5,
    fontWeight: "600",
  },
  peopleSubNote: {
    color: "#2dd4bf",
    fontSize: 10.5,
    fontWeight: "600",
    marginTop: 4,
  },

  // Handler Quick Profile Modal
  handlerModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    justifyContent: "flex-end",
  },
  handlerModalCard: {
    backgroundColor: "#161b22",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 20,
    paddingBottom: 34,
  },
  handlerModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  handlerModalTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  handlerModalAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#0d1117",
    borderWidth: 2,
    borderColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  handlerModalName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    flexShrink: 1,
  },
  handlerModalUsername: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 2,
  },
  handlerModalRolePill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(6, 182, 212, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.35)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 6,
  },
  handlerModalRoleText: {
    color: "#06b6d4",
    fontSize: 11,
    fontWeight: "700",
  },
  handlerModalBio: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },
  handlerModalPetsSection: {
    marginTop: 16,
  },
  handlerModalPetsTitle: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  handlerModalPetChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "rgba(45, 212, 191, 0.35)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  handlerModalPetAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#161b22",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  handlerModalPetName: {
    color: "#ffffff",
    fontSize: 12.5,
    fontWeight: "700",
  },
  handlerModalPetBreed: {
    color: "#94a3b8",
    fontSize: 11,
  },
  handlerModalMsgBtn: {
    marginTop: 18,
    backgroundColor: "#06b6d4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  handlerModalMsgText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  tabsWrapper: {
    position: "relative",
    zIndex: 1005,
  },
  marketDropdownMenu: {
    position: "absolute",
    top: 52,
    right: 0,
    width: 245,
    backgroundColor: "#161b22",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 25,
    zIndex: 1010,
  },
  marketDropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  marketDropdownTitle: {
    color: "#ffffff",
    fontSize: 13.5,
    fontWeight: "700",
  },
  marketDropdownSub: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 1,
  },
  marketSubBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  marketSubChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 10,
    paddingVertical: 6.5,
  },
  marketSubChipActive: {
    backgroundColor: "#06b6d4",
    borderColor: "#06b6d4",
  },
  marketSubChipServicesActive: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  marketSubChipText: {
    color: "#94a3b8",
    fontSize: 11.5,
    fontWeight: "700",
  },
  marketSubChipTextActive: {
    color: "#ffffff",
  },
  uniformCardMediaBox: {
    width: "100%",
    position: "relative",
  },
  uniformAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  uniformAttendingBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#10b981",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  uniformAttendingBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },
});
