import { Platform } from "react-native";
import { io, Socket } from "socket.io-client";
import { formatRelativeTime } from "@/utils/timeAgo";
import { feedPosts, type FeedPost } from "@/data/feedData";

export function getBaseUrl(): string {
  let url = process.env.EXPO_PUBLIC_API_URL || "https://animal-tok-backend.onrender.com/api";
  if (Platform.OS === "android" && url.includes("localhost")) {
    url = url.replace("localhost", "10.0.2.2");
  }
  return url;
}

export function getSocketUrl(): string {
  const base = getBaseUrl();
  return base.replace(/\/api\/?$/, "");
}

const BASE_URL = getBaseUrl();

let globalSocket: Socket | null = null;

// In-memory cache to store profile edits during the session
const profileCache: Record<string, any> = {};

/**
 * Upload a local file URI (from ImagePicker or DocumentPicker) to Cloudinary
 * via the backend /api/upload endpoint.
 *
 * Returns the Cloudinary secure_url of the uploaded file.
 */
export async function uploadMedia(
  localUri: string,
  folder = "animaltok/media",
  resourceType: "auto" | "image" | "video" | "raw" = "auto"
): Promise<string | null> {
  try {
    // If it's already a remote URL, return it directly
    if (localUri.startsWith("http://") || localUri.startsWith("https://")) {
      return localUri;
    }

    // If it's a data URI (base64 from Web), send it via JSON
    if (localUri.startsWith("data:")) {
      const response = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: localUri, folder, resourceType }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.secure_url || data.url || null;
      }
    }

    const filename = localUri.split("/").pop() || "upload";
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1].toLowerCase() : "jpg";
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
      gif: "image/gif", webp: "image/webp",
      mp4: "video/mp4", mov: "video/quicktime", avi: "video/x-msvideo",
      mp3: "audio/mpeg", m4a: "audio/mp4", wav: "audio/wav",
    };
    const type = mimeTypes[ext] || "application/octet-stream";

    const formData = new FormData();

    if (Platform.OS === "web" && localUri.startsWith("blob:")) {
      const resp = await fetch(localUri);
      const blob = await resp.blob();
      formData.append("file", blob, `upload.${ext}`);
    } else {
      formData.append("file", { uri: localUri, name: filename, type } as any);
    }

    formData.append("folder", folder);
    formData.append("resourceType", resourceType);

    const response = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.warn("Upload failed on server, using local fallback");
      return localUri;
    }

    const data = await response.json();
    return data.secure_url || data.url || localUri;
  } catch (e) {
    console.error("uploadMedia error:", e);
    return localUri;
  }
}

/**
 * Upload multiple local file URIs to Cloudinary.
 * Returns an array of Cloudinary secure_urls.
 */
export async function uploadMultipleMedia(
  localUris: string[],
  folder = "animaltok/gallery"
): Promise<string[]> {
  const results = await Promise.all(localUris.map(uri => uploadMedia(uri, folder)));
  return results.filter(Boolean) as string[];
}


export interface AnimalProfileData {
  id: string;
  name: string;
  username: string;
  followers: number;
  bio: string;
  breed: string;
  age: string;
  location: string;
  handler: string;
  handlerId?: string;
  handlerName?: string;
  avatar: string;
  coverImage: string;
  photos: string[];
}

