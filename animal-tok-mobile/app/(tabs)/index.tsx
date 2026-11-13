import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ViewToken,
  SafeAreaView,
  useWindowDimensions,
  RefreshControl,
  Platform,
  StatusBar,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Bell, ShieldCheck, PawPrint, MessageCircle, X, UserPlus } from "lucide-react-native";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import VideoPost from "@/components/VideoPost.native";
import CommentsModal from "@/components/CommentsModal.native";
import ProfileSwitcherModal from "@/components/ProfileSwitcherModal.native";
import NotificationsModal from "@/components/NotificationsModal.native";
import GuestAuthModal from "@/components/GuestAuthModal";
import { feedPosts, type FeedPost } from "@/data/feedData";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FeedScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const router = useRouter();
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();
  const { activeProfile, switchProfile, user } = useAuth();
  const listRef = useRef<any>(null);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [profileSwitcherVisible, setProfileSwitcherVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(false);
  const [hasUnreadMessage, setHasUnreadMessage] = useState(false);
  const [guestAuthVisible, setGuestAuthVisible] = useState(false);
  const [show15SecBanner, setShow15SecBanner] = useState(false);
  const [feedVersion, setFeedVersion] = useState(0);

  // 15-second guest banner prompt
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setShow15SecBanner(true);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [user]);
  const [displayPosts, setDisplayPosts] = useState<FeedPost[]>(feedPosts);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadFeed = useCallback(async (resetPage = true) => {
    try {
      const targetPage = resetPage ? 1 : page;

      // 1. Fetch server posts
      let serverPosts = await api.getFeedPosts(targetPage, 10);
      if (!serverPosts || serverPosts.length === 0) {
        serverPosts = feedPosts;
      }

      // 2. Fetch locally persisted custom posts
      let customPosts: FeedPost[] = [];
      try {
        const stored = await AsyncStorage.getItem("animaltok_custom_posts");
        if (stored) {
          customPosts = JSON.parse(stored);
        }
      } catch (e) {}

      // In-memory newly created posts from feedPosts
      const inMemoryNew = feedPosts.filter(
        (fp) => !serverPosts.some((sp) => String(sp.id) === String(fp.id))
      );

      // Merge: newest custom & in-memory posts always show first at top of the feed
      const merged: FeedPost[] = [];
      const seen = new Set<string>();

      for (const p of [...inMemoryNew, ...customPosts]) {
        const idStr = String(p.id);
        if (!seen.has(idStr)) {
          seen.add(idStr);
          merged.push(p);
        }
      }

      for (const sp of serverPosts) {
        const idStr = String(sp.id);
        if (!seen.has(idStr)) {
          seen.add(idStr);
          merged.push(sp);
        }
      }

      if (resetPage) {
        setDisplayPosts(merged);
        setPage(1);
        setHasMore(serverPosts.length >= 10);
        setActiveIndex(0);
        if (listRef.current) {
          try {
            listRef.current.scrollToOffset({ offset: 0, animated: false });
          } catch (e) {}
        }
      } else {
        setDisplayPosts((prev) => {
          const existingIds = new Set(prev.map((p) => String(p.id)));
          const newPosts = serverPosts.filter((p) => !existingIds.has(String(p.id)));
          return [...prev, ...newPosts];
        });
        setHasMore(serverPosts.length >= 10);
      }
      setFeedVersion((v) => v + 1);
    } catch (e) {
      // Fallback stays in displayPosts
    }
  }, [page]);

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      const morePosts = await api.getFeedPosts(nextPage, 10);
      if (morePosts && morePosts.length > 0) {
        setDisplayPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const filtered = morePosts.filter((p) => !existingIds.has(p.id));
          return [...prev, ...filtered];
        });
        setPage(nextPage);
        setHasMore(morePosts.length >= 10);
        setFeedVersion((v) => v + 1);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.warn("Failed to load more posts:", e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const [isScreenFocused, setIsScreenFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      loadFeed();
      return () => {
        setIsScreenFocused(false);
      };
    }, [loadFeed])
  );

  useEffect(() => {
    if (refresh) {
      loadFeed(true);
    }
  }, [refresh, loadFeed]);

  useEffect(() => {
    loadFeed();

    // Connect to WebSocket for real-time post broadcasts, notifications & message alerts
    const currentUserId = user?.id || "u_3";
    const socket = api.connectSocket(currentUserId);
    if (socket) {
      socket.on("post_created", (newPost: any) => {
        const mappedPost: FeedPost = {
          id: newPost.id,
          username: newPost.animalUsername || `@${(newPost.animalName || "pet").toLowerCase().replace(/\s+/g, "")}`,
          displayName: newPost.animalName || "Pet",
          avatar: newPost.animalAvatar || "🐾",
          time: "Just now",
          caption: newPost.caption || "",
          hashtags: Array.isArray(newPost.tags) ? newPost.tags.map((t: string) => `#${t.replace(/^#/, "")}`).join(" ") : (newPost.tags || "#AnimalTok"),
          videoUrl: newPost.videoUrl || "",
          posterUrl: newPost.imageUrl || newPost.videoUrl || "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=700&fit=crop",
          audioUrl: newPost.audioUrl,
          audioName: newPost.audioName,
          likes: newPost.likesCount || 0,
          comments: newPost.commentsCount || 0,
          saves: newPost.sharesCount || 0,
          commentsList: []
        };
        setDisplayPosts((prev) => [mappedPost, ...prev.filter(p => String(p.id) !== String(mappedPost.id))]);
        setFeedVersion((v) => v + 1);
        setActiveIndex(0);
        if (listRef.current) {
          try {
            listRef.current.scrollToOffset({ offset: 0, animated: true });
          } catch (e) {}
        }
      });

      socket.on("post_deleted", ({ postId }: { postId: string }) => {
        setDisplayPosts((prev) => prev.filter((p) => String(p.id) !== String(postId)));
        setFeedVersion((v) => v + 1);
      });

      socket.on("new_notification", () => {
        setHasUnreadNotification(true);
      });

      socket.on("new_message_alert", () => {
        setHasUnreadMessage(true);
      });
    }

    return () => {
      if (socket) {
        socket.off("post_created");
        socket.off("post_deleted");
        socket.off("new_notification");
        socket.off("new_message_alert");
      }
    };
  }, [loadFeed, user?.id]);

  useEffect(() => {
    // When active profile changes, reload the real feed
    if (activeProfile?.id) {
      loadFeed(true);
    }
  }, [activeProfile?.id, loadFeed]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null && viewableItems[0].index !== undefined) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    waitForInteraction: false,
    minimumViewTime: 0,
  }).current;

  const [feedHeight, setFeedHeight] = useState(windowHeight - 62);

  const handleScroll = useCallback(
    (e: any) => {
      const offsetY = e.nativeEvent?.contentOffset?.y ?? 0;
      if (feedHeight > 0) {
        const nextIndex = Math.round(offsetY / feedHeight);
        if (nextIndex >= 0 && nextIndex < displayPosts.length && nextIndex !== activeIndex) {
          setActiveIndex(nextIndex);
        }
      }
    },
    [feedHeight, displayPosts.length, activeIndex]
  );

  return (
    <View 
      style={styles.container}
      onLayout={(e) => setFeedHeight(e.nativeEvent.layout.height)}
    >
      {/* Floating Header */}
      <View style={styles.topHeader}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            Anim<Text style={{ color: "#06b6d4" }}>andler</Text>
          </Text>
        </View>

        {/* Header Right Actions: Notifications */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              setNotificationsVisible(true);
              setHasUnreadNotification(false);
            }}
          >
            <Bell size={19} color="#ffffff" />
            {hasUnreadNotification && <View style={styles.unreadBadge} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Vertical Snap Video Feed */}
      {feedHeight > 0 && (
        <FlashList
          ref={listRef}
          data={displayPosts}
          extraData={feedVersion}
          estimatedItemSize={feedHeight}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          refreshing={isRefreshing}
          onRefresh={async () => {
            setIsRefreshing(true);
            await loadFeed(true);
            setIsRefreshing(false);
          }}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleScroll}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <View style={{ height: feedHeight }}>
              <VideoPost
                post={item}
                isActive={isScreenFocused && index === activeIndex}
                onCommentOpen={() => {
                  if (!user) {
                    setGuestAuthVisible(true);
                    return;
                  }
                  setSelectedPost(item);
                  setCommentsVisible(true);
                }}
                onAuthPrompt={() => setGuestAuthVisible(true)}
              />
            </View>
          )}
        />
      )}

      {/* 15-Second Floating Guest Toast Prompt */}
      {show15SecBanner && !user && (
        <View style={styles.floatingGuestToast}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.toastTitle}>Enjoying Animandler? 🎉</Text>
            <Text style={styles.toastSubtitle} numberOfLines={2}>
              Create an account to like, bookmark clips, and share your own pets!
            </Text>
          </View>
          <TouchableOpacity
            style={styles.toastJoinBtn}
            onPress={() => {
              setShow15SecBanner(false);
              setGuestAuthVisible(true);
            }}
          >
            <Text style={styles.toastJoinBtnText}>Join Free</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toastCloseBtn}
            onPress={() => setShow15SecBanner(false)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={14} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      )}

      {/* Guest Authentication Modal */}
      <GuestAuthModal
        visible={guestAuthVisible}
        onClose={() => setGuestAuthVisible(false)}
      />

      {/* Comments Sheet */}
      <CommentsModal
        post={selectedPost}
        visible={commentsVisible}
        onClose={() => setCommentsVisible(false)}
      />

      {/* Profile Switcher Modal */}
      <ProfileSwitcherModal
        visible={profileSwitcherVisible}
        onClose={() => setProfileSwitcherVisible(false)}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  topHeader: {
    position: "absolute",
    top: Platform.OS === "android" ? ((StatusBar.currentHeight || 44) + 14) : 48,
    left: 16,
    right: 16,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13, 17, 23, 0.72)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  unreadBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1.5,
    borderColor: "#0d1117",
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(13, 17, 23, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  floatingGuestToast: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(15, 23, 42, 0.94)",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: "#06b6d4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  toastTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 2,
  },
  toastSubtitle: {
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 15,
  },
  toastJoinBtn: {
    backgroundColor: "#06b6d4",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginRight: 6,
  },
  toastJoinBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  toastCloseBtn: {
    padding: 4,
  },
});
