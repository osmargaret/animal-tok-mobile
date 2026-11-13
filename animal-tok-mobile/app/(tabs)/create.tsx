import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  PanResponder,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  Camera,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  Check,
  Music,
  X,
  ChevronDown,
  ShieldCheck,
  PawPrint,
  Trophy,
  Gamepad2,
  Heart,
  Stethoscope,
  Calendar,
  RefreshCw,
  Scissors,
  Zap,
  Sliders,
  RotateCcw,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Bookmark,
  UserPlus,
  LogIn,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfileSwitcherModal from "@/components/ProfileSwitcherModal.native";
import SoundPickerModal from "@/components/SoundPickerModal.native";
import LiveCameraModal from "@/components/LiveCameraModal";
import GuestAuthModal from "@/components/GuestAuthModal";
import { feedPosts } from "@/data/feedData";
import { api, uploadMedia } from "@/services/api";
import { SoundItem } from "@/data/soundsData";

export interface VideoFilter {
  id: string;
  name: string;
  emoji: string;
  css: string;
  tintColor?: string;
  tintOpacity?: number;
}

export const VIDEO_FILTERS: VideoFilter[] = [
  { id: "normal", name: "Normal", emoji: "✨", css: "none" },
  {
    id: "warm",
    name: "Warm Sunset",
    emoji: "🌅",
    css: "sepia(0.35) saturate(1.4) contrast(1.05)",
    tintColor: "#f59e0b",
    tintOpacity: 0.18,
  },
  {
    id: "bw",
    name: "B&W Noir",
    emoji: "🎬",
    css: "grayscale(1) contrast(1.2)",
    tintColor: "#000000",
    tintOpacity: 0.28,
  },
  {
    id: "vintage",
    name: "Vintage 90s",
    emoji: "📼",
    css: "sepia(0.65) contrast(1.1) brightness(0.95)",
    tintColor: "#78350f",
    tintOpacity: 0.24,
  },
  {
    id: "vivid",
    name: "Vivid Pop",
    emoji: "🌈",
    css: "contrast(1.25) saturate(1.6) brightness(1.05)",
    tintColor: "#06b6d4",
    tintOpacity: 0.15,
  },
  {
    id: "dreamy",
    name: "Dreamy Glow",
    emoji: "🌸",
    css: "brightness(1.08) contrast(0.95) saturate(1.3)",
    tintColor: "#ec4899",
    tintOpacity: 0.18,
  },
  {
    id: "cyber",
    name: "Cool Cyber",
    emoji: "❄️",
    css: "hue-rotate(180deg) saturate(1.3)",
    tintColor: "#3b82f6",
    tintOpacity: 0.16,
  },
];

export const PLAYBACK_SPEEDS = [
  { label: "0.5x", value: 0.5, desc: "Slow Motion" },
  { label: "1.0x", value: 1.0, desc: "Normal" },
  { label: "1.5x", value: 1.5, desc: "Fast" },
  { label: "2.0x", value: 2.0, desc: "Hyper 2x" },
];

const PILLAR_CATEGORIES = [
  { id: "daily", label: "Daily Life", icon: PawPrint },
  { id: "sports", label: "Sports & Agility", icon: Trophy },
  { id: "gaming", label: "Pet Gaming", icon: Gamepad2 },
  { id: "mating", label: "Mating & Breeding", icon: Heart },
  { id: "vet", label: "Vet Programs", icon: Stethoscope },
  { id: "events", label: "Events & Meetups", icon: Calendar },
];

class VideoErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("Video preview error caught by boundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: "#083344",
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <Text style={{ fontSize: 36, marginBottom: 8 }}>🎬</Text>
          <Text style={{ color: "#ffffff", fontSize: 13, fontWeight: "700" }}>
            Video Ready for Editing
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function NativeVideoPreview({
  uri,
  playbackSpeed,
  isMuted,
  onDurationLoaded,
}: {
  uri: string;
  playbackSpeed: number;
  isMuted: boolean;
  onDurationLoaded?: (dur: number) => void;
}) {
  const [loadError, setLoadError] = useState(false);

  const videoSource = uri ? { uri } : null;
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = isMuted;
    try {
      p.play();
    } catch (e) {}
  });

  useEffect(() => {
    if (player) {
      try {
        player.muted = isMuted;
      } catch (e) {}
    }
  }, [player, isMuted]);

  useEffect(() => {
    if (player) {
      try {
        player.playbackRate = playbackSpeed;
      } catch (e) {}
    }
  }, [player, playbackSpeed]);

  useEffect(() => {
    if (player && player.duration) {
      onDurationLoaded?.(player.duration);
    }
  }, [player?.duration]);

  if (loadError || !player) {
    return (
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "#083344", alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ fontSize: 36, marginBottom: 8 }}>📹</Text>
        <Text style={{ color: "#ffffff", fontSize: 13, fontWeight: "600" }}>Video Ready for Editing</Text>
      </View>
    );
  }

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFillObject}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

function VideoPreviewPlayer({
  uri,
  filterCss,
  playbackSpeed,
  trimStart,
  trimEnd,
  isMuted,
  seekTime,
  onDurationLoaded,
  onCurrentTimeChange,
}: {
  uri: string;
  filterCss?: string;
  playbackSpeed: number;
  trimStart: number;
  trimEnd: number;
  isMuted: boolean;
  seekTime?: number | null;
  onDurationLoaded?: (dur: number) => void;
  onCurrentTimeChange?: (cur: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (videoRef.current) {
      if (
        videoRef.current.currentTime < trimStart ||
        videoRef.current.currentTime >= trimEnd
      ) {
        videoRef.current.currentTime = trimStart;
      }
    }
  }, [trimStart, trimEnd]);

  useEffect(() => {
    if (videoRef.current && typeof seekTime === "number" && !isNaN(seekTime)) {
      videoRef.current.currentTime = seekTime;
    }
  }, [seekTime]);

  if (Platform.OS === "web") {
    return (
      <video
        ref={(el) => {
          videoRef.current = el;
        }}
        src={uri}
        autoPlay
        loop
        playsInline
        muted={isMuted}
        onLoadedMetadata={(e: any) => {
          const dur = e?.target?.duration;
          if (dur && !isNaN(dur) && isFinite(dur)) {
            onDurationLoaded?.(dur);
          }
        }}
        onTimeUpdate={(e: any) => {
          const cur = e?.target?.currentTime;
          if (cur !== undefined) {
            if (cur >= trimEnd) {
              e.target.currentTime = trimStart;
            } else if (cur < trimStart) {
              e.target.currentTime = trimStart;
            }
            onCurrentTimeChange?.(e.target.currentTime);
          }
        }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: 18,
          backgroundColor: "#000",
          filter: filterCss || "none",
          transition: "filter 0.3s ease",
        }}
      />
    );
  }

  return (
    <VideoErrorBoundary>
      <NativeVideoPreview
        uri={uri}
        playbackSpeed={playbackSpeed}
        isMuted={isMuted}
        onDurationLoaded={onDurationLoaded}
      />
    </VideoErrorBoundary>
  );
}