export const api = {
  /**
   * Connect to the real-time websocket
   */
  connectSocket: (userIdOrProfileId?: string) => {
    if (!globalSocket) {
      globalSocket = io(getSocketUrl(), {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 20,
        reconnectionDelay: 1000,
      });

      globalSocket.on("connect", () => {
        console.log("🔌 Connected to real-time socket server:", globalSocket?.id);
      });
    }

    if (userIdOrProfileId) {
      if (globalSocket.connected) {
        globalSocket.emit("join_user", userIdOrProfileId);
        globalSocket.emit("join_profile", userIdOrProfileId);
      } else {
        globalSocket.once("connect", () => {
          globalSocket?.emit("join_user", userIdOrProfileId);
          globalSocket?.emit("join_profile", userIdOrProfileId);
        });
      }
    }
    return globalSocket;
  },

  getSocket: () => globalSocket,

  /**
   * Disconnect from the websocket
   */
  disconnectSocket: () => {
    if (globalSocket) {
      globalSocket.disconnect();
      globalSocket = null;
    }
  },

  /**
   * Fetch an animal profile by ID from the Express backend with local fallback
   */
  getAnimalProfile: async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/animal/${id}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      return {
        ...data,
        followers: Number(data.followers ?? data.followersCount ?? 0),
        handler: data.handler || data.handlerName || "Alex Morgan",
        photos: data.photos || [
          "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=500&auto=format&fit=crop&q=80"
        ]
      };
    } catch (e) {
      console.warn("Backend profile fetch failed, using fallback mock", e);
      
      if (profileCache[id]) {
        return profileCache[id];
      }

      let defaultData;
      if (id === "2" || id.toLowerCase().includes("luna")) {
        defaultData = {
          id: "2",
          name: "Luna",
          username: "@luna.cat",
          followers: 0,
          likes: "0",
          bio: "Box enthusiast and laser pointer chaser 📦🐈",
          breed: "Maine Coon",
          age: "4 yrs",
          location: "Austin, TX",
          handler: "Alex Morgan",
          avatar: "🐈",
          coverImage: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80",
          photos: [
            "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=500&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&auto=format&fit=crop&q=80"
          ]
        };
      } else if (id === "3" || id.toLowerCase().includes("coco")) {
        defaultData = {
          id: "3",
          name: "Coco",
          username: "@coco.parrot",
          followers: 0,
          likes: "0",
          bio: "Talkative and loves seeds! 🦜✨",
          breed: "Macaw Parrot",
          age: "6 yrs",
          location: "Austin, TX",
          handler: "Alex Morgan",
          avatar: "🦜",
          coverImage: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80",
          photos: [
            "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=500&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1601138248889-8d8a7c29bece?w=500&auto=format&fit=crop&q=80"
          ]
        };
      } else if (id === "1" || id === "bailey" || id.toLowerCase().includes("bailey")) {
        defaultData = {
          id: "1",
          name: "Bailey",
          username: "@bailey.thelab",
          followers: 0,
          likes: "0",
          bio: "Obsessed with tennis balls & park swims. 🎾🐕",
          breed: "Golden Retriever",
          age: "2 yrs",
          location: "Austin, TX",
          handler: "Alex Morgan",
          avatar: "🐕",
          coverImage: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop&q=80",
          photos: [
            "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=500&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=80"
          ]
        };
      } else {
        defaultData = {
          id: id,
          name: id.startsWith("a_") ? "Pet" : id.charAt(0).toUpperCase() + id.slice(1),
          username: `@${id.toLowerCase().replace(/[^a-z0-9_]/g, "")}.pet`,
          followers: 0,
          likes: "0",
          bio: "Loving life on AnimalTok! 🐾",
          breed: "Pet",
          age: "1 yr",
          location: "Global",
          handler: "Alex Morgan",
          avatar: "🐾",
          coverImage: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80",
          photos: []
        };
      }
      
      // If we have cached edits for this profile, merge them
      if (profileCache[id]) {
        return { ...defaultData, ...profileCache[id] };
      }
      return defaultData;
    }
  },

  /**
   * Create a new animal profile in backend and local cache
   */
  createAnimal: async (data: any) => {
    try {
      const response = await fetch(`${BASE_URL}/animals/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const result = await response.json();
        if (result && result.id) {
          profileCache[result.id] = result;
        }
        return result;
      }
    } catch (e) {
      console.warn("createAnimal network failed, using local result:", e);
    }
    const fallbackId = `a_${Date.now()}`;
    const localAnimal = {
      id: fallbackId,
      ...data,
      followers: 0,
      likes: "0",
    };
    profileCache[fallbackId] = localAnimal;
    return localAnimal;
  },

  /**
   * Update profile data (Neon Postgres backend + local cache)
   * Supports both animal profiles (/api/animals/:id) and handler profiles (/api/auth/me)
   */
  updateProfile: async (id: string, data: any) => {
    try {
      profileCache[id] = { ...(profileCache[id] || {}), ...data };

      const isUser = id.startsWith("u_") || id.startsWith("user-");
      const url = isUser ? `${BASE_URL}/auth/me` : `${BASE_URL}/animals/${id}`;
      const body = isUser ? { userId: id, ...data } : data;

      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const updated = await response.json();
        profileCache[id] = { ...profileCache[id], ...(updated.animal || updated.user || updated) };
        return { success: true, data: updated };
      }

      // If animal PUT failed with 404, try user PUT
      if (!isUser && response.status === 404) {
        const userRes = await fetch(`${BASE_URL}/auth/me`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id, ...data }),
        });
        if (userRes.ok) return { success: true };
      }

      return { success: true };
    } catch (e) {
      console.warn("Backend updateProfile failed, saved to local cache:", e);
      return { success: true };
    }
  },

  /**
   * Fetch handler profile data from backend with cache & fallback
   */
  getHandlerProfile: async (id: string) => {
    const defaultData = {
      followers: 0,
      following: 0,
      likes: "0",
      bio: "Pet parent & animal advocate. Managing profiles for Bailey, Luna, and Coco! 🐾",
      name: "Alex Morgan",
      username: "@alex.morgan",
      badges: [
        { icon: "🏆", label: "Top Creator 2026" },
        { icon: "🎓", label: "Good Citizen Dog" }
      ]
    };

    try {
      const response = await fetch(`${BASE_URL}/auth/me?userId=${encodeURIComponent(id)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          return {
            ...defaultData,
            name: data.user.name,
            username: data.user.username.startsWith("@") ? data.user.username : `@${data.user.username}`,
            bio: data.user.bio || defaultData.bio,
            ...(profileCache[id] || {})
          };
        }
      }
    } catch (e) {
      console.warn("Backend handler fetch failed, using fallback:", e);
    }

    if (profileCache[id]) {
      return { ...defaultData, ...profileCache[id] };
    }
    return defaultData;
  },

  /**
   * Check if user is following an animal
   */
  checkIsFollowing: async (animalId: string, userId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/follow/check?animalId=${animalId}&userId=${userId}`);
      if (!response.ok) return false;
      const data = await response.json();
      return !!data.isFollowing;
    } catch (e) {
      return false;
    }
  },

  /**
   * Toggle follow state via POST to Express API
   */
  toggleFollow: async (animalId: string, userId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ animalId, userId })
      });
      if (!response.ok) throw new Error("Failed to toggle follow");
      return await response.json();
    } catch (e) {
      console.error("Failed to save follow state", e);
      return { isFollowing: false, followerCount: 0 };
    }
  },

  /**
   * Real-time like post
   */
  likePost: async (postId: string, userId?: string) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      if (!response.ok) throw new Error("Failed to like post");
      const data = await response.json();
      return {
        isLiked: Boolean(data.isLiked),
        likes: typeof data.likesCount === "number" ? data.likesCount : (data.likes ?? 0),
        likesCount: typeof data.likesCount === "number" ? data.likesCount : (data.likes ?? 0),
      };
    } catch (e) {
      console.error("Failed to like post", e);
      return null;
    }
  },

  /**
   * Real-time share post
   */
  sharePost: async (postId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/${postId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to share post");
      const data = await response.json();
      const count = typeof data.sharesCount === "number" ? data.sharesCount : (data.shares ?? 1);
      return { success: true, shares: count, sharesCount: count };
    } catch (e) {
      console.error("Failed to share post", e);
      return null;
    }
  },

  /**
   * Real-time comment post
   */
  commentPost: async (postId: string, comment: any) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comment)
      });
      if (!response.ok) throw new Error("Failed to comment");
      return await response.json();
    } catch (e) {
      console.error("Failed to comment", e);
      return null;
    }
  },

  /**
   * Fetch real comments for post
   */
  getComments: async (postId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/${postId}/comments`);
      if (!response.ok) return [];
      const data = await response.json();
      if (!Array.isArray(data)) return [];
      return data.map((c: any) => ({
        user: c.user || "@guest",
        avatar: c.avatar || "🐾",
        text: c.text || "",
        time: formatRelativeTime(c.createdAt, c.id),
        createdAt: c.createdAt,
      }));
    } catch (e) {
      console.warn("Failed to fetch comments", e);
      return [];
    }
  },

  /**
   * Fetch live notifications
   */
  getNotifications: async (userId?: string) => {
    if (!userId || userId === "null" || userId === "undefined") return [];
    try {
      const response = await fetch(`${BASE_URL}/notifications?userId=${encodeURIComponent(userId)}`);
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return await response.json();
    } catch (e) {
      console.error("Failed to fetch notifications", e);
      return [];
    }
  },

  /**
   * Mark all notifications as read
   */
  markNotificationsRead: async (userId?: string) => {
    if (!userId || userId === "null" || userId === "undefined") return { success: false };
    try {
      const response = await fetch(`${BASE_URL}/notifications/read-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      return await response.json();
    } catch (e) {
      console.error("Failed to mark notifications as read", e);
      return { success: false };
    }
  },

  /**
   * Fetch user conversation threads for the Inbox
   */
  getInboxThreads: async (userId?: string) => {
    if (!userId || userId === "null" || userId === "undefined") return [];
    try {
      const response = await fetch(`${BASE_URL}/messages/threads?userId=${encodeURIComponent(userId)}`);
      if (!response.ok) throw new Error("Failed to fetch inbox threads");
      return await response.json();
    } catch (e) {
      console.warn("Failed to fetch inbox threads", e);
      return [];
    }
  },

  /**
   * Fetch live feed posts from the Express API with pagination and fallback
   */
  getFeedPosts: async (page = 1, limit = 10): Promise<FeedPost[]> => {
    try {
      const response = await fetch(`${BASE_URL}/feed?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch feed");
      const data = await response.json();
      if (!Array.isArray(data)) return page === 1 ? feedPosts : [];
      if (data.length === 0 && page === 1) return feedPosts;
      return data.map((p: any) => ({
        id: p.id,
        animalId: p.animalId || p.animal_id,
        username: p.animalUsername || `@${(p.animalName || 'pet').toLowerCase().replace(/\s+/g, '')}`,
        displayName: p.animalName || "Pet",
        avatar: p.animalAvatar || "🐾",
        time: formatRelativeTime(p.createdAt, p.id),
        createdAt: p.createdAt,
        caption: p.caption || "",
        hashtags: Array.isArray(p.tags) ? p.tags.map((t: string) => `#${t.replace(/^#/, '')}`).join(' ') : (p.tags || "#AnimalTok"),
        videoUrl: p.videoUrl || "",
        posterUrl: p.imageUrl || p.videoUrl || "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=700&fit=crop",
        imageUrl: p.imageUrl || "",
        audioUrl: p.audioUrl,
        audioName: p.audioName,
        likes: p.likesCount || 0,
        comments: p.commentsCount || 0,
        saves: p.sharesCount || 0,
        commentsList: []
      }));
    } catch (e) {
      console.warn("Backend feed fetch failed, using fallback mock", e);
      return page === 1 ? feedPosts : [];
    }
  },

  /**
   * Create new post on backend API
   */
  createPost: async (postData: {
    animalId?: string;
    animalName?: string;
    animalUsername?: string;
    animalAvatar?: string;
    caption: string;
    videoUrl?: string;
    imageUrl?: string;
    tags?: string[];
    audioUrl?: string;
    audioName?: string;
  }) => {
    try {
      const response = await fetch(`${BASE_URL}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData)
      });
      if (!response.ok) throw new Error("Failed to create post");
      return await response.json();
    } catch (e) {
      console.error("Failed to create post on server", e);
      return null;
    }
  },

  /**
   * Delete post on backend API
   */
  deletePost: async (postId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/feed/${encodeURIComponent(postId)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete post");
      return await response.json();
    } catch (e) {
      console.warn("Failed to delete post on server", e);
      return null;
    }
  },

  /**
   * Fetch thread messages
   */
  getThreadMessages: async (threadId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/messages/${encodeURIComponent(threadId)}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return await response.json();
    } catch (e) {
      console.warn("Backend messages fetch failed, using fallback", e);
      return [];
    }
  },

  /**
   * Send real-time 1-on-1 message
   */
  sendMessage: async (
    threadId: string,
    text: string,
    senderId?: string,
    recipientId?: string,
    senderName?: string,
    senderAvatar?: string,
    recipientName?: string,
    recipientAvatar?: string
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          text,
          senderId,
          recipientId,
          senderName,
          senderAvatar,
          recipientName,
          recipientAvatar,
        })
      });
      if (!response.ok) throw new Error("Failed to send message");
      return await response.json();
    } catch (e) {
      console.error("Failed to send message via API", e);
      return null;
    }
  },

  /**
   * Fetch live marketplace products with fallback
   */
  getMarketplaceProducts: async () => {
    try {
      const response = await fetch(`${BASE_URL}/marketplace/products`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((p: any) => ({
          id: p.id,
          name: p.title || p.name || "Pet Product",
          price: typeof p.price === "number" ? `$${p.price.toFixed(2)}` : (p.price || "$19.99"),
          rating: String(p.rating || "5.0"),
          seller: p.sellerName || p.seller || "Verified Seller",
          image: p.image || "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500&auto=format&fit=crop&q=80",
          category: p.category || "General",
        }));
      }
      return null;
    } catch (e) {
      console.warn("Backend products fetch failed, using fallback", e);
      return null;
    }
  },

  /**
   * Fetch live marketplace services with fallback
   */
  getMarketplaceServices: async () => {
    try {
      const response = await fetch(`${BASE_URL}/marketplace/services`);
      if (!response.ok) throw new Error("Failed to fetch services");
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((s: any) => ({
          id: s.id,
          name: s.title || s.name || "Pet Service",
          price: s.price || "$40/session",
          rating: String(s.rating || "5.0"),
          provider: s.providerName || s.provider || "Top Rated Pro",
          image: s.image || "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500&auto=format&fit=crop&q=80",
        }));
      }
      return null;
    } catch (e) {
      console.warn("Backend services fetch failed, using fallback", e);
      return null;
    }
  },

  /**
   * Fetch live events with fallback
   */
  getEvents: async () => {
    try {
      const response = await fetch(`${BASE_URL}/events`);
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((e: any) => ({
          id: e.id,
          title: e.title,
          date: e.date ? `${e.date} • ${e.time || '10:00 AM'}` : (e.time || "Upcoming"),
          location: e.location || "Community Park",
          attendees: Number(e.attendeesCount || e.attendees || 0),
          category: e.category || "Meetup",
          description: e.description || "",
          isAttending: !!e.isAttending,
        }));
      }
      return null;
    } catch (e) {
      console.warn("Backend events fetch failed, using fallback", e);
      return null;
    }
  },

  /**
   * Toggle RSVP for an event
   */
  toggleEventRsvp: async (eventId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to toggle RSVP");
      return await response.json();
    } catch (e) {
      console.error("Backend RSVP failed:", e);
      return null;
    }
  },

  /**
   * Create new event on backend
   */
  createEvent: async (data: {
    title: string;
    date: string;
    time?: string;
    location: string;
    category?: string;
    petType?: string;
    description?: string;
    image?: string;
    organizerId?: string;
    organizerName?: string;
  }) => {
    try {
      const response = await fetch(`${BASE_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create event");
      return await response.json();
    } catch (e) {
      console.error("Failed to create event:", e);
      return null;
    }
  },

  /**
   * Create new marketplace product on backend
   */
  createProduct: async (data: {
    title: string;
    price: number | string;
    category?: string;
    image?: string;
    description?: string;
    sellerId?: string;
  }) => {
    try {
      const response = await fetch(`${BASE_URL}/marketplace/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create product");
      return await response.json();
    } catch (e) {
      console.error("Failed to create product:", e);
      return null;
    }
  },

  /**
   * Create new marketplace service on backend
   */
  createService: async (data: {
    title: string;
    price: string;
    category?: string;
    image?: string;
    description?: string;
    providerId?: string;
    location?: string;
  }) => {
    try {
      const response = await fetch(`${BASE_URL}/marketplace/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create service");
      return await response.json();
    } catch (e) {
      console.error("Failed to create service:", e);
      return null;
    }
  },

  /**
   * Register device push notification token with backend
   */
  registerPushToken: async (userId: string, pushToken: string) => {
    try {
      const response = await fetch(`${BASE_URL}/notifications/register-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, pushToken }),
      });
      return await response.json();
    } catch (e) {
      console.warn("Failed to register push token with backend:", e);
      return null;
    }
  },

  /**
   * Initialize Paystack payment session
   */
  initializePaystackPayment: async (data: {
    email: string;
    amount: number;
    currency?: string;
    metadata?: Record<string, any>;
    callback_url?: string;
  }): Promise<{ status: boolean; message: string; data?: { authorization_url: string; access_code: string; reference: string } } | null> => {
    try {
      const response = await fetch(`${BASE_URL}/payments/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (e) {
      console.error("Failed to initialize Paystack payment:", e);
      return null;
    }
  },

  /**
   * Verify Paystack payment reference
   */
  verifyPaystackPayment: async (reference: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/payments/verify/${encodeURIComponent(reference)}`);
      return await response.json();
    } catch (e) {
      console.error("Failed to verify Paystack payment:", e);
      return null;
    }
  }
};
