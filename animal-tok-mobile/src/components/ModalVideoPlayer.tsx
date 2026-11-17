import React from "react";
import { View, Image, StyleSheet, Platform } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

interface ModalVideoPlayerProps {
  videoUrl?: string;
  imageUrl?: string;
}

function NativeModalVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = false;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={styles.media}
      contentFit="cover"
      nativeControls={true}
      allowsFullscreen={true}
    />
  );
}

export function ModalVideoPlayer({ videoUrl, imageUrl }: ModalVideoPlayerProps) {
  if (videoUrl && Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <video
          src={videoUrl}
          controls
          autoPlay
          loop
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            backgroundColor: "#000",
          }}
        />
      </View>
    );
  }

  if (videoUrl) {
    return (
      <View style={styles.container}>
        <NativeModalVideo uri={videoUrl} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri:
            imageUrl ||
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&fit=crop",
        }}
        style={styles.media}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  media: {
    width: "100%",
    height: "100%",
  },
});
