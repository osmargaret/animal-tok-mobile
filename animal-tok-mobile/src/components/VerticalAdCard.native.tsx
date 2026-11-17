import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
  Easing,
  Linking,
  Platform,
  Share,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Audio } from "expo-av";
import {
  Heart,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Disc,
} from "lucide-react-native";
import type { FeedPost } from "@/data/feedData";
import { api } from "@/services/api";

interface VerticalAdCardProps {
  post: FeedPost;
  isActive: boolean;
}

export default function VerticalAdCard({ post, isActive }: VerticalAdCardProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Number(post.likes || 1420));
  const [isSaved, setIsSaved] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(isActive);
  const soundObjRef = useRef<Audio.Sound | null>(null);

  // Subtle breathing / Ken-Burns animation for Image Ads
  const scaleAnim = useRef(new Animated.Value(1)).current;
  // Vinyl spinning animation for Audio Ads
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Determine Ad Format
  const adType = post.adType || (post.videoUrl && post.videoUrl.trim().length > 0 ? "video" : post.audioUrl ? "audio" : "image");

  // Track impression once per card activation
  const impressionLoggedRef = useRef(false);
  useEffect(() => {
    if (isActive && !impressionLoggedRef.current) {
      impressionLoggedRef.current = true;
      api.recordAdImpression(String(post.id));
    }
  }, [isActive, post.id]);

  // Video Player instance
  const videoSource = adType === "video" && post.videoUrl ? { uri: post.videoUrl } : null;
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = isMuted;
  });

  // Sync Video playback with isActive
  useEffect(() => {
    if (adType === "video" && player) {
      if (isActive) {
        player.play();
      } else {
        player.pause();
      }
    }
  }, [isActive, player, adType]);

  // Image Ken-Burns zoom effect
  useEffect(() => {
    if (adType === "image" && isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.08,
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isActive, adType]);

  // Audio spinning vinyl effect & playback
  useEffect(() => {
    let sound: Audio.Sound | null = null;

    if (adType === "audio") {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 7000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      if (isActive && post.audioUrl) {
        (async () => {
          try {
            await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
            const { sound: s } = await Audio.Sound.createAsync(
              { uri: post.audioUrl! },
              { shouldPlay: true, isLooping: true, isMuted }
            );
            sound = s;
            soundObjRef.current = s;
            setAudioPlaying(true);
          } catch (e) {
            console.warn("Audio ad play error:", e);
          }
        })();
      }
    }

    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
      soundObjRef.current = null;
      setAudioPlaying(false);
    };
  }, [isActive, adType, post.audioUrl]);

  // Sync mute state
  useEffect(() => {
    if (player) {
      player.muted = isMuted;
    }
    if (soundObjRef.current) {
      soundObjRef.current.setIsMutedAsync(isMuted).catch(() => {});
    }
  }, [isMuted, player]);

  const handleCtaPress = async () => {
    api.recordAdClick(String(post.id));
    const targetUrl = post.ctaUrl || "https://animandler.com";
    try {
      const supported = await Linking.canOpenURL(targetUrl);
      if (supported) {
        await Linking.openURL(targetUrl);
      } else {
        await Linking.openURL("https://animandler.com");
      }
    } catch (e) {
      console.warn("Failed to open CTA URL:", e);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: post.title || post.advertiserName || "Animandler Partner",
        message: `Check out ${post.advertiserName} on Animandler: ${post.caption} - ${post.ctaUrl || 'https://animandler.com'}`,
      });
    } catch (e) {}
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, { width: windowWidth, height: windowHeight }]}>
      {/* ─── 1. MEDIA LAYER (Video, Picture, or Audio) ─── */}
      {adType === "video" && player ? (
        <VideoView
          player={player}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          nativeControls={false}
        />
      ) : adType === "image" ? (
        <Animated.Image
          source={{ uri: post.imageUrl || post.posterUrl || post.mediaUrl }}
          style={[StyleSheet.absoluteFillObject, { transform: [{ scale: scaleAnim }] }]}
          resizeMode="cover"
        />
      ) : (
        /* Audio Ad Backdrop with spinning disc & glow */
        <View style={[StyleSheet.absoluteFillObject, styles.audioBackdrop]}>
          <View style={styles.audioAmbientGlow} />
          <Animated.View style={[styles.vinylDisc, { transform: [{ rotate: spin }] }]}>
            <View style={styles.vinylGroove} />
            <Image
              source={{ uri: post.advertiserAvatar || post.posterUrl }}
              style={styles.vinylCenterAvatar}
            />
          </Animated.View>
          <View style={styles.audioWavePill}>
            <Sparkles size={14} color="#06b6d4" />
            <Text style={styles.audioWaveText}>Sponsored Audio • {post.audioName || "Artist Single"}</Text>
          </View>
        </View>
      )}

      {/* ─── 2. CINEMATIC GRADIENT OVERLAY ─── */}
      <View style={styles.vignetteOverlay} />

      {/* ─── 3. TOP SPONSOR BAR ─── */}
      <View style={styles.topSponsorRow}>
        <View style={styles.sponsorBadgeBox}>
          <ShieldCheck size={12} color="#000" />
          <Text style={styles.sponsorBadgeText}>
            {post.sponsorBadge ? post.sponsorBadge.toUpperCase() : "SPONSORED"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsMuted(!isMuted)}
          style={styles.muteButton}
          activeOpacity={0.8}
        >
          {isMuted ? <VolumeX size={18} color="#fff" /> : <Volume2 size={18} color="#fff" />}
        </TouchableOpacity>
      </View>

      {/* ─── 4. RIGHT SIDE ACTIONS ─── */}
      <View style={styles.rightActionsColumn}>
        {/* Like */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconCircle, isLiked && styles.actionIconLiked]}>
            <Heart size={24} color={isLiked ? "#ff2b54" : "#ffffff"} fill={isLiked ? "#ff2b54" : "none"} />
          </View>
          <Text style={styles.actionCount}>{likeCount.toLocaleString()}</Text>
        </TouchableOpacity>

        {/* Bookmark / Save */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setIsSaved(!isSaved)}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconCircle, isSaved && styles.actionIconSaved]}>
            <Bookmark size={22} color={isSaved ? "#fbbf24" : "#ffffff"} fill={isSaved ? "#fbbf24" : "none"} />
          </View>
          <Text style={styles.actionCount}>{isSaved ? "Saved" : "Save"}</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.8}>
          <View style={styles.actionIconCircle}>
            <Share2 size={22} color="#ffffff" />
          </View>
          <Text style={styles.actionCount}>{post.saves || 42}</Text>
        </TouchableOpacity>
      </View>

      {/* ─── 5. BOTTOM ADVERTISER INFO & CALL TO ACTION ─── */}
      <View style={styles.bottomInfoContainer}>
        {/* Advertiser Header */}
        <View style={styles.advertiserHeader}>
          <Image
            source={{ uri: post.advertiserAvatar || post.avatar || "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=150&auto=format&fit=crop&q=80" }}
            style={styles.advertiserLogo}
          />
          <View style={styles.advertiserTextWrap}>
            <View style={styles.advertiserNameRow}>
              <Text style={styles.advertiserName} numberOfLines={1}>
                {post.advertiserName || post.displayName}
              </Text>
              <ShieldCheck size={14} color="#06b6d4" />
            </View>
            <Text style={styles.advertiserCategory}>
              {post.category || "Verified Veterinary Partner"}
            </Text>
          </View>
        </View>

        {/* Headline */}
        {post.title ? (
          <Text style={styles.adTitle} numberOfLines={2}>
            {post.title}
          </Text>
        ) : null}

        {/* Caption */}
        <Text style={styles.adCaption} numberOfLines={3}>
          {post.caption}
        </Text>

        {/* High-Converting CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleCtaPress}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaButtonText}>{post.ctaText || "Learn More"}</Text>
          <ExternalLink size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0b0f19",
    position: "relative",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  audioBackdrop: {
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  audioAmbientGlow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(6, 182, 212, 0.22)",
    shadowColor: "#06b6d4",
    shadowOpacity: 0.8,
    shadowRadius: 50,
  },
  vinylDisc: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#090d16",
    borderWidth: 6,
    borderColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 10,
  },
  vinylGroove: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  vinylCenterAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#06b6d4",
  },
  audioWavePill: {
    position: "absolute",
    bottom: 220,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.4)",
  },
  audioWaveText: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "700",
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    // Note: linear gradients in React Native can be achieved with expo-linear-gradient or layered backdrops
  },
  topSponsorRow: {
    position: "absolute",
    top: Platform.OS === "ios" ? 54 : 40,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 20,
  },
  sponsorBadgeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f59e0b",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: "#f59e0b",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  sponsorBadgeText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  muteButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  rightActionsColumn: {
    position: "absolute",
    right: 14,
    bottom: 120,
    alignItems: "center",
    gap: 16,
    zIndex: 25,
  },
  actionBtn: {
    alignItems: "center",
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  actionIconLiked: {
    borderColor: "rgba(255, 43, 84, 0.6)",
  },
  actionIconSaved: {
    borderColor: "rgba(251, 191, 36, 0.6)",
  },
  actionCount: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomInfoContainer: {
    position: "absolute",
    left: 16,
    right: 80,
    bottom: Platform.OS === "ios" ? 44 : 26,
    zIndex: 20,
  },
  advertiserHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  advertiserLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#06b6d4",
  },
  advertiserTextWrap: {
    flex: 1,
  },
  advertiserNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  advertiserName: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  advertiserCategory: {
    color: "#06b6d4",
    fontSize: 12,
    fontWeight: "700",
  },
  adTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20,
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  adCaption: {
    color: "rgba(255, 255, 255, 0.88)",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#06b6d4",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});

