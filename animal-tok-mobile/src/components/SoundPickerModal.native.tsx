import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { X, Search, Play, Pause, Check, Music, Sparkles, Flame, DollarSign } from "lucide-react-native";
import { Audio } from "expo-av";
import { SUGGESTED_SOUNDS, SoundItem } from "@/data/soundsData";

interface SoundPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectSound: (sound: SoundItem) => void;
  selectedSoundId?: string | null;
}

export default function SoundPickerModal({
  visible,
  onClose,
  onSelectSound,
  selectedSoundId,
}: SoundPickerModalProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [soundObject, setSoundObject] = useState<Audio.Sound | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const webAudioRef = useRef<any>(null);

  // Stop audio playback when modal closes
  useEffect(() => {
    if (!visible) {
      stopCurrentAudio();
    }
  }, [visible]);

  const stopCurrentAudio = async () => {
    if (webAudioRef.current) {
      webAudioRef.current.pause();
      webAudioRef.current = null;
    }
    if (soundObject) {
      try {
        await soundObject.stopAsync();
        await soundObject.unloadAsync();
      } catch (e) {
        // ignore
      }
      setSoundObject(null);
    }
    setPlayingId(null);
  };

  const togglePreview = async (sound: SoundItem) => {
    if (playingId === sound.id) {
      await stopCurrentAudio();
      return;
    }

    try {
      setLoadingAudio(true);
      await stopCurrentAudio();

      if (Platform.OS === "web" && typeof window !== "undefined") {
        const audio = new window.Audio(sound.previewUrl);
        audio.loop = true;
        audio.play().catch((err) => {
          console.warn("Web audio autoplay prevented:", err);
        });
        webAudioRef.current = audio;
        setPlayingId(sound.id);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: sound.previewUrl },
          { shouldPlay: true, isLooping: true }
        );
        setSoundObject(newSound);
        setPlayingId(sound.id);
      }
    } catch (err) {
      console.warn("Could not preview audio:", err);
      // Fallback: still show playing state for UI responsiveness
      setPlayingId(sound.id);
    } finally {
      setLoadingAudio(false);
    }
  };

  const handleSelect = async (sound: SoundItem) => {
    await stopCurrentAudio();
    onSelectSound(sound);
    onClose();
  };

  const categories = ["All", "🔥 Trending", "⭐ Promoted", "🏆 Sports", "🐾 Relaxing", "😂 Funny"];

  const filteredSounds = SUGGESTED_SOUNDS.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.artist.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategory === "All") return true;
    if (selectedCategory === "🔥 Trending" && s.category === "Trending") return true;
    if (selectedCategory === "⭐ Promoted" && s.isPromoted) return true;
    if (selectedCategory === "🏆 Sports" && s.category === "Sports") return true;
    if (selectedCategory === "🐾 Relaxing" && s.category === "Relaxing") return true;
    if (selectedCategory === "😂 Funny" && s.category === "Funny") return true;
    return true;
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Music size={18} color="#06b6d4" />
            <Text style={styles.headerTitle}>Add Sound</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search viral pet sounds, songs, artists..."
            placeholderTextColor="#64748b"
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Category Pills */}
        <View style={styles.categoryRow}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoryContent}
            renderItem={({ item }) => {
              const active = selectedCategory === item;
              return (
                <TouchableOpacity
                  style={[styles.categoryPill, active && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text style={[styles.categoryPillText, active && styles.categoryPillTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Songs List */}
        <FlatList
          data={filteredSounds}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isPlaying = playingId === item.id;
            const isSelected = selectedSoundId === item.id;

            return (
              <View style={[styles.soundRow, isSelected && styles.soundRowSelected]}>
                {/* Cover with Play/Pause button */}
                <TouchableOpacity
                  style={styles.coverWrapper}
                  onPress={() => togglePreview(item)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: item.coverUrl }} style={styles.coverImage} />
                  <View style={styles.playOverlay}>
                    {loadingAudio && isPlaying ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : isPlaying ? (
                      <Pause size={18} color="#ffffff" fill="#ffffff" />
                    ) : (
                      <Play size={18} color="#ffffff" fill="#ffffff" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Sound Info */}
                <View style={styles.soundInfo}>
                  <View style={styles.soundHeaderRow}>
                    <Text style={styles.soundTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {item.isPromoted && (
                      <View style={styles.promotedTag}>
                        <DollarSign size={10} color="#f59e0b" />
                        <Text style={styles.promotedTagText}>PROMOTED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.soundArtist} numberOfLines={1}>
                    {item.artist} • {item.duration}
                  </Text>
                  <Text style={styles.usageCount}>{item.usageCount}</Text>
                </View>

                {/* Use Sound Button */}
                <TouchableOpacity
                  style={[styles.useButton, isSelected && styles.useButtonActive]}
                  onPress={() => handleSelect(item)}
                >
                  {isSelected ? (
                    <>
                      <Check size={14} color="#ffffff" />
                      <Text style={styles.useButtonText}>Selected</Text>
                    </>
                  ) : (
                    <Text style={styles.useButtonText}>Use</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  closeBtn: {
    padding: 4,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161b22",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 14,
  },
  promoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    marginHorizontal: 16,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  promoBannerText: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "600",
  },
  categoryRow: {
    marginVertical: 8,
  },
  categoryContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  categoryPillActive: {
    backgroundColor: "#06b6d4",
    borderColor: "#06b6d4",
  },
  categoryPillText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
  },
  categoryPillTextActive: {
    color: "#ffffff",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },
  soundRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161b22",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  soundRowSelected: {
    borderColor: "#06b6d4",
    backgroundColor: "rgba(6, 182, 212, 0.08)",
  },
  coverWrapper: {
    width: 52,
    height: 52,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  soundInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  soundHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  soundTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
  },
  promotedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  promotedTagText: {
    color: "#fbbf24",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  soundArtist: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  usageCount: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 2,
  },
  useButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#06b6d4",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  useButtonActive: {
    backgroundColor: "#10b981",
  },
  useButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
});

