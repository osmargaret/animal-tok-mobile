import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/* --------------------------------- Types --------------------------------- */

export type AppNotification = {
  id: string;
  type: "like" | "comment" | "follow" | "event" | "order" | "system" | "message" | "ad" | "booking";
  title: string;
  message: string;
  avatar: string;
  time: number;
  read: boolean;
  /** profile this notification belongs to */
  profileId: string;
  /** for type="message", the other contact id so we can clear on open */
  contactId?: string;
};

export type CartItem = {
  id: string;
  productId: number;
  name: string;
  price: number;
  qty: number;
  image: string;
  addedBy: string; // active profile id
};

export type Booking = {
  id: string;
  serviceId: number;
  serviceName: string;
  date: string;
  time: string;
  bookedBy: string;
  createdAt: number;
};

export type AdMedia = "image" | "video" | "text";
export type Ad = {
  id: string;
  type: AdMedia;
  title: string;
  body: string;
  mediaUrl?: string;
  ctaUrl?: string;
  ctaLabel?: string;
  bgColor?: string;
  createdBy: string;
  createdByName?: string;
  createdByAvatar?: string;
  createdAt: number;
  location?: { city?: string; region?: string; country?: string; countryCode?: string } | null;
};

export type AdStats = { views: number; clicks: number };

export type UserPost = {
  id: number;
  type: "image" | "video" | "text";
  caption: string;
  textContent?: string;
  hashtags: string[];
  mediaUrl?: string;
  isPublic: boolean;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorUsername: string;
  location?: { city?: string; country?: string } | null;
  createdAt: number;
};

export type SubscriptionPlan = "starter" | "growth" | "pro";
export type Subscription = {
  profileId: string;
  plan: SubscriptionPlan;
  price: number;
  status: "active" | "cancelled";
  startedAt: number;
  renewsAt: number;
  paymentLast4: string;
};

export type Order = {
  id: string;
  profileId: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  paymentLast4: string;
  status: "confirmed";
  createdAt: number;
};

export type Comment = {
  id: string;
  postId: number | string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: number;
  parentId?: string | null;
  reactions?: Record<string, string[]>; // emoji -> profileIds
  attachmentUrl?: string;
};


interface EngagementContextType {
  // Likes per (profileId, postId)
  isLiked: (profileId: string, postId: number | string) => boolean;
  toggleLike: (profileId: string, postId: number | string, postOwnerProfileId?: string) => void;
  likeCountFor: (postId: number | string, base?: number) => number;

  // Saves per (profileId, postId)
  isSaved: (profileId: string, postId: number | string) => boolean;
  toggleSave: (profileId: string, postId: number | string) => void;

  // Follows: who profileId follows
  isFollowing: (profileId: string, targetId: string) => boolean;
  toggleFollow: (profileId: string, targetId: string) => void;

  // Comments per post
  commentsFor: (postId: number | string) => Comment[];
  addComment: (profileId: string, profileName: string, profileAvatar: string, postId: number | string, text: string, postOwnerProfileId?: string, opts?: { parentId?: string | null; attachmentUrl?: string }) => void;
  deleteComment: (commentId: string) => void;
  toggleCommentReaction: (commentId: string, emoji: string, profileId: string) => void;

  // Notifications
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, "id" | "time" | "read">) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: (profileId: string) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: (profileId: string) => void;
  clearMessageNotifications: (profileId: string, contactId: string) => void;
  unreadCountFor: (profileId: string) => number;


  // Cart
  cart: CartItem[];
  cartItemsFor: (profileId: string) => CartItem[];
  addToCart: (profileId: string, item: Omit<CartItem, "id" | "addedBy">) => void;
  updateCartQty: (cartItemId: string, qty: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: (profileId: string) => void;
  cartCount: (profileId: string) => number;
  cartSubtotal: (profileId: string) => number;

  // Orders
  orders: Order[];
  ordersFor: (profileId: string) => Order[];
  placeOrder: (
    profileId: string,
    info: { shippingName: string; shippingAddress: string; shippingCity: string; paymentLast4: string }
  ) => Order | null;

  // Bookings
  bookings: Booking[];
  addBooking: (profileId: string, b: Omit<Booking, "id" | "bookedBy" | "createdAt">) => void;

  // Ads
  ads: Ad[];
  addAd: (profileId: string, a: Omit<Ad, "id" | "createdBy" | "createdAt" | "createdByName" | "createdByAvatar">, meta?: { name?: string; avatar?: string }) => Ad;
  adStats: Record<string, AdStats>;
  statsFor: (adId: string) => AdStats;
  trackAdView: (adId: string, viewerId?: string) => void;
  trackAdClick: (adId: string, viewerId?: string) => void;

  // User-generated posts (persisted)
  userPosts: UserPost[];
  addPost: (post: Omit<UserPost, "id" | "createdAt">) => UserPost;

  // Business subscriptions
  subscriptions: Record<string, Subscription>;
  subscriptionFor: (profileId: string) => Subscription | null;
  setSubscription: (profileId: string, plan: SubscriptionPlan, price: number, paymentLast4: string) => Subscription;
  cancelSubscription: (profileId: string) => void;
}