function DraggableTrimScrubber({
  trimStart,
  trimEnd,
  videoDuration,
  videoCurrentTime,
  onTrimStartChange,
  onTrimEndChange,
  onSeekChange,
}: {
  trimStart: number;
  trimEnd: number;
  videoDuration: number;
  videoCurrentTime: number;
  onTrimStartChange: (val: number) => void;
  onTrimEndChange: (val: number) => void;
  onSeekChange: (val: number) => void;
}) {
  const [trackWidth, setTrackWidth] = useState(280);
  const trackRef = useRef<View>(null);

  const trimStartRef = useRef(trimStart);
  const trimEndRef = useRef(trimEnd);
  const durRef = useRef(videoDuration);
  const widthRef = useRef(trackWidth);

  useEffect(() => { trimStartRef.current = trimStart; }, [trimStart]);
  useEffect(() => { trimEndRef.current = trimEnd; }, [trimEnd]);
  useEffect(() => { durRef.current = Math.max(0.1, videoDuration); }, [videoDuration]);
  useEffect(() => { widthRef.current = Math.max(10, trackWidth); }, [trackWidth]);

  const initialStartRef = useRef(0);
  const initialEndRef = useRef(0);

  // Left Handle PanResponder (Drag to Trim Start)
  const leftPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        initialStartRef.current = trimStartRef.current;
      },
      onPanResponderMove: (_, gesture) => {
        const dur = durRef.current;
        const width = widthRef.current || 280;
        const dt = (gesture.dx / width) * dur;
        const newStart = Math.max(0, Math.min(trimEndRef.current - 0.5, initialStartRef.current + dt));
        const rounded = Math.round(newStart * 10) / 10;
        onTrimStartChange(rounded);
        onSeekChange(rounded);
      },
    })
  ).current;

  // Right Handle PanResponder (Drag to Trim End)
  const rightPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        initialEndRef.current = trimEndRef.current;
      },
      onPanResponderMove: (_, gesture) => {
        const dur = durRef.current;
        const width = widthRef.current || 280;
        const dt = (gesture.dx / width) * dur;
        const newEnd = Math.min(dur, Math.max(trimStartRef.current + 0.5, initialEndRef.current + dt));
        const rounded = Math.round(newEnd * 10) / 10;
        onTrimEndChange(rounded);
        onSeekChange(rounded);
      },
    })
  ).current;

  // Web-friendly Pointer Capture for 100% reliable mouse & touch drag
  const handlePointerDown = (isLeft: boolean) => (e: any) => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    try {
      e?.target?.setPointerCapture?.(e.pointerId);
    } catch (err) {}
    const startX = e.clientX;
    const initialVal = isLeft ? trimStartRef.current : trimEndRef.current;
    const width = widthRef.current || 280;
    const dur = durRef.current;

    const onPointerMove = (moveEvt: any) => {
      const dx = moveEvt.clientX - startX;
      const dt = (dx / width) * dur;
      if (isLeft) {
        const newStart = Math.max(0, Math.min(trimEndRef.current - 0.5, initialVal + dt));
        const rounded = Math.round(newStart * 10) / 10;
        onTrimStartChange(rounded);
        onSeekChange(rounded);
      } else {
        const newEnd = Math.min(dur, Math.max(trimStartRef.current + 0.5, initialVal + dt));
        const rounded = Math.round(newEnd * 10) / 10;
        onTrimEndChange(rounded);
        onSeekChange(rounded);
      }
    };

    const onPointerUp = (upEvt: any) => {
      try {
        upEvt?.target?.releasePointerCapture?.(upEvt.pointerId);
      } catch (err) {}
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const handleTrackPress = (evt: any) => {
    const x = evt.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(1, x / widthRef.current));
    const targetTime = Math.round(ratio * durRef.current * 10) / 10;
    onSeekChange(targetTime);
  };

  const dur = Math.max(0.1, videoDuration);
  const startPct = Math.min(100, Math.max(0, (trimStart / dur) * 100));
  const endPct = Math.min(100, Math.max(0, (trimEnd / dur) * 100));
  const headPct = Math.min(100, Math.max(0, (videoCurrentTime / dur) * 100));

  return (
    <View style={styles.scrubberArea}>
      <View style={styles.scrubberHeaderTimes}>
        <View style={styles.timeTagBadge}>
          <Text style={styles.timeTagPrefix}>Start:</Text>
          <Text style={styles.timeTagVal}>{trimStart.toFixed(1)}s</Text>
        </View>
        <View style={[styles.timeTagBadge, { borderColor: "#06b6d4" }]}>
          <Text style={[styles.timeTagPrefix, { color: "#06b6d4" }]}>Head:</Text>
          <Text style={[styles.timeTagVal, { color: "#06b6d4", fontWeight: "900" }]}>
            {videoCurrentTime.toFixed(1)}s
          </Text>
        </View>
        <View style={styles.timeTagBadge}>
          <Text style={styles.timeTagPrefix}>End:</Text>
          <Text style={styles.timeTagVal}>{trimEnd.toFixed(1)}s</Text>
        </View>
      </View>

      {/* Interactive Draggable Timeline Bar */}
      <View
        ref={trackRef}
        style={styles.draggableTrackContainer}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        {/* Full Dimmed Timeline Background (Tap to Seek) */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleTrackPress}
          style={styles.timelineBackgroundLine}
        />

        {/* Active Segment (Highlighted between start and end) */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleTrackPress}
          style={[
            styles.timelineActiveSegment,
            {
              left: `${startPct}%`,
              width: `${Math.max(2, endPct - startPct)}%`,
            },
          ]}
        />

        {/* Playhead indicator bar */}
        <View
          style={[
            styles.timelinePlayhead,
            {
              left: `${headPct}%`,
            },
          ]}
          pointerEvents="none"
        />

        {/* LEFT DRAGGABLE HANDLE (Start Trim) */}
        <View
          style={[
            styles.trimHandle,
            styles.trimHandleLeft,
            { left: `${startPct}%` },
            Platform.OS === "web" && ({ cursor: "ew-resize", userSelect: "none", touchAction: "none" } as any),
          ]}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          {...leftPanResponder.panHandlers}
          {...({ onPointerDown: handlePointerDown(true) } as any)}
        >
          <Text style={styles.trimHandleGripText}>[</Text>
        </View>

        {/* RIGHT DRAGGABLE HANDLE (End Trim) */}
        <View
          style={[
            styles.trimHandle,
            styles.trimHandleRight,
            { left: `${endPct}%` },
            Platform.OS === "web" && ({ cursor: "ew-resize", userSelect: "none", touchAction: "none" } as any),
          ]}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          {...rightPanResponder.panHandlers}
          {...({ onPointerDown: handlePointerDown(false) } as any)}
        >
          <Text style={styles.trimHandleGripText}>]</Text>
        </View>
      </View>

      {/* Quick Trim Nudge & Snap Controls */}
      <View style={styles.trimNudgeRow}>
        <View style={styles.trimNudgeCol}>
          <Text style={styles.trimNudgeLabel}>Start</Text>
          <View style={styles.trimNudgeBtns}>
            <TouchableOpacity
              style={styles.trimNudgeBtn}
              onPress={() => {
                const val = Math.max(0, Math.round((trimStart - 0.5) * 10) / 10);
                onTrimStartChange(val);
                onSeekChange(val);
              }}
            >
              <Text style={styles.trimNudgeBtnText}>-0.5s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.trimNudgeBtn}
              onPress={() => {
                const val = Math.min(trimEnd - 0.5, Math.round((trimStart + 0.5) * 10) / 10);
                onTrimStartChange(val);
                onSeekChange(val);
              }}
            >
              <Text style={styles.trimNudgeBtnText}>+0.5s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.trimNudgeBtn, styles.trimNudgeBtnCyan]}
              onPress={() => {
                const val = Math.min(trimEnd - 0.5, Math.round(videoCurrentTime * 10) / 10);
                onTrimStartChange(val);
              }}
            >
              <Text style={[styles.trimNudgeBtnText, { color: "#ffffff" }]}>Set Start</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.trimNudgeCol}>
          <Text style={styles.trimNudgeLabel}>End</Text>
          <View style={styles.trimNudgeBtns}>
            <TouchableOpacity
              style={styles.trimNudgeBtn}
              onPress={() => {
                const val = Math.max(trimStart + 0.5, Math.round((trimEnd - 0.5) * 10) / 10);
                onTrimEndChange(val);
                onSeekChange(val);
              }}
            >
              <Text style={styles.trimNudgeBtnText}>-0.5s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.trimNudgeBtn}
              onPress={() => {
                const val = Math.min(dur, Math.round((trimEnd + 0.5) * 10) / 10);
                onTrimEndChange(val);
                onSeekChange(val);
              }}
            >
              <Text style={styles.trimNudgeBtnText}>+0.5s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.trimNudgeBtn, styles.trimNudgeBtnCyan]}
              onPress={() => {
                const val = Math.max(trimStart + 0.5, Math.min(dur, Math.round(videoCurrentTime * 10) / 10));
                onTrimEndChange(val);
              }}
            >
              <Text style={[styles.trimNudgeBtnText, { color: "#ffffff" }]}>Set End</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Text style={styles.dragInstructionsText}>
        👉 Drag cyan <Text style={{ color: "#06b6d4", fontWeight: "700" }}>[</Text> and <Text style={{ color: "#06b6d4", fontWeight: "700" }}>]</Text> handles or tap <Text style={{ color: "#06b6d4", fontWeight: "700" }}>-0.5s / +0.5s</Text>
      </Text>
    </View>
  );
}

