import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Audio } from "expo-av";
import { Heart, MessageCircle, Share2, Music, Play, Volume2, VolumeX, Sparkles, Bookmark } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import type { FeedPost } from "@/data/feedData";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface VideoPostProps {
  post: FeedPost;
  isActive: boolean;
  onCommentOpen?: () => void;
  onEventsOpen?: () => void;
  onAuthPrompt?: () => void;
}

export default function VideoPost({
  post,
  isActive,
  onCommentOpen,
  onEventsOpen,
  onAuthPrompt,
}: VideoPostProps) {
  if (!post) return null;

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const router = useRouter();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(Boolean((post as any)?.isLiked));
  const [likeCount, setLikeCount] = useState(Number(post?.likes ?? (post as any)?.likesCount ?? 0));
  const [sharesCount, setSharesCount] = useState(Number(post?.saves ?? (post as any)?.sharesCount ?? 0));
  const [commentCount, setCommentCount] = useState(Number(post?.comments ?? (post as any)?.commentsCount ?? 0));
  const [isSaved, setIsSaved] = useState(false);
  const [savesCount, setSavesCount] = useState(Number(post?.saves ?? (post as any)?.savesCount ?? 0));
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [isMuted, setIsMuted] = useState(false);
  const [showMuteToast, setShowMuteToast] = useState(false);
  const muteToastTimer = useRef<any>(null);
  const [showPlayPulse, setShowPlayPulse] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Sync real-time post stats when post changes & check saved state
  useEffect(() => {
    if (post) {
      setLikeCount(Number(post?.likes ?? (post as any)?.likesCount ?? 0));
      setSharesCount(Number(post?.saves ?? (post as any)?.sharesCount ?? 0));
      setCommentCount(Number(post?.comments ?? (post as any)?.commentsCount ?? 0));
      setSavesCount(Number(post?.saves ?? (post as any)?.savesCount ?? 0));
      setIsLiked(Boolean((post as any)?.isLiked));

      // Check saved posts in AsyncStorage
      const checkSaved = async () => {
        try {
          const stored = await AsyncStorage.getItem("animaltok_saved_posts");
          if (stored) {
            const list = JSON.parse(stored);
            if (Array.isArray(list)) {
              setIsSaved(list.some((p: any) => String(p.id) === String(post.id)));
            }
          }
        } catch (e) {}
      };
      checkSaved();
    }
  }, [post?.id, post?.likes, post?.comments, post?.saves]);

  const isVideo = Boolean(post.videoUrl && post.videoUrl.trim().length > 0 && !post.videoUrl.match(/\.(png|jpg|jpeg|webp|gif)$/i));

  // Modern expo-video player instance
  const videoSource = isVideo ? { uri: post.videoUrl } : null;
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = isMuted || !!post.audioUrl;
  });

  useEffect(() => {
    setIsPlaying(isActive);
    if (!isActive) {
      if (isVideo && player) {
        try {
          player.pause();
        } catch (e) {}
      }
      if (webAudioRef.current) {
        try {
          webAudioRef.current.pause();
          webAudioRef.current.currentTime = 0;
        } catch (e) {}
      }
      if (nativeSoundRef.current) {
        try {
          nativeSoundRef.current.pauseAsync().catch(() => {});
          nativeSoundRef.current.setPositionAsync(0).catch(() => {});
        } catch (e) {}
      }
    } else {
      if (isVideo && player) {
        try {
          player.play();
        } catch (e) {}
      }
      if (webAudioRef.current && !isMuted) {
        try {
          webAudioRef.current.play().catch(() => {});
        } catch (e) {}
      }
      if (nativeSoundRef.current && !isMuted) {
        try {
          nativeSoundRef.current.playAsync().catch(() => {});
        } catch (e) {}
      }
    }
  }, [isActive, isVideo, player, isMuted]);

  useEffect(() => {
    if (player && isVideo) {
      player.muted = isMuted || !!post.audioUrl;
    }
  }, [isMuted, post.audioUrl, player, isVideo]);

  // Audio track playback for both images with audio and videos with custom sound
  const webAudioRef = useRef<any>(null);
  const nativeSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const startAudio = async () => {
      if (!post.audioUrl) return;

      if (Platform.OS === "web" && typeof window !== "undefined") {
        if (!webAudioRef.current) {
          const audio = new window.Audio(post.audioUrl);
          audio.loop = true;
          webAudioRef.current = audio;
        }
        if (isActive && isPlaying && !isMuted) {
          webAudioRef.current.play().catch(() => {});
        } else {
          webAudioRef.current.pause();
        }
      } else {
        try {
          // Configure native audio session for video & music playback
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          }).catch(() => {});

          if (!nativeSoundRef.current) {
            const { sound } = await Audio.Sound.createAsync(
              { uri: post.audioUrl },
              { shouldPlay: isActive && isPlaying && !isMuted, isLooping: true, volume: 1.0 }
            );
            if (isCancelled) {
              sound.unloadAsync().catch(() => {});
              return;
            }
            nativeSoundRef.current = sound;
          } else {
            if (isActive && isPlaying && !isMuted) {
              nativeSoundRef.current.playAsync().catch(() => {});
            } else {
              nativeSoundRef.current.pauseAsync().catch(() => {});
            }
          }
        } catch (err) {
          console.warn("Native audio play error:", err);
        }
      }
    };

    startAudio();

    return () => {
      isCancelled = true;
      if (webAudioRef.current) {
        webAudioRef.current.pause();
      }
      if (nativeSoundRef.current) {
        nativeSoundRef.current.pauseAsync().catch(() => {});
      }
    };
  }, [isActive, isPlaying, isMuted, post.audioUrl]);

  useEffect(() => {
    return () => {
      if (muteToastTimer.current) {
        clearTimeout(muteToastTimer.current);
      }
      if (webAudioRef.current) {
        webAudioRef.current.pause();
        webAudioRef.current = null;
      }
      if (nativeSoundRef.current) {
        nativeSoundRef.current.unloadAsync().catch(() => {});
        nativeSoundRef.current = null;
      }
    };
  }, []);



  const getPillarBadge = () => {
    const text = `${post.caption || ""} ${post.hashtags || ""}`.toLowerCase();
    if (text.includes("sports") || text.includes("agility")) return { label: "🏆 Sports & Agility", color: "#f59e0b" };
    if (text.includes("gaming") || text.includes("game") || text.includes("play")) return { label: "🎮 Pet Gaming", color: "#8b5cf6" };
    if (text.includes("mating") || text.includes("breed") || text.includes("stud")) return { label: "❤️ Mating & Breeding", color: "#ec4899" };
    if (text.includes("vet") || text.includes("health") || text.includes("doctor")) return { label: "🩺 Vet Program", color: "#10b981" };
    if (text.includes("event") || text.includes("meetup")) return { label: "🎉 Pet Event", color: "#06b6d4" };
    return null;
  };

  useEffect(() => {
    if (!post || !post.id) return;

    // Connect to WebSocket for real-time like/share/comment updates
    const socket = api.connectSocket();
    if (!socket) return;

    const onStats = (data: { postId: string; likes: number; isLiked: boolean }) => {
      if (data && data.postId === post.id.toString()) {
        setLikeCount(data.likes);
      }
    };

    const onShare = (data: { postId: string; shares: number }) => {
      if (data && data.postId === post.id.toString()) {
        setSharesCount(data.shares);
      }
    };

    const onComment = (data: { postId: string; totalComments: number }) => {
      if (data && data.postId === post.id.toString()) {
        setCommentCount(data.totalComments);
      }
    };

    socket.on("post_stats_updated", onStats);
    socket.on("post_shared", onShare);
    socket.on("new_comment", onComment);

    return () => {
      socket.off("post_stats_updated", onStats);
      socket.off("post_shared", onShare);
      socket.off("new_comment", onComment);
    };
  }, [post?.id]);

  const handleLike = async () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.0, duration: 120, useNativeDriver: true }),
    ]).start();

    // Optimistic UI Update
    const nextIsLiked = !isLiked;
    setIsLiked(nextIsLiked);
    setLikeCount((prev) => (nextIsLiked ? prev + 1 : Math.max(0, prev - 1)));

    // Send real-time call to backend
    const res = await api.likePost(post.id.toString(), user?.id);
    if (res) {
      setIsLiked(res.isLiked);
      setLikeCount(res.likesCount ?? res.likes ?? (res.isLiked ? likeCount + 1 : Math.max(0, likeCount - 1)));
    }
  };

  const handleShare = async () => {
    setSharesCount((prev) => prev + 1);
    const res = await api.sharePost(post.id.toString());
    if (res && (res.sharesCount !== undefined || res.shares !== undefined)) {
      setSharesCount(res.sharesCount ?? res.shares);
    }
  };

  const handleSave = async () => {
    if (!user && onAuthPrompt) {
      onAuthPrompt();
      return;
    }

    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    setSavesCount((prev) => (nextSaved ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const stored = await AsyncStorage.getItem("animaltok_saved_posts");
      let list = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(list)) list = [];
      if (nextSaved) {
        if (!list.some((p: any) => String(p.id) === String(post.id))) {
          list.unshift(post);
        }
      } else {
        list = list.filter((p: any) => String(p.id) !== String(post.id));
      }
      await AsyncStorage.setItem("animaltok_saved_posts", JSON.stringify(list));
    } catch (e) {
      console.warn("Failed to persist saved post:", e);
    }
  };

  const handleProfilePress = () => {
    const animalId = post.animalId || (post as any)?.animal_id || post.username?.replace(/^@/, "") || "1";
    router.push(`/animal/${animalId}` as const);
  };

  const handleTogglePlay = () => {
    if (!isActive) return;

    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (isVideo && player) {
      try {
        if (nextState) {
          player.play();
        } else {
          player.pause();
        }
      } catch (e) {}
    }

    if (webAudioRef.current) {
      try {
        if (nextState && !isMuted) {
          webAudioRef.current.play().catch(() => {});
        } else {
          webAudioRef.current.pause();
        }
      } catch (e) {}
    }

    if (nativeSoundRef.current) {
      try {
        if (nextState && !isMuted) {
          nativeSoundRef.current.playAsync().catch(() => {});
        } else {
          nativeSoundRef.current.pauseAsync().catch(() => {});
        }
      } catch (e) {}
    }
  };

  const handleToggleMute = (e?: any) => {
    e?.stopPropagation?.();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (isVideo && player) {
      try {
        player.muted = nextMuted || !!post.audioUrl;
      } catch (err) {}
    }

    if (webAudioRef.current) {
      try {
        webAudioRef.current.muted = nextMuted;
        webAudioRef.current.volume = nextMuted ? 0 : 1;
        if (!nextMuted && isPlaying && isActive) {
          webAudioRef.current.play().catch(() => {});
        }
      } catch (err) {}
    }
    if (nativeSoundRef.current) {
      try {
        nativeSoundRef.current.setIsMutedAsync(nextMuted).catch(() => {});
        if (!nextMuted && isPlaying && isActive) {
          nativeSoundRef.current.playAsync().catch(() => {});
        }
      } catch (err) {}
    }

    setShowMuteToast(true);
    if (muteToastTimer.current) clearTimeout(muteToastTimer.current);
    muteToastTimer.current = setTimeout(() => setShowMuteToast(false), 1200);
  };

  return (
    <View style={[styles.container, { width: '100%', height: '100%' }]}>
      {/* Background Video / Image Player with pointerEvents="none" */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {isVideo && player ? (
          <VideoView
            player={player}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            nativeControls={false}
            allowsFullscreen={false}
          />
        ) : (
          <Image
            source={{ uri: post.imageUrl || post.posterUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1" }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        )}
      </View>

      {/* Screen Tap Overlay to Toggle Play / Pause */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleTogglePlay}
        style={StyleSheet.absoluteFillObject}
      >
        {/* Play Icon Indicator when Paused */}
        {isActive && !isPlaying && (
          <View style={styles.playPulseContainer} pointerEvents="none">
            <View style={styles.playPulseCircle}>
              <Play size={44} color="#ffffff" fill="#ffffff" />
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Dark gradient overlay at bottom - reduced to just wrap author text */}
      <View
        style={[
          styles.gradientOverlay,
          Platform.OS === "web" && ({
            background: "linear-gradient(to top, rgba(13, 17, 23, 0.7) 0%, rgba(13, 17, 23, 0.3) 70%, transparent 100%)",
          } as any),
        ]}
        pointerEvents="none"
      />

      {/* Center Toast Feedback for Mute / Unmute */}
      {showMuteToast && (
        <View style={styles.muteToastContainer} pointerEvents="none">
          <View style={[styles.muteToastPill, isMuted && styles.muteToastPillMuted]}>
            {isMuted ? (
              <>
                <VolumeX size={16} color="#06b6d4" />
                <Text style={styles.muteToastTextMuted}>Muted</Text>
              </>
            ) : (
              <>
                <Volume2 size={16} color="#06b6d4" />
                <Text style={styles.muteToastText}>Sound ON</Text>
              </>
            )}
          </View>
        </View>
      )}

      {/* Action Sidebar (Right Side) */}
      <View style={styles.actionSidebar}>
        {/* Profile Avatar Button */}
        <TouchableOpacity style={styles.avatarButton} onPress={handleProfilePress} activeOpacity={0.8}>
          <View style={styles.avatarCircle}>
            <Text style={{ fontSize: 20 }}>{post.avatar || "🐾"}</Text>
          </View>
        </TouchableOpacity>

        {/* Like Button - Bolder, teal green, filled (not outline alone), reduced size */}
        <TouchableOpacity style={styles.actionItem} onPress={handleLike} activeOpacity={0.75}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <View style={[styles.actionIconCircle, isLiked && styles.actionIconCircleLiked]}>
              <Heart
                size={23}
                color={isLiked ? "#ef4444" : "#06b6d4"}
                fill={isLiked ? "#ef4444" : "#06b6d4"}
                strokeWidth={2.6}
              />
            </View>
          </Animated.View>
          <Text style={styles.actionText}>{likeCount}</Text>
        </TouchableOpacity>

        {/* Comment Button - Bolder, teal green, filled (not outline alone), reduced size */}
        <TouchableOpacity style={styles.actionItem} onPress={onCommentOpen} activeOpacity={0.75}>
          <View style={styles.actionIconCircle}>
            <MessageCircle
              size={23}
              color="#06b6d4"
              fill="#06b6d4"
              strokeWidth={2.6}
            />
          </View>
          <Text style={styles.actionText}>{commentCount}</Text>
        </TouchableOpacity>

        {/* Share Button - Bolder, teal green, filled (not outline alone), reduced size */}
        <TouchableOpacity style={styles.actionItem} onPress={handleShare} activeOpacity={0.75}>
          <View style={styles.actionIconCircle}>
            <Share2
              size={21}
              color="#06b6d4"
              fill="#06b6d4"
              strokeWidth={2.6}
            />
          </View>
          <Text style={styles.actionText}>{sharesCount}</Text>
        </TouchableOpacity>

        {/* Save / Bookmark Button */}
        <TouchableOpacity style={styles.actionItem} onPress={handleSave} activeOpacity={0.75}>
          <View style={[styles.actionIconCircle, isSaved && styles.actionIconCircleSaved]}>
            <Bookmark
              size={21}
              color={isSaved ? "#fbbf24" : "#06b6d4"}
              fill={isSaved ? "#fbbf24" : "none"}
              strokeWidth={2.6}
            />
          </View>
          <Text style={[styles.actionText, isSaved && { color: "#fbbf24", fontWeight: "700" }]}>{savesCount}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Info Section */}
      <View style={styles.bottomInfo}>
        {/* Category Pillar Badge */}
        {getPillarBadge() && (
          <View style={[styles.pillarBadge, { backgroundColor: getPillarBadge()!.color }]}>
            <Text style={styles.pillarBadgeText}>{getPillarBadge()!.label}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.userHeader} onPress={handleProfilePress}>
          <Text style={styles.displayName}>{post.displayName}</Text>
          <Text style={styles.username}>{post.username}</Text>
          <Text style={styles.timeTag}>• {post.time}</Text>
        </TouchableOpacity>

        <Text style={styles.caption} numberOfLines={2}>
          {post.caption}
        </Text>
        <Text style={styles.hashtags}>{post.hashtags}</Text>

        {/* Audio ticker with compact matching speaker button */}
        <View style={styles.audioRowContainer}>
          <TouchableOpacity
            style={[styles.prominentSpeakerBtn, isMuted && styles.prominentSpeakerBtnMuted]}
            onPress={handleToggleMute}
            activeOpacity={0.75}
            accessibilityLabel={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? (
              <>
                <VolumeX size={12} color="#94a3b8" strokeWidth={2.4} />
                <Text style={styles.prominentSpeakerTextMuted}>MUTED</Text>
              </>
            ) : (
              <>
                <Volume2 size={12} color="#06b6d4" strokeWidth={2.4} />
                <Text style={styles.prominentSpeakerText}>SOUND</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.audioTickerWrap}
            onPress={handleToggleMute}
            activeOpacity={0.8}
          >
            <Music size={13} color="#06b6d4" />
            <Text style={styles.audioText} numberOfLines={1}>
              {post.audioName ? post.audioName : `Original Sound - ${post.displayName}'s Pet Log`}
            </Text>
            {post.audioName?.toLowerCase().includes("promoted") || post.audioName?.toLowerCase().includes("sponsored") ? (
              <View style={styles.audioPromotedTag}>
                <Sparkles size={10} color="#f59e0b" />
                <Text style={styles.audioPromotedText}>PROMO</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0d1117",
    position: "relative",
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 125,
    backgroundColor: "rgba(13, 17, 23, 0.45)",
  },
  actionSidebar: {
    position: "absolute",
    right: 14,
    bottom: 80,
    alignItems: "center",
    gap: 16,
    zIndex: 20,
  },
  avatarButton: {
    marginBottom: 4,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(13, 17, 23, 0.75)",
    borderWidth: 2,
    borderColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  actionItem: {
    alignItems: "center",
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(13, 17, 23, 0.72)",
    borderWidth: 1.5,
    borderColor: "rgba(6, 182, 212, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  actionIconCircleLiked: {
    borderColor: "rgba(239, 68, 68, 0.6)",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  actionIconCircleSaved: {
    borderColor: "rgba(251, 191, 36, 0.8)",
    backgroundColor: "rgba(251, 191, 36, 0.2)",
  },
  actionText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
    textShadowColor: "rgba(0, 0, 0, 0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomInfo: {
    position: "absolute",
    left: 16,
    right: 75,
    bottom: 52,
    zIndex: 20,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  displayName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  username: {
    color: "#94a3b8",
    fontSize: 13,
  },
  timeTag: {
    color: "#64748b",
    fontSize: 11,
  },
  caption: {
    color: "#f8fafc",
    fontSize: 14,
    lineHeight: 19,
    marginBottom: 4,
  },
  hashtags: {
    color: "#06b6d4",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  audioText: {
    color: "#cbd5e1",
    fontSize: 12,
  },
  playPulseContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  playPulseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  muteTag: {
    color: "#ef4444",
    fontSize: 11,
    fontWeight: "bold",
    marginLeft: 4,
  },
  discContainer: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  discOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#111827",
    borderWidth: 8,
    borderColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  discInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
  },
  pillarBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  pillarBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  audioPromotedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 4,
  },
  audioPromotedText: {
    color: "#fbbf24",
    fontSize: 9,
    fontWeight: "800",
  },
  audioRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  prominentSpeakerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(8, 51, 68, 0.88)",
    borderWidth: 1.2,
    borderColor: "#06b6d4",
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  prominentSpeakerBtnMuted: {
    backgroundColor: "rgba(13, 17, 23, 0.75)",
    borderColor: "rgba(148, 163, 184, 0.4)",
  },
  prominentSpeakerText: {
    color: "#06b6d4",
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  prominentSpeakerTextMuted: {
    color: "#94a3b8",
    fontSize: 9.5,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  audioTickerWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  muteToastContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 40,
  },
  muteToastPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(6, 182, 212, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  muteToastPillMuted: {
    borderColor: "rgba(6, 182, 212, 0.7)",
    backgroundColor: "rgba(15, 23, 42, 0.92)",
  },
  muteToastText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  muteToastTextMuted: {
    color: "#06b6d4",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
