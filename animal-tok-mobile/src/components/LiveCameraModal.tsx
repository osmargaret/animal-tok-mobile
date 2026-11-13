import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
  CameraType,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { X, RefreshCw, Zap, ZapOff, Image as ImageIcon, Timer as TimerIcon } from "lucide-react-native";

interface LiveCameraModalProps {
  visible: boolean;
  initialMode?: "video" | "photo";
  onClose: () => void;
  onCapture: (uri: string, isVideo: boolean) => void;
  embedded?: boolean;
}

export default function LiveCameraModal({
  visible,
  initialMode = "video",
  onClose,
  onCapture,
  embedded = false,
}: LiveCameraModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const [mode, setMode] = useState<"video" | "photo">(initialMode);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [countdownSeconds, setCountdownSeconds] = useState<number>(0);
  const [activeCountdown, setActiveCountdown] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const cameraRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  // Web MediaRecorder references
  const webStreamRef = useRef<any>(null);
  const mediaRecorderRef = useRef<any>(null);
  const chunksRef = useRef<any[]>([]);

  useEffect(() => {
    if (visible) {
      setMode(initialMode);
      setRecordDuration(0);
      setIsRecording(false);
      setIsProcessing(false);

      if (!permission?.granted) {
        requestPermission();
      }
      if (!micPermission?.granted) {
        requestMicPermission();
      }
    }
  }, [visible, initialMode]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => {
          if (prev >= 60) {
            handleStopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordDuration(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const toggleFacing = () => {
    const nextFacing = facing === "back" ? "front" : "back";
    setFacing(nextFacing);
    setToastMessage(nextFacing === "front" ? "🤳 Front (Selfie) Camera" : "📷 Rear (Main) Camera");
    setTimeout(() => setToastMessage(null), 1800);
  };

  const toggleFlash = () => {
    const nextFlash = flash === "off" ? "on" : "off";
    setFlash(nextFlash);
    setToastMessage(nextFlash === "on" ? "⚡ Flash / Torch ON" : "Flash OFF");
    setTimeout(() => setToastMessage(null), 1800);
  };

  const toggleTimer = () => {
    setCountdownSeconds((prev) => {
      if (prev === 0) return 3;
      if (prev === 3) return 10;
      return 0;
    });
  };

  const handleTakePhoto = async () => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85,
        });
        if (photo?.uri) {
          setIsProcessing(false);
          onCapture(photo.uri, false);
          return;
        }
      }
      if (Platform.OS === "web") {
        handlePickFromGallery();
      }
    } catch (err: any) {
      console.warn("Take photo error:", err);
      if (Platform.OS === "web") {
        handlePickFromGallery();
      } else {
        Alert.alert("Capture Error", err?.message || "Failed to capture photo.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartRecording = async () => {
    if (isRecording || isProcessing) return;

    // Platform 1: Web MediaRecorder in Chrome / Edge / Firefox
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.mediaDevices) {
      try {
        setIsProcessing(true);
        const videoConstraints = {
          facingMode: facing === "front" ? "user" : { ideal: "environment" },
        };
        const stream = await navigator.mediaDevices
          .getUserMedia({ video: videoConstraints, audio: true })
          .catch(async () => {
            return await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false });
          })
          .catch(async () => {
            return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          });

        webStreamRef.current = stream;
        chunksRef.current = [];

        const mimeTypes = ["video/webm;codecs=vp9", "video/webm", "video/mp4"];
        const mimeType = mimeTypes.find((t) => (window as any).MediaRecorder?.isTypeSupported?.(t)) || "";

        const recorder = new (window as any).MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e: any) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType || "video/mp4" });
          const videoUrl = URL.createObjectURL(blob);
          if (webStreamRef.current) {
            webStreamRef.current.getTracks().forEach((track: any) => track.stop());
            webStreamRef.current = null;
          }
          setIsRecording(false);
          setIsProcessing(false);
          onCapture(videoUrl, true);
        };

        recorder.start(200);
        setIsRecording(true);
      } catch (err) {
        console.warn("Web recording failed, falling back to gallery:", err);
        handlePickFromGallery();
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Platform 2: Native Android / iOS
    if (!cameraRef.current) return;
    try {
      if (!micPermission?.granted) {
        const res = await requestMicPermission();
        if (!res?.granted) {
          Alert.alert("Microphone Needed", "Microphone access is required to record sound.");
          return;
        }
      }

      setIsRecording(true);
      if (cameraRef.current.recordAsync) {
        const recordingPromise = cameraRef.current.recordAsync({ maxDuration: 60 });
        const video = await recordingPromise;
        if (video?.uri) {
          setIsRecording(false);
          setIsProcessing(false);
          onCapture(video.uri, true);
        } else {
          setIsRecording(false);
          setIsProcessing(false);
        }
      }
    } catch (err: any) {
      console.warn("Native recording error:", err);
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  const handleStopRecording = () => {
    if (!isRecording) return;

    if (Platform.OS === "web" && mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {}
      return;
    }

    setIsRecording(false);
    setIsProcessing(true);
    try {
      if (cameraRef.current?.stopRecording) {
        cameraRef.current.stopRecording();
      }
    } catch (err) {
      console.warn("Stop recording error:", err);
      setIsProcessing(false);
    }
  };

  const startCountdownAndExecute = (action: () => void) => {
    setActiveCountdown(countdownSeconds);
    let remaining = countdownSeconds;
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(countdownIntervalRef.current);
        setActiveCountdown(null);
        action();
      } else {
        setActiveCountdown(remaining);
      }
    }, 1000);
  };

  const handleShutterPress = () => {
    if (isRecording) {
      handleStopRecording();
      return;
    }

    if (activeCountdown !== null) {
      // Tap again to cancel countdown
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setActiveCountdown(null);
      return;
    }

    if (countdownSeconds > 0) {
      startCountdownAndExecute(() => {
        if (mode === "photo") {
          handleTakePhoto();
        } else {
          handleStartRecording();
        }
      });
      return;
    }

    if (mode === "photo") {
      handleTakePhoto();
    } else {
      handleStartRecording();
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        const asset = result.assets[0];
        const isVid = asset.type === "video" || !!asset.uri.match(/\.(mp4|mov|avi|webm)$/i);
        onCapture(asset.uri, isVid);
      }
    } catch (err) {
      console.warn("Gallery error:", err);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!visible) return null;

  const content = (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={true} />
      <View style={styles.statusBarCover} pointerEvents="none" />
      {!permission?.granted ? (
          <View style={styles.permissionBox}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📷</Text>
            <Text style={styles.permissionTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionSub}>
              Animandler needs access to your camera to let you film live pet videos and take live photos!
            </Text>
            <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
              <Text style={styles.permissionBtnText}>Enable Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeSimpleBtn} onPress={onClose}>
              <Text style={styles.closeSimpleText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={StyleSheet.absoluteFill}>
            {/* Live Camera Viewfinder */}
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
              flash={flash}
              enableTorch={flash === "on"}
              mirror={facing === "front"}
              mode={mode === "video" ? "video" : "picture"}
            />

            {/* Toast feedback for Flip & Flash actions */}
            {toastMessage && (
              <View style={styles.toastBanner} pointerEvents="none">
                <Text style={styles.toastBannerText}>{toastMessage}</Text>
              </View>
            )}

            {/* Countdown Center Display */}
            {activeCountdown !== null && (
              <View style={styles.countdownCenterOverlay} pointerEvents="none">
                <View style={styles.countdownCircle}>
                  <Text style={styles.countdownNumber}>{activeCountdown}</Text>
                </View>
              </View>
            )}

            {/* Top Bar Controls */}
            <SafeAreaView style={styles.topBar}>
              <TouchableOpacity style={styles.iconBtn} onPress={onClose}>
                <X size={24} color="#ffffff" />
              </TouchableOpacity>

              {/* Recording Duration Indicator */}
              {isRecording ? (
                <View style={styles.recordingBadge}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingTimer}>{formatTimer(recordDuration)} / 01:00</Text>
                </View>
              ) : (
                <View style={styles.cameraTitlePill}>
                  <Text style={styles.cameraTitleText}>
                    {mode === "video" ? "🐾 Live Pet Video" : "🐾 Live Pet Photo"}
                  </Text>
                </View>
              )}

              <View style={styles.topRightActions}>
                <TouchableOpacity
                  style={[styles.iconBtn, countdownSeconds > 0 && styles.iconBtnActive]}
                  onPress={toggleTimer}
                >
                  <TimerIcon size={20} color={countdownSeconds > 0 ? "#06b6d4" : "#ffffff"} />
                  {countdownSeconds > 0 && (
                    <Text style={styles.timerBadgeText}>{countdownSeconds}s</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconBtn, flash === "on" && styles.iconBtnFlashActive]}
                  onPress={toggleFlash}
                >
                  {flash === "on" ? (
                    <Zap size={22} color="#fbbf24" fill="#fbbf24" />
                  ) : (
                    <ZapOff size={22} color="#ffffff" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconBtn, facing === "front" && styles.iconBtnFlipActive]}
                  onPress={toggleFacing}
                >
                  <RefreshCw size={22} color={facing === "front" ? "#06b6d4" : "#ffffff"} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>

            {/* Bottom Controls */}
            <View style={styles.bottomSection}>
              {/* Mode Switcher Tabs */}
              <View style={styles.modeTabsRow}>
                <TouchableOpacity
                  style={[styles.modeTab, mode === "photo" && styles.modeTabActive]}
                  onPress={() => !isRecording && setMode("photo")}
                  disabled={isRecording}
                >
                  <Text style={[styles.modeTabText, mode === "photo" && styles.modeTabTextActive]}>
                    PHOTO
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeTab, mode === "video" && styles.modeTabActive]}
                  onPress={() => setMode("video")}
                >
                  <Text style={[styles.modeTabText, mode === "video" && styles.modeTabTextActive]}>
                    VIDEO
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Shutter & Actions Row */}
              <View style={styles.shutterRow}>
                {/* Gallery Button */}
                <TouchableOpacity
                  style={styles.sideControlBtn}
                  onPress={handlePickFromGallery}
                  disabled={isRecording}
                >
                  <View style={styles.galleryIconWrap}>
                    <ImageIcon size={22} color="#ffffff" />
                  </View>
                  <Text style={styles.sideControlLabel}>Upload</Text>
                </TouchableOpacity>

                {/* Shutter Button */}
                <TouchableOpacity
                  style={[
                    styles.shutterOuterRing,
                    mode === "video" && styles.shutterOuterRingVideo,
                    isRecording && styles.shutterOuterRingRecording,
                  ]}
                  onPress={handleShutterPress}
                  activeOpacity={0.8}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : mode === "video" ? (
                    <View
                      style={[
                        styles.videoShutterCore,
                        isRecording && styles.videoShutterCoreRecording,
                      ]}
                    />
                  ) : (
                    <View style={styles.photoShutterCore} />
                  )}
                </TouchableOpacity>

                {/* Flip Camera Side Button */}
                <TouchableOpacity
                  style={styles.sideControlBtn}
                  onPress={toggleFacing}
                  disabled={isRecording}
                >
                  <View style={[styles.galleryIconWrap, facing === "front" && { borderColor: "#06b6d4", borderWidth: 1.5 }]}>
                    <RefreshCw size={20} color={facing === "front" ? "#06b6d4" : "#ffffff"} />
                  </View>
                  <Text style={[styles.sideControlLabel, facing === "front" && { color: "#06b6d4", fontWeight: "700" }]}>
                    {facing === "front" ? "Front" : "Rear"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
  );

  if (embedded) {
    return content;
  }

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    position: "relative",
    zIndex: 9999,
  },
  permissionBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: "#0d1117",
  },
  permissionTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  permissionSub: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  permissionBtn: {
    backgroundColor: "#06b6d4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 14,
  },
  permissionBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  closeSimpleBtn: {
    padding: 10,
  },
  closeSimpleText: {
    color: "#64748b",
    fontSize: 14,
  },
  statusBarCover: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "android" ? ((StatusBar.currentHeight || 44) + 6) : 44,
    backgroundColor: "#000000",
    zIndex: 90,
  },
  topBar: {
    position: "absolute",
    top: Platform.OS === "android" ? ((StatusBar.currentHeight || 44) + 14) : 48,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 100,
  },
  topRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnActive: {
    backgroundColor: "rgba(6, 182, 212, 0.4)",
    borderWidth: 1.5,
    borderColor: "#06b6d4",
  },
  iconBtnFlashActive: {
    backgroundColor: "rgba(251, 191, 36, 0.28)",
    borderWidth: 1.5,
    borderColor: "#fbbf24",
  },
  iconBtnFlipActive: {
    backgroundColor: "rgba(6, 182, 212, 0.28)",
    borderWidth: 1.5,
    borderColor: "#06b6d4",
  },
  toastBanner: {
    position: "absolute",
    top: 96,
    alignSelf: "center",
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 50,
  },
  toastBannerText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  timerBadgeText: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#06b6d4",
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "800",
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  countdownCenterOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  countdownCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderWidth: 4,
    borderColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
  },
  countdownNumber: {
    color: "#ffffff",
    fontSize: 64,
    fontWeight: "900",
  },
  cameraTitlePill: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cameraTitleText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  recordingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(8, 51, 68, 0.9)",
    borderWidth: 1.5,
    borderColor: "#06b6d4",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#06b6d4",
  },
  recordingTimer: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
  bottomSection: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  modeTabsRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 20,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
  },
  modeTab: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  modeTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#06b6d4",
  },
  modeTabText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  modeTabTextActive: {
    color: "#ffffff",
  },
  shutterRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    zIndex: 110,
  },
  shutterOuterRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  shutterOuterRingVideo: {
    borderColor: "rgba(6, 182, 212, 0.55)",
  },
  shutterOuterRingRecording: {
    borderColor: "#06b6d4",
  },
  photoShutterCore: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#06b6d4",
    borderWidth: 3,
    borderColor: "#083344",
  },
  videoShutterCore: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#06b6d4",
    borderWidth: 3,
    borderColor: "#083344",
  },
  videoShutterCoreRecording: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#06b6d4",
    borderWidth: 2,
    borderColor: "#083344",
  },
  sideControlBtn: {
    alignItems: "center",
    gap: 4,
    width: 60,
  },
  galleryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  sideControlLabel: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
});