const EngagementContext = createContext<EngagementContextType | null>(null);

export const useEngagement = () => {
  const ctx = useContext(EngagementContext);
  if (!ctx) throw new Error("useEngagement must be used within EngagementProvider");
  return ctx;
};

/* ------------------------------- Persistence ------------------------------ */

const persisted = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const useStored = <T,>(key: string, initial: T) => {
  const [v, setV] = useState<T>(() => persisted(key, initial));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {}
  }, [key, v]);
  return [v, setV] as const;
};

/* -------------------------------- Provider -------------------------------- */

const k = (a: string, b: string | number) => `${a}::${b}`;

export const EngagementProvider = ({ children }: { children: ReactNode }) => {
  const [likes, setLikes] = useStored<Record<string, true>>("at_likes", {});
  const [saves, setSaves] = useStored<Record<string, true>>("at_saves", {});
  const [follows, setFollows] = useStored<Record<string, true>>("at_follows", {});
  const [comments, setComments] = useStored<Record<string, Comment[]>>("at_comments", {});
  const [notifications, setNotifications] = useStored<AppNotification[]>("at_notifs", []);
  const [cart, setCart] = useStored<CartItem[]>("at_cart", []);
  const [orders, setOrders] = useStored<Order[]>("at_orders", []);
  const [bookings, setBookings] = useStored<Booking[]>("at_bookings", []);
  const [ads, setAds] = useStored<Ad[]>("at_ads", []);
  const [adStats, setAdStats] = useStored<Record<string, AdStats>>("at_ad_stats", {});
  const [userPosts, setUserPosts] = useStored<UserPost[]>("at_user_posts", []);
  const [subscriptions, setSubscriptions] = useStored<Record<string, Subscription>>("at_subs", {});

  const addNotification: EngagementContextType["addNotification"] = useCallback((n) => {
    setNotifications((prev) => [
      { ...n, id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, time: Date.now(), read: false },
      ...prev,
    ]);
  }, [setNotifications]);

  // Bridge: messaging dispatches custom events when a message is sent
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        recipientId: string;
        senderName: string;
        senderAvatar: string;
        contactId: string;
        preview: string;
      };
      addNotification({
        type: "message",
        profileId: detail.recipientId,
        contactId: detail.contactId,
        title: `New message from ${detail.senderName}`,
        message: detail.preview,
        avatar: detail.senderAvatar,
      });
    };
    window.addEventListener("animaltok:message", handler);
    return () => window.removeEventListener("animaltok:message", handler);
  }, [addNotification]);

  /* ------------------------------ Likes/saves ----------------------------- */
  const isLiked = (profileId: string, postId: number | string) => !!likes[k(profileId, postId)];
  const toggleLike: EngagementContextType["toggleLike"] = (profileId, postId, postOwnerProfileId) => {
    setLikes((prev) => {
      const key = k(profileId, postId);
      const next = { ...prev };
      if (next[key]) delete next[key];
      else {
        next[key] = true;
        if (postOwnerProfileId && postOwnerProfileId !== profileId) {
          addNotification({
            type: "like",
            profileId: postOwnerProfileId,
            title: "New like",
            message: `Someone liked your post`,
            avatar: "❤️",
          });
        }
      }
      return next;
    });
  };
  const likeCountFor = (postId: number | string, base = 0) => {
    return base + Object.keys(likes).filter((key) => key.endsWith(`::${postId}`)).length;
  };

  const isSaved = (profileId: string, postId: number | string) => !!saves[k(profileId, postId)];
  const toggleSave: EngagementContextType["toggleSave"] = (profileId, postId) => {
    setSaves((prev) => {
      const key = k(profileId, postId);
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
  };

  /* -------------------------------- Follows ------------------------------- */
  const isFollowing = (profileId: string, targetId: string) => !!follows[k(profileId, targetId)];
  const toggleFollow: EngagementContextType["toggleFollow"] = (profileId, targetId) => {
    setFollows((prev) => {
      const key = k(profileId, targetId);
      const next = { ...prev };
      if (next[key]) delete next[key];
      else {
        next[key] = true;
        addNotification({
          type: "follow",
          profileId: targetId,
          title: "New follower",
          message: `${profileId} started following you`,
          avatar: "👥",
        });
      }
      return next;
    });
  };

  /* -------------------------------- Comments ------------------------------ */
  const commentsFor = (postId: number | string) => comments[String(postId)] || [];
  const addComment: EngagementContextType["addComment"] = (profileId, profileName, profileAvatar, postId, text, postOwnerProfileId, opts) => {
    if (!text.trim() && !opts?.attachmentUrl) return;
    const c: Comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      postId,
      authorId: profileId,
      authorName: profileName,
      authorAvatar: profileAvatar,
      text: text.trim(),
      createdAt: Date.now(),
      parentId: opts?.parentId ?? null,
      attachmentUrl: opts?.attachmentUrl,
      reactions: {},
    };
    setComments((prev) => ({ ...prev, [String(postId)]: [...(prev[String(postId)] || []), c] }));
    if (postOwnerProfileId && postOwnerProfileId !== profileId) {
      addNotification({
        type: "comment",
        profileId: postOwnerProfileId,
        title: opts?.parentId ? "New reply" : "New comment",
        message: `${profileName}: ${(text.trim() || "📎 attachment").slice(0, 60)}`,
        avatar: profileAvatar,
      });
    }
  };

  const deleteComment: EngagementContextType["deleteComment"] = (commentId) => {
    setComments((prev) => {
      const next: Record<string, Comment[]> = {};
      for (const [k, arr] of Object.entries(prev)) {
        next[k] = arr.filter((c) => c.id !== commentId && c.parentId !== commentId);
      }
      return next;
    });
  };

  const toggleCommentReaction: EngagementContextType["toggleCommentReaction"] = (commentId, emoji, profileId) => {
    setComments((prev) => {
      const next: Record<string, Comment[]> = {};
      for (const [k, arr] of Object.entries(prev)) {
        next[k] = arr.map((c) => {
          if (c.id !== commentId) return c;
          const reactions = { ...(c.reactions || {}) };
          const list = reactions[emoji] || [];
          reactions[emoji] = list.includes(profileId) ? list.filter((p) => p !== profileId) : [...list, profileId];
          if (reactions[emoji].length === 0) delete reactions[emoji];
          return { ...c, reactions };
        });
      }
      return next;
    });
  };


  /* ----------------------------- Notifications ---------------------------- */
  const markNotificationRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = (profileId: string) =>
    setNotifications((prev) => prev.map((n) => (n.profileId === profileId ? { ...n, read: true } : n)));
  const removeNotification: EngagementContextType["removeNotification"] = (id) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  const clearAllNotifications: EngagementContextType["clearAllNotifications"] = (profileId) =>
    setNotifications((prev) => prev.filter((n) => n.profileId !== profileId));

  const clearMessageNotifications = (profileId: string, contactId: string) =>
    setNotifications((prev) =>
      prev.map((n) =>
        n.profileId === profileId && n.type === "message" && n.contactId === contactId ? { ...n, read: true } : n
      )
    );
  const unreadCountFor = useCallback(
    (profileId: string) => notifications.filter((n) => n.profileId === profileId && !n.read).length,
    [notifications]
  );

  /* -------------------------------- Cart --------------------------------- */
  const addToCart: EngagementContextType["addToCart"] = (profileId, item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === item.productId && c.addedBy === profileId);
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id ? { ...c, qty: c.qty + item.qty } : c
        );
      }
      return [
        ...prev,
        { ...item, id: `cart-${Date.now()}-${item.productId}`, addedBy: profileId },
      ];
    });
  };
  const cartItemsFor = (profileId: string) => cart.filter((c) => c.addedBy === profileId);
  const cartCount = (profileId: string) =>
    cart.filter((c) => c.addedBy === profileId).reduce((s, c) => s + c.qty, 0);
  const cartSubtotal = (profileId: string) =>
    cart.filter((c) => c.addedBy === profileId).reduce((s, c) => s + c.price * c.qty, 0);
  const updateCartQty: EngagementContextType["updateCartQty"] = (cartItemId, qty) =>
    setCart((prev) => prev.map((c) => (c.id === cartItemId ? { ...c, qty: Math.max(1, qty) } : c)));
  const removeFromCart: EngagementContextType["removeFromCart"] = (cartItemId) =>
    setCart((prev) => prev.filter((c) => c.id !== cartItemId));
  const clearCart: EngagementContextType["clearCart"] = (profileId) =>
    setCart((prev) => prev.filter((c) => c.addedBy !== profileId));

  /* ------------------------------- Orders -------------------------------- */
  const ordersFor = (profileId: string) => orders.filter((o) => o.profileId === profileId);
  const placeOrder: EngagementContextType["placeOrder"] = (profileId, info) => {
    const items = cart.filter((c) => c.addedBy === profileId);
    if (items.length === 0) return null;
    const subtotal = items.reduce((s, c) => s + c.price * c.qty, 0);
    const shipping = subtotal > 50 ? 0 : 4.99;
    const tax = +(subtotal * 0.08).toFixed(2);
    const total = +(subtotal + shipping + tax).toFixed(2);
    const order: Order = {
      id: `ord-${Date.now()}`,
      profileId,
      items,
      subtotal,
      shipping,
      tax,
      total,
      status: "confirmed",
      createdAt: Date.now(),
      ...info,
    };
    setOrders((prev) => [order, ...prev]);
    setCart((prev) => prev.filter((c) => c.addedBy !== profileId));
    addNotification({
      type: "order",
      profileId,
      title: "Order confirmed 🎉",
      message: `${items.length} item${items.length > 1 ? "s" : ""} · $${total.toFixed(2)}`,
      avatar: "📦",
    });
    return order;
  };

  /* ------------------------------ Bookings ------------------------------- */
  const addBooking: EngagementContextType["addBooking"] = (profileId, b) => {
    const booking: Booking = { ...b, id: `b-${Date.now()}`, bookedBy: profileId, createdAt: Date.now() };
    setBookings((prev) => [booking, ...prev]);
    addNotification({
      type: "booking",
      profileId,
      title: "Booking confirmed",
      message: `${b.serviceName} on ${b.date} at ${b.time}`,
      avatar: "📅",
    });
  };

  /* --------------------------------- Ads --------------------------------- */
  const addAd: EngagementContextType["addAd"] = (profileId, a, meta) => {
    const ad: Ad = {
      ...a,
      id: `ad-${Date.now()}`,
      createdBy: profileId,
      createdByName: meta?.name,
      createdByAvatar: meta?.avatar,
      createdAt: Date.now(),
    };
    setAds((prev) => [ad, ...prev]);
    addNotification({
      type: "ad",
      profileId,
      title: "Ad published 🎉",
      message: a.title,
      avatar: "📢",
    });
    return ad;
  };

  const statsFor = (adId: string) => adStats[adId] || { views: 0, clicks: 0 };
  const trackAdView: EngagementContextType["trackAdView"] = (adId, viewerId) => {
    if (typeof window !== "undefined") {
      const k = `at_seen_${viewerId || "anon"}_${adId}`;
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, "1");
    }
    setAdStats((prev) => {
      const cur = prev[adId] || { views: 0, clicks: 0 };
      return { ...prev, [adId]: { ...cur, views: cur.views + 1 } };
    });
  };
  const trackAdClick: EngagementContextType["trackAdClick"] = (adId) => {
    setAdStats((prev) => {
      const cur = prev[adId] || { views: 0, clicks: 0 };
      return { ...prev, [adId]: { ...cur, clicks: cur.clicks + 1 } };
    });
  };

  /* ------------------------------ User posts ----------------------------- */
  const addPost: EngagementContextType["addPost"] = (post) => {
    const p: UserPost = { ...post, id: Date.now(), createdAt: Date.now() };
    setUserPosts((prev) => [p, ...prev]);
    return p;
  };

  /* ---------------------------- Subscriptions ---------------------------- */
  const subscriptionFor = (profileId: string) => subscriptions[profileId] || null;
  const setSubscription: EngagementContextType["setSubscription"] = (profileId, plan, price, paymentLast4) => {
    const sub: Subscription = {
      profileId,
      plan,
      price,
      status: "active",
      startedAt: Date.now(),
      renewsAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      paymentLast4,
    };
    setSubscriptions((prev) => ({ ...prev, [profileId]: sub }));
    addNotification({
      type: "system",
      profileId,
      title: "Subscription active",
      message: `${plan[0].toUpperCase() + plan.slice(1)} plan · $${price}/mo`,
      avatar: "✨",
    });
    return sub;
  };
  const cancelSubscription: EngagementContextType["cancelSubscription"] = (profileId) => {
    setSubscriptions((prev) => {
      const next = { ...prev };
      if (next[profileId]) next[profileId] = { ...next[profileId], status: "cancelled" };
      return next;
    });
  };

  const value = useMemo<EngagementContextType>(
    () => ({
      isLiked,
      toggleLike,
      likeCountFor,
      isSaved,
      toggleSave,
      isFollowing,
      toggleFollow,
      commentsFor,
      addComment,
      notifications,
      addNotification,
      markNotificationRead,
      markAllRead,
      clearMessageNotifications,
      unreadCountFor,
      cart,
      cartItemsFor,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      cartCount,
      cartSubtotal,
      orders,
      ordersFor,
      placeOrder,
      bookings,
      addBooking,
      ads,
      addAd,
      adStats,
      statsFor,
      trackAdView,
      trackAdClick,
      userPosts,
      addPost,
      subscriptions,
      subscriptionFor,
      setSubscription,
      cancelSubscription,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [likes, saves, follows, comments, notifications, cart, orders, bookings, ads, adStats, userPosts, subscriptions]
  );

  return <EngagementContext.Provider value={value}>{children}</EngagementContext.Provider>;
};