export default function CreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topSafeInset = Math.max(insets.top, Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 20);
  const { activeProfile, switchProfile, pets, user } = useAuth();

  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("#animandler #petlife");
  const [selectedPillar, setSelectedPillar] = useState("daily");
  const [isPublishing, setIsPublishing] = useState(false);

  // Modals
  const [switcherVisible, setSwitcherVisible] = useState(false);
  const [soundModalVisible, setSoundModalVisible] = useState(false);
  const [cameraModalVisible, setCameraModalVisible] = useState(true);
  const [cameraMode, setCameraMode] = useState<"video" | "photo">("video");

  // Media & Music
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [selectedSound, setSelectedSound] = useState<SoundItem | null>(null);

  // Creator Studio & Editing Suite
  const [selectedFilterId, setSelectedFilterId] = useState("normal");
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [activeTool, setActiveTool] = useState<"none" | "filter" | "trim" | "speed" | "audio">("none");
  const [videoDuration, setVideoDuration] = useState(15);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(15);
  const [isMuted, setIsMuted] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const bgAudioRef = useRef<any>(null);

  // Sync background audio with preview on Web
  useEffect(() => {
    if (Platform.OS === "web") {
      if (selectedSound?.previewUrl) {
        try {
          if (!bgAudioRef.current) {
            bgAudioRef.current = new Audio(selectedSound.previewUrl);
            bgAudioRef.current.loop = true;
          } else {
            bgAudioRef.current.src = selectedSound.previewUrl;
          }
          bgAudioRef.current.play().catch(() => {});
        } catch (e) {}
      } else {
        if (bgAudioRef.current) {
          bgAudioRef.current.pause();
          bgAudioRef.current = null;
        }
      }
    }
    return () => {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current = null;
      }
    };
  }, [selectedSound]);

  const selectedFilter =
    VIDEO_FILTERS.find((f) => f.id === selectedFilterId) || VIDEO_FILTERS[0];

  const handleDurationLoaded = (dur: number) => {
    const validDur = Math.max(1, Math.round(dur * 10) / 10);
    setVideoDuration(validDur);
    setTrimStart(0);
    setTrimEnd(validDur);
  };

  // If active profile is a Handler but handler has pets, auto-select the first pet
  useEffect(() => {
    if (activeProfile?.type !== "animal" && pets && pets.length > 0) {
      const firstPet = pets[0];
      switchProfile({
        id: firstPet.id,
        name: firstPet.name,
        username: firstPet.username,
        avatar: firstPet.avatar,
        type: "animal",
      });
    }
  }, [activeProfile, pets]);

  const requestPermissions = async () => {
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaStatus !== "granted") {
      Alert.alert("Permissions Needed", "Media library access is required to upload.");
      return false;
    }
    return true;
  };

  // Automatically open the camera viewfinder when the user enters the create tab
  useFocusEffect(
    React.useCallback(() => {
      if (!mediaUri) {
        setCameraModalVisible(true);
      }
    }, [mediaUri])
  );

  const handleCapture = (uri: string, isVid: boolean) => {
    setMediaUri(uri);
    setIsVideo(isVid);
    setCameraModalVisible(false);
    setSelectedFilterId("normal");
    setPlaybackSpeed(1.0);
    setTrimStart(0);
    setTrimEnd(15);
    setVideoDuration(15);
    setIsMuted(false);
    setActiveTool("none");
  };

  const handleCloseCamera = () => {
    setCameraModalVisible(false);
    if (!mediaUri) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/");
      }
    }
  };

  const handleDeleteMedia = () => {
    setMediaUri(null);
    setIsVideo(false);
    setSelectedFilterId("normal");
    setPlaybackSpeed(1.0);
    setTrimStart(0);
    setTrimEnd(15);
    setVideoDuration(15);
    setIsMuted(false);
    setActiveTool("none");
    setCameraModalVisible(true);
  };

  // Direct Gallery Upload
  const pickFromGallery = async () => {
    if (!(await requestPermissions())) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        const asset = result.assets[0];
        setMediaUri(asset.uri);
        setIsVideo(asset.type === "video" || !!asset.uri.match(/\.(mp4|mov|avi|webm)$/i));
        setSelectedFilterId("normal");
        setPlaybackSpeed(1.0);
        setTrimStart(0);
        setTrimEnd(15);
        setVideoDuration(15);
        setIsMuted(false);
        setActiveTool("none");
      }
    } catch (err) {
      console.warn("Gallery picker error:", err);
    }
  };

  const handlePublish = async () => {
    if (!mediaUri) {
      Alert.alert("Missing Media", "Please record a live video/photo or select one from your gallery!");
      return;
    }
    if (!caption.trim()) {
      Alert.alert("Missing Caption", "Please write a short caption for your pet's post!");
      return;
    }

    setIsPublishing(true);

    try {
      // 1. Upload media to backend / Cloudinary with 10-second safety timeout
      let finalMediaUrl = mediaUri;
      try {
        const uploadPromise = uploadMedia(
          mediaUri,
          "animaltok/posts",
          isVideo ? "video" : "image"
        );
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000));
        const cloudinaryUrl = await Promise.race([uploadPromise, timeoutPromise]);
        if (cloudinaryUrl) {
          finalMediaUrl = cloudinaryUrl;
        }
      } catch (uploadErr) {
        console.warn("Media upload timeout or error, using local fallback:", uploadErr);
      }

      // 2. Prepare post data
      const soundTitle = selectedSound ? `${selectedSound.title} - ${selectedSound.artist}` : undefined;
      const soundUrl = selectedSound ? selectedSound.previewUrl : undefined;

      let serverPost: any = null;
      try {
        serverPost = await api.createPost({
          animalId: activeProfile?.id,
          animalName: activeProfile?.name,
          animalUsername: activeProfile?.username,
          animalAvatar: activeProfile?.avatar,
          caption: caption.trim(),
          videoUrl: isVideo ? finalMediaUrl : undefined,
          imageUrl: !isVideo ? finalMediaUrl : undefined,
          tags: [
            ...hashtags.split(" ").filter((t) => t.trim().length > 0),
            `#${selectedPillar}`,
          ],
          audioUrl: soundUrl,
          audioName: soundTitle,
        });
      } catch (e) {
        console.warn("Failed to reach server createPost, persisting locally:", e);
      }

      // 3. Optimistic update to feed & profile posts
      const newPostItem = {
        id: serverPost?.id || `p_${Date.now()}`,
        animalId: activeProfile?.id,
        username: activeProfile?.username || (user?.username ? `@${user.username.replace(/^@/, '')}` : "@pet"),
        displayName: activeProfile?.name || user?.name || "Pet Parent",
        avatar: activeProfile?.avatar || user?.avatar || "🐾",
        time: "Just now",
        caption: caption.trim(),
        hashtags: `${hashtags} #${selectedPillar}`,
        videoUrl: isVideo ? finalMediaUrl : "",
        posterUrl: finalMediaUrl,
        imageUrl: !isVideo ? finalMediaUrl : undefined,
        audioUrl: soundUrl,
        audioName: soundTitle ? `🎵 ${soundTitle}` : undefined,
        likes: 0,
        comments: 0,
        saves: 0,
        commentsList: [],
      };

      // Remove any prior item with same id before unshifting to the very top
      const existingIdx = feedPosts.findIndex(p => String(p.id) === String(newPostItem.id));
      if (existingIdx !== -1) feedPosts.splice(existingIdx, 1);
      feedPosts.unshift(newPostItem as any);

      // Persist post locally so it immediately shows in the profile grid and feed
      try {
        const storedPosts = await AsyncStorage.getItem("animaltok_custom_posts");
        const list = storedPosts ? JSON.parse(storedPosts) : [];
        const filtered = list.filter((p: any) => String(p.id) !== String(newPostItem.id));
        filtered.unshift(newPostItem);
        await AsyncStorage.setItem("animaltok_custom_posts", JSON.stringify(filtered));
      } catch (e) {
        console.warn("Failed to persist custom post:", e);
      }

      if (bgAudioRef.current) { bgAudioRef.current.pause(); bgAudioRef.current = null; }
      setMediaUri(null);
      setSelectedSound(null);
      setCaption("");

      // Immediately navigate back to feed and trigger auto-refresh to show new post at index 0
      router.replace({
        pathname: "/(tabs)/",
        params: { refresh: String(Date.now()), focusPostId: String(newPostItem.id) },
      } as any);
    } catch (err: any) {
      console.error("Publish error:", err);
      router.replace({
        pathname: "/(tabs)/",
        params: { refresh: String(Date.now()) },
      } as any);
    } finally {
      setIsPublishing(false);
    }
  };

  // If user is a guest, prompt them inline to sign up to post (no sticky system dialog)
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: "#0b0f17", justifyContent: "center", alignItems: "center", paddingHorizontal: 16 }]}>
        <View style={styles.guestInlineCard}>
          <TouchableOpacity
            style={styles.guestInlineCloseBtn}
            onPress={() => router.replace("/(tabs)/")}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={18} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.guestInlineBadge}>
            <Text style={{ fontSize: 36 }}>🐾</Text>
          </View>

          <Text style={styles.guestInlineTitle}>Create an Account to Post 🐾</Text>
          <Text style={styles.guestInlineSub}>
            Sign up for free to record live pet clips, pick trending sounds, and join the Animandler community!
          </Text>

          <View style={styles.guestInlineFeaturesRow}>
            <View style={styles.guestInlineFeatureItem}>
              <Heart size={14} color="#10b981" />
              <Text style={styles.guestInlineFeatureText}>Like & Comment</Text>
            </View>
            <View style={styles.guestInlineFeatureItem}>
              <Bookmark size={14} color="#fbbf24" />
              <Text style={styles.guestInlineFeatureText}>Save Clips</Text>
            </View>
            <View style={styles.guestInlineFeatureItem}>
              <Sparkles size={14} color="#2dd4bf" />
              <Text style={styles.guestInlineFeatureText}>Post Pets</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.guestInlinePrimaryBtn}
            onPress={() => router.push({ pathname: "/auth", params: { mode: "signup" } })}
            activeOpacity={0.85}
          >
            <UserPlus size={16} color="#ffffff" />
            <Text style={styles.guestInlinePrimaryText}>Create Free Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestInlineSecondaryBtn}
            onPress={() => router.push({ pathname: "/auth", params: { mode: "login" } })}
            activeOpacity={0.85}
          >
            <LogIn size={15} color="#2dd4bf" />
            <Text style={styles.guestInlineSecondaryText}>Sign In with Existing Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestInlineCancelBtn}
            onPress={() => router.replace("/(tabs)/")}
          >
            <Text style={styles.guestInlineCancelText}>Continue Browsing</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // When entering Create without media, immediately render the Camera viewfinder (no flashing form)
  if (!mediaUri) {
    return (
      <View style={[styles.container, { backgroundColor: "#000000" }]}>
        <LiveCameraModal
          visible={true}
          initialMode={cameraMode}
          onClose={handleCloseCamera}
          onCapture={handleCapture}
          embedded={true}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar: Cancel | Add Sound | Pet Switcher */}
      <View style={[styles.topBar, { paddingTop: topSafeInset + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.topBarIconBtn}>
          <X size={22} color="#ffffff" />
        </TouchableOpacity>

        {/* TikTok Style "Add Sound" Pill */}
        <TouchableOpacity
          style={[styles.soundPill, selectedSound && styles.soundPillActive]}
          onPress={() => setSoundModalVisible(true)}
        >
          <Music size={15} color={selectedSound ? "#ffffff" : "#06b6d4"} />
          <Text style={[styles.soundPillText, selectedSound && styles.soundPillTextActive]} numberOfLines={1}>
            {selectedSound ? `${selectedSound.title}` : "Add Sound"}
          </Text>
          {selectedSound ? (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setSelectedSound(null);
              }}
              style={styles.soundRemoveBtn}
            >
              <X size={12} color="#ffffff" />
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>

        {/* Pet Switcher Dropdown */}
        <TouchableOpacity
          style={styles.petSwitcherPill}
          onPress={() => setSwitcherVisible(true)}
        >
          {activeProfile?.avatar && (activeProfile.avatar.startsWith("http") || activeProfile.avatar.startsWith("data:") || activeProfile.avatar.startsWith("/")) ? (
            <Image source={{ uri: activeProfile.avatar }} style={{ width: 22, height: 22, borderRadius: 11, marginRight: 6 }} resizeMode="cover" />
          ) : (
            <Text style={{ fontSize: 16, marginRight: 4 }}>{activeProfile?.avatar || "🐾"}</Text>
          )}
          <Text style={styles.petSwitcherText} numberOfLines={1}>
            {activeProfile?.name || "Select Pet"}
          </Text>
          <ChevronDown size={14} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Media Preview or Fast Capture Selector */}
        {mediaUri ? (
          <View>
            <View style={styles.mediaPreviewContainer}>
              {isVideo ? (
                <VideoPreviewPlayer
                  uri={mediaUri}
                  filterCss={selectedFilter.css}
                  playbackSpeed={playbackSpeed}
                  trimStart={trimStart}
                  trimEnd={trimEnd}
                  isMuted={isMuted}
                  seekTime={seekTime}
                  onDurationLoaded={handleDurationLoaded}
                  onCurrentTimeChange={(cur) => setVideoCurrentTime(cur)}
                />
              ) : (
                <Image
                  source={{ uri: mediaUri }}
                  style={[
                    styles.mediaPreviewImage,
                    Platform.OS === "web" && ({ filter: selectedFilter.css } as any),
                  ]}
                  resizeMode="cover"
                />
              )}

              {/* Native Filter Color Tint Overlay */}
              {Platform.OS !== "web" && selectedFilter.tintColor && selectedFilter.id !== "normal" && (
                <View
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFillObject,
                    {
                      backgroundColor: selectedFilter.tintColor,
                      opacity: selectedFilter.tintOpacity || 0.18,
                    },
                  ]}
                />
              )}

              {/* Top Bar on Preview: Left Badges & Right Retake Button */}
              <View style={styles.previewTopBar}>
                <View style={styles.previewTopLeftBadges}>
                  {isVideo ? (
                    <View style={styles.compactVideoBadge}>
                      <VideoIcon size={11} color="#ffffff" />
                      <Text style={styles.compactBadgeText}>
                        {(trimEnd - trimStart).toFixed(1)}s
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.compactVideoBadge, { backgroundColor: "rgba(168, 85, 247, 0.85)" }]}>
                      <ImageIcon size={11} color="#ffffff" />
                      <Text style={styles.compactBadgeText}>Photo</Text>
                    </View>
                  )}

                  {selectedFilterId !== "normal" && (
                    <View style={styles.compactFilterBadge}>
                      <Text style={styles.compactBadgeText}>
                        {selectedFilter.emoji} {selectedFilter.name}
                      </Text>
                    </View>
                  )}

                  {isVideo && isMuted && (
                    <View style={styles.compactMutedBadge}>
                      <VolumeX size={11} color="#ffffff" />
                      <Text style={styles.compactBadgeText}>Muted</Text>
                    </View>
                  )}
                </View>

                {/* Right actions: Tiny Delete (not red) & Retake */}
                <View style={styles.previewTopRightActions}>
                  <TouchableOpacity
                    style={styles.deleteMediaBtn}
                    onPress={handleDeleteMedia}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={11} color="#cbd5e1" />
                    <Text style={styles.deleteMediaText}>Delete</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.changeMediaBtn}
                    onPress={handleDeleteMedia}
                    activeOpacity={0.7}
                  >
                    <RefreshCw size={11} color="#ffffff" />
                    <Text style={styles.changeMediaText}>Retake</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Clean Translucent Bottom Trim Timeline (Video remains fully visible) */}
              {activeTool === "trim" && isVideo ? (
                <View style={styles.retractableTrimOverlay}>
                  <View style={styles.retractableHeaderRow}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Scissors size={13} color="#06b6d4" />
                      <Text style={styles.retractableTitle}>Trim Video</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      {(trimStart > 0 || trimEnd < videoDuration) && (
                        <TouchableOpacity
                          style={styles.trimResetInlineBtn}
                          onPress={() => {
                            setTrimStart(0);
                            setTrimEnd(videoDuration);
                          }}
                        >
                          <RotateCcw size={10} color="#94a3b8" />
                          <Text style={styles.trimResetInlineText}>Reset</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.retractableDoneBtn}
                        onPress={() => setActiveTool("none")}
                      >
                        <Check size={12} color="#ffffff" />
                        <Text style={styles.retractableDoneText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <DraggableTrimScrubber
                    trimStart={trimStart}
                    trimEnd={trimEnd}
                    videoDuration={videoDuration}
                    videoCurrentTime={videoCurrentTime}
                    onTrimStartChange={(val) => setTrimStart(val)}
                    onTrimEndChange={(val) => setTrimEnd(val)}
                    onSeekChange={(val) => setSeekTime(val)}
                  />
                </View>
              ) : activeTool === "filter" ? (
                /* Retractable Filter Drawer Overlay */
                <View style={styles.retractableFilterOverlay}>
                  <View style={styles.retractableHeaderRow}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Sparkles size={14} color="#06b6d4" />
                      <Text style={styles.retractableTitle}>Choose Filter</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.retractableCloseBtn}
                      onPress={() => setActiveTool("none")}
                    >
                      <X size={15} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.retractableFilterScroll}
                  >
                    {VIDEO_FILTERS.map((f) => {
                      const isSel = selectedFilterId === f.id;
                      return (
                        <TouchableOpacity
                          key={f.id}
                          style={[styles.miniFilterChip, isSel && styles.miniFilterChipActive]}
                          onPress={() => setSelectedFilterId(f.id)}
                        >
                          <Text style={styles.miniFilterEmoji}>{f.emoji}</Text>
                          <Text
                            style={[styles.miniFilterName, isSel && styles.miniFilterNameActive]}
                            numberOfLines={1}
                          >
                            {f.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : isVideo ? (
                /* Normal Clean Timeline Bar where play counts (Tap to Trim) */
                <TouchableOpacity
                  style={styles.cleanPlaybarTrack}
                  activeOpacity={0.85}
                  onPress={() => setActiveTool("trim")}
                >
                  <View style={styles.cleanPlaybarRow}>
                    <Text style={styles.cleanPlaybarTime}>
                      {videoCurrentTime.toFixed(1)}s / {(trimEnd - trimStart).toFixed(1)}s
                    </Text>
                    <View style={styles.cleanPlaybarTrimHint}>
                      <Scissors size={10} color="#06b6d4" />
                      <Text style={styles.cleanPlaybarTrimHintText}>Tap to Trim</Text>
                    </View>
                  </View>
                  <View style={styles.cleanPlaybarLineBg}>
                    <View
                      style={[
                        styles.cleanPlaybarLineFill,
                        {
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              ((videoCurrentTime - trimStart) /
                                Math.max(0.1, trimEnd - trimStart)) *
                                100
                            )
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              ) : null}

              {/* Floating Right-Side Tools (Scrollable & Sleek Compact Icons) */}
              <View style={styles.floatingToolsContainer}>
                <ScrollView
                  style={styles.floatingToolsScroll}
                  contentContainerStyle={styles.floatingToolsContent}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                  {/* 1. Filter: opens retractable filter carousel */}
                  <TouchableOpacity
                    style={[
                      styles.floatingToolBtn,
                      activeTool === "filter" && styles.floatingToolBtnActive,
                    ]}
                    onPress={() => setActiveTool(activeTool === "filter" ? "none" : "filter")}
                  >
                    <View
                      style={[
                        styles.floatingToolIconWrap,
                        selectedFilterId !== "normal" && {
                          backgroundColor: "rgba(6, 182, 212, 0.35)",
                          borderColor: "#06b6d4",
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <Sparkles size={14} color={selectedFilterId !== "normal" ? "#06b6d4" : "#ffffff"} />
                    </View>
                    <Text style={[styles.floatingToolLabel, selectedFilterId !== "normal" && { color: "#06b6d4" }]}>
                      Filter
                    </Text>
                  </TouchableOpacity>

                  {/* 2. Trim: opens interactive timeline where play counts */}
                  {isVideo && (
                    <TouchableOpacity
                      style={[
                        styles.floatingToolBtn,
                        activeTool === "trim" && styles.floatingToolBtnActive,
                      ]}
                      onPress={() => setActiveTool(activeTool === "trim" ? "none" : "trim")}
                    >
                      <View
                        style={[
                          styles.floatingToolIconWrap,
                          activeTool === "trim" && {
                            backgroundColor: "rgba(6, 182, 212, 0.35)",
                            borderColor: "#06b6d4",
                            borderWidth: 1,
                          },
                        ]}
                      >
                        <Scissors size={14} color={activeTool === "trim" ? "#06b6d4" : "#ffffff"} />
                      </View>
                      <Text style={[styles.floatingToolLabel, activeTool === "trim" && { color: "#06b6d4" }]}>
                        Trim
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* 3. Speed: directly cycles speeds on tap! */}
                  {isVideo && (
                    <TouchableOpacity
                      style={styles.floatingToolBtn}
                      onPress={() =>
                        setPlaybackSpeed((s) => (s === 1.0 ? 1.5 : s === 1.5 ? 2.0 : s === 2.0 ? 0.5 : 1.0))
                      }
                    >
                      <View
                        style={[
                          styles.floatingToolIconWrap,
                          playbackSpeed !== 1.0 && {
                            backgroundColor: "rgba(16, 185, 129, 0.35)",
                            borderColor: "#10b981",
                            borderWidth: 1,
                          },
                        ]}
                      >
                        <Zap size={14} color={playbackSpeed !== 1.0 ? "#10b981" : "#ffffff"} />
                      </View>
                      <Text style={[styles.floatingToolLabel, playbackSpeed !== 1.0 && { color: "#10b981" }]}>
                        {playbackSpeed}x
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* 4. Mute: instantly toggles mute audio without any clutter! */}
                  {isVideo && (
                    <TouchableOpacity
                      style={styles.floatingToolBtn}
                      onPress={() => setIsMuted((m) => !m)}
                    >
                      <View
                        style={[
                          styles.floatingToolIconWrap,
                          isMuted && {
                            backgroundColor: "rgba(6, 182, 212, 0.35)",
                            borderColor: "#06b6d4",
                            borderWidth: 1,
                          },
                        ]}
                      >
                        {isMuted ? (
                          <VolumeX size={14} color="#06b6d4" />
                        ) : (
                          <Volume2 size={14} color="#ffffff" />
                        )}
                      </View>
                      <Text style={[styles.floatingToolLabel, isMuted && { color: "#06b6d4" }]}>
                        {isMuted ? "Muted" : "Mute"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* 5. Sound: opens sound picker modal */}
                  <TouchableOpacity
                    style={styles.floatingToolBtn}
                    onPress={() => setSoundModalVisible(true)}
                  >
                    <View
                      style={[
                        styles.floatingToolIconWrap,
                        selectedSound && {
                          backgroundColor: "rgba(6, 182, 212, 0.35)",
                          borderColor: "#06b6d4",
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <Music size={14} color={selectedSound ? "#06b6d4" : "#ffffff"} />
                    </View>
                    <Text style={[styles.floatingToolLabel, selectedSound && { color: "#06b6d4" }]}>
                      {selectedSound ? "Sound ✓" : "Sound"}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </View>
        ) : null}

        {/* Selected Sound Banner */}
        {selectedSound && (
          <View style={styles.soundBanner}>
            <Music size={16} color="#06b6d4" />
            <View style={{ flex: 1 }}>
              <Text style={styles.soundBannerTitle} numberOfLines={1}>
                {selectedSound.title}
              </Text>
              <Text style={styles.soundBannerArtist}>
                {selectedSound.artist} {selectedSound.isPromoted ? "• Sponsored" : ""}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSoundModalVisible(true)}>
              <Text style={styles.soundBannerChange}>Change</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content Pillar / Category (TikTok Style) */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionLabel}>Post Category & Purpose</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillarScroll}
          >
            {PILLAR_CATEGORIES.map((p) => {
              const active = selectedPillar === p.id;
              const IconComp = p.icon;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.pillarPill, active && styles.pillarPillActive]}
                  onPress={() => setSelectedPillar(p.id)}
                >
                  <IconComp size={15} color={active ? "#ffffff" : "#94a3b8"} />
                  <Text style={[styles.pillarPillText, active && styles.pillarPillTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Caption & Hashtags */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionLabel}>Caption</Text>
          <TextInput
            style={styles.captionInput}
            multiline
            placeholder="Describe what your pet is doing..."
            placeholderTextColor="#64748b"
            value={caption}
            onChangeText={setCaption}
          />

          <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Hashtags</Text>
          <TextInput
            style={styles.hashtagInput}
            placeholder="#animandler #dogsoftiktok #agility"
            placeholderTextColor="#64748b"
            value={hashtags}
            onChangeText={setHashtags}
          />
        </View>

        {/* Publish Button */}
        <TouchableOpacity
          style={[styles.publishBtn, isPublishing && { opacity: 0.6 }]}
          onPress={handlePublish}
          disabled={isPublishing}
        >
          {isPublishing ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Sparkles size={20} color="#ffffff" />
              <Text style={styles.publishBtnText}>Post to Animandler</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Sound Picker Modal */}
      <SoundPickerModal
        visible={soundModalVisible}
        onClose={() => setSoundModalVisible(false)}
        onSelectSound={(sound) => setSelectedSound(sound)}
        selectedSoundId={selectedSound?.id}
      />

      {/* Profile Switcher Modal */}
      <ProfileSwitcherModal
        visible={switcherVisible}
        onClose={() => setSwitcherVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    backgroundColor: "#0d1117",
  },
  topBarIconBtn: {
    padding: 6,
  },
  soundPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#161b22",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    maxWidth: 170,
  },
  soundPillActive: {
    backgroundColor: "#06b6d4",
    borderColor: "#06b6d4",
  },
  soundPillText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  soundPillTextActive: {
    color: "#ffffff",
  },
  soundRemoveBtn: {
    marginLeft: 4,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 10,
    padding: 2,
  },
  petSwitcherPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161b22",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
    maxWidth: 140,
  },
  petSwitcherText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    marginRight: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyMediaPrompt: {
    backgroundColor: "#161b22",
    borderRadius: 18,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#334155",
    borderStyle: "dashed",
    marginBottom: 20,
  },
  emptyMediaIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyMediaTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
  },
  emptyMediaSub: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
  },
  mediaPreviewContainer: {
    height: 360,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    marginBottom: 20,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  mediaPreviewImage: {
    width: "100%",
    height: "100%",
  },
  changeMediaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  changeMediaText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  previewTopRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deleteMediaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  deleteMediaText: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "700",
  },
  previewTopBar: {
    position: "absolute",
    top: 6,
    left: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 20,
  },
  previewTopLeftBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  compactVideoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(6, 182, 212, 0.85)",
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 10,
  },
  compactFilterBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.85)",
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 10,
  },
  compactMutedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(8, 51, 68, 0.9)",
    borderWidth: 1,
    borderColor: "#06b6d4",
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 10,
  },
  compactBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  cleanPlaybarTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(13, 17, 23, 0.85)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  cleanPlaybarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cleanPlaybarTime: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "700",
  },
  cleanPlaybarTrimHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(6, 182, 212, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cleanPlaybarTrimHintText: {
    color: "#06b6d4",
    fontSize: 10,
    fontWeight: "700",
  },
  cleanPlaybarLineBg: {
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  cleanPlaybarLineFill: {
    height: "100%",
    backgroundColor: "#06b6d4",
  },
  retractableTrimOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(10, 15, 29, 0.72)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(6, 182, 212, 0.35)",
    zIndex: 25,
  },
  retractableDoneBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#06b6d4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  retractableDoneText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  trimResetInlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trimResetInlineText: {
    color: "#cbd5e1",
    fontSize: 9,
    fontWeight: "600",
  },
  retractableFilterOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(13, 17, 23, 0.95)",
    padding: 10,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(6, 182, 212, 0.4)",
    zIndex: 25,
  },
  retractableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  retractableTitle: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  retractableCloseBtn: {
    padding: 3,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
  },
  trimLoopBadge: {
    backgroundColor: "rgba(6, 182, 212, 0.25)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trimLoopBadgeText: {
    color: "#06b6d4",
    fontSize: 10,
    fontWeight: "700",
  },
  scrubberArea: {
    gap: 6,
  },
  scrubberHeaderTimes: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  draggableTrackContainer: {
    height: 38,
    justifyContent: "center",
    position: "relative",
    marginVertical: 4,
  },
  timelineBackgroundLine: {
    height: 10,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 5,
    overflow: "hidden",
  },
  timelineActiveSegment: {
    position: "absolute",
    top: 14,
    height: 10,
    backgroundColor: "rgba(6, 182, 212, 0.55)",
    borderColor: "#06b6d4",
    borderWidth: 1,
    borderRadius: 4,
  },
  timelinePlayhead: {
    position: "absolute",
    top: 9,
    width: 3,
    height: 20,
    backgroundColor: "#ffffff",
    borderRadius: 2,
    marginLeft: -1.5,
    zIndex: 5,
  },
  trimHandle: {
    position: "absolute",
    top: 4,
    width: 26,
    height: 30,
    borderRadius: 7,
    backgroundColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    borderWidth: 1.5,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  trimHandleLeft: {
    marginLeft: -13,
  },
  trimHandleRight: {
    marginLeft: -13,
  },
  trimHandleGripText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 16,
  },
  trimNudgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 4,
  },
  trimNudgeCol: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  trimNudgeLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "700",
  },
  trimNudgeBtns: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 3,
  },
  trimNudgeBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 5,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  trimNudgeBtnCyan: {
    backgroundColor: "#06b6d4",
  },
  trimNudgeBtnText: {
    color: "#cbd5e1",
    fontSize: 9,
    fontWeight: "700",
  },
  dragInstructionsText: {
    color: "#94a3b8",
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },
  timeTagBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  timeTagPrefix: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "600",
  },
  timeTagVal: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  retractableFilterScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  miniFilterChip: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    minWidth: 54,
  },
  miniFilterChipActive: {
    borderColor: "#06b6d4",
    backgroundColor: "rgba(6, 182, 212, 0.2)",
  },
  miniFilterEmoji: {
    fontSize: 14,
    marginBottom: 2,
  },
  miniFilterName: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "600",
  },
  miniFilterNameActive: {
    color: "#06b6d4",
    fontWeight: "800",
  },
  previewBadgesRow: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    maxWidth: "70%",
  },
  videoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(6, 182, 212, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  videoBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  activeFilterBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeFilterBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  activeSpeedBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeSpeedBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  activeTrimBadge: {
    backgroundColor: "rgba(236, 72, 153, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeTrimBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  floatingToolsContainer: {
    position: "absolute",
    top: 36,
    right: 8,
    maxHeight: 270,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    zIndex: 20,
    overflow: "hidden",
  },
  floatingToolsScroll: {
    maxHeight: 270,
  },
  floatingToolsContent: {
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 7,
  },
  floatingToolBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    paddingVertical: 1,
  },
  floatingToolBtnActive: {
    transform: [{ scale: 1.05 }],
  },
  floatingToolIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  floatingToolLabel: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  creatorSuiteBox: {
    backgroundColor: "#161b22",
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  creatorSuiteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  creatorSuiteTitle: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  creatorSuiteTabs: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  creatorTabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0d1117",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  creatorTabBtnActive: {
    backgroundColor: "#06b6d4",
    borderColor: "#06b6d4",
  },
  creatorTabBtnText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
  },
  creatorTabBtnTextActive: {
    color: "#ffffff",
  },
  toolDrawer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#21262d",
  },
  toolDrawerHeader: {
    marginBottom: 10,
  },
  toolDrawerTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  toolDrawerHint: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 2,
  },
  filtersScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0d1117",
    borderWidth: 1.5,
    borderColor: "#30363d",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    minWidth: 78,
  },
  filterChipActive: {
    borderColor: "#06b6d4",
    backgroundColor: "rgba(6, 182, 212, 0.15)",
  },
  filterChipEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  filterChipName: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600",
  },
  filterChipNameActive: {
    color: "#06b6d4",
    fontWeight: "800",
  },
  trimControlsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  trimCol: {
    flex: 1,
    backgroundColor: "#0d1117",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#21262d",
  },
  trimColLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 8,
  },
  trimBtnPair: {
    flexDirection: "row",
    gap: 6,
  },
  trimStepBtn: {
    flex: 1,
    backgroundColor: "#21262d",
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  trimStepBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  trimPresetsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
  },
  trimPresetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  trimPresetText: {
    color: "#06b6d4",
    fontSize: 11,
    fontWeight: "700",
  },
  speedOptionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  speedChip: {
    flex: 1,
    backgroundColor: "#0d1117",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#30363d",
  },
  speedChipActive: {
    borderColor: "#06b6d4",
    backgroundColor: "rgba(6, 182, 212, 0.15)",
  },
  speedChipLabel: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "800",
  },
  speedChipLabelActive: {
    color: "#06b6d4",
  },
  speedChipDesc: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 2,
  },
  speedChipDescActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  audioRowCard: {
    backgroundColor: "#0d1117",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#21262d",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  audioCardTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  audioCardSub: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 2,
  },
  muteToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#21262d",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  muteToggleBtnActive: {
    backgroundColor: "#06b6d4",
    borderColor: "#083344",
  },
  muteToggleText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  audioNoteWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  soundActionBtn: {
    backgroundColor: "#161b22",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#30363d",
    justifyContent: "center",
    alignItems: "center",
  },
  soundActionText: {
    color: "#06b6d4",
    fontSize: 11,
    fontWeight: "700",
  },
  addAudioBigBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(6, 182, 212, 0.4)",
    borderStyle: "dashed",
    backgroundColor: "rgba(6, 182, 212, 0.05)",
  },
  addAudioBigText: {
    color: "#06b6d4",
    fontSize: 13,
    fontWeight: "700",
  },
  soundBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#161b22",
    padding: 12,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
  },
  soundBannerTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  soundBannerArtist: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2,
  },
  soundBannerChange: {
    color: "#06b6d4",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionBox: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pillarScroll: {
    gap: 8,
  },
  pillarPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  pillarPillActive: {
    backgroundColor: "#06b6d4",
    borderColor: "#06b6d4",
  },
  pillarPillText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
  },
  pillarPillTextActive: {
    color: "#ffffff",
  },
  captionInput: {
    backgroundColor: "#161b22",
    borderRadius: 14,
    padding: 14,
    color: "#ffffff",
    fontSize: 14,
    height: 76,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  hashtagInput: {
    backgroundColor: "#161b22",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    color: "#06b6d4",
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  publishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#06b6d4",
    height: 52,
    borderRadius: 26,
    marginTop: 10,
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  publishBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  gateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  gateTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  gateSub: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  gateBtn: {
    backgroundColor: "#06b6d4",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
  },
  gateBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  guestInlineCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#161d2b",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(45, 212, 191, 0.35)",
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: "center",
    position: "relative",
  },
  guestInlineCloseBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  guestInlineBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(45, 212, 191, 0.12)",
    borderWidth: 2,
    borderColor: "rgba(45, 212, 191, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  guestInlineTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  guestInlineSub: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 20,
  },
  guestInlineFeaturesRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 22,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  guestInlineFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  guestInlineFeatureText: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "600",
  },
  guestInlinePrimaryBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#06b6d4",
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  guestInlinePrimaryText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  guestInlineSecondaryBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(45, 212, 191, 0.1)",
    borderWidth: 1.2,
    borderColor: "rgba(45, 212, 191, 0.4)",
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 14,
  },
  guestInlineSecondaryText: {
    color: "#2dd4bf",
    fontSize: 14,
    fontWeight: "700",
  },
  guestInlineCancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  guestInlineCancelText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
  },
});
