const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('animal-tok-mobile/app/(tabs)/create.tsx');
let content = fs.readFileSync(targetFile, 'utf8').replace(/\r\n/g, '\n');

// 1. Add videoCurrentTime and seekTime state in CreateScreen
const stateTarget = `  const [trimEnd, setTrimEnd] = useState(15);
  const [isMuted, setIsMuted] = useState(false);`;

const stateReplace = `  const [trimEnd, setTrimEnd] = useState(15);
  const [isMuted, setIsMuted] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [seekTime, setSeekTime] = useState<number | null>(null);`;

content = content.replace(stateTarget, stateReplace);

// 2. Locate the media preview section and replace with the retractable architecture
const previewStart = `{/* Media Preview or Fast Capture Selector */}\n        {mediaUri ? (\n          <View>\n            <View style={styles.mediaPreviewContainer}>`;
const suiteBoxEnd = `            {/* CREATOR STUDIO EDITING SUITE */}`;

// Let's find index of previewStart and the end of creatorSuiteBox
const idxStart = content.indexOf(previewStart);
if (idxStart === -1) {
  console.error("Could not find previewStart");
  process.exit(1);
}

const suiteMarker = `            {/* CREATOR STUDIO EDITING SUITE */}`;
const idxSuite = content.indexOf(suiteMarker, idxStart);
if (idxSuite === -1) {
  console.error("Could not find suiteMarker");
  process.exit(1);
}

const emptyPromptMarker = `        ) : (\n          <TouchableOpacity\n            style={styles.emptyMediaPrompt}`;
const idxEmpty = content.indexOf(emptyPromptMarker, idxSuite);
if (idxEmpty === -1) {
  console.error("Could not find emptyPromptMarker");
  process.exit(1);
}

// What we want between idxStart and idxEmpty:
const newMediaPreviewSection = `{/* Media Preview or Fast Capture Selector */}
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

                {/* Retake / Change Button (Compact) */}
                <TouchableOpacity
                  style={styles.changeMediaBtn}
                  onPress={() => setCameraModalVisible(true)}
                >
                  <RefreshCw size={11} color="#ffffff" />
                  <Text style={styles.changeMediaText}>Retake</Text>
                </TouchableOpacity>
              </View>

              {/* Retractable Bottom Trim Timeline (Where Play Counts) */}
              {activeTool === "trim" && isVideo ? (
                <View style={styles.retractableTrimOverlay}>
                  <View style={styles.retractableHeaderRow}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Scissors size={14} color="#06b6d4" />
                      <Text style={styles.retractableTitle}>Trim Video Timeline</Text>
                      <View style={styles.trimLoopBadge}>
                        <Text style={styles.trimLoopBadgeText}>
                          {(trimEnd - trimStart).toFixed(1)}s loop
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.retractableCloseBtn}
                      onPress={() => setActiveTool("none")}
                    >
                      <X size={15} color="#ffffff" />
                    </TouchableOpacity>
                  </View>

                  {/* Visual Filmstrip & Playhead where the play counts */}
                  <View style={styles.scrubberArea}>
                    <View style={styles.scrubberHeaderTimes}>
                      <Text style={styles.scrubberTimeLabel}>Start: {trimStart.toFixed(1)}s</Text>
                      <Text style={[styles.scrubberTimeLabel, { color: "#06b6d4", fontWeight: "800" }]}>
                        Head: {videoCurrentTime.toFixed(1)}s
                      </Text>
                      <Text style={styles.scrubberTimeLabel}>End: {trimEnd.toFixed(1)}s</Text>
                    </View>

                    {/* Interactive timeline bar */}
                    <TouchableOpacity
                      style={styles.filmstripTrack}
                      activeOpacity={1}
                      onPress={(e) => {
                        const { locationX } = e.nativeEvent;
                        const ratio = Math.max(0, Math.min(1, locationX / 280));
                        const targetTime = ratio * videoDuration;
                        setSeekTime(targetTime);
                      }}
                    >
                      <View style={styles.filmstripFullLine}>
                        <View
                          style={[
                            styles.filmstripActiveSegment,
                            {
                              left: \`\${(trimStart / Math.max(1, videoDuration)) * 100}%\`,
                              width: \`\${((trimEnd - trimStart) / Math.max(1, videoDuration)) * 100}%\`,
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.filmstripPlayhead,
                            {
                              left: \`\${(videoCurrentTime / Math.max(1, videoDuration)) * 100}%\`,
                            },
                          ]}
                        />
                      </View>
                    </TouchableOpacity>

                    {/* Quick Set buttons right on the playhead */}
                    <View style={styles.trimActionsRow}>
                      <TouchableOpacity
                        style={styles.trimActionBtn}
                        onPress={() => {
                          const newStart = Math.min(trimEnd - 0.5, Math.max(0, videoCurrentTime));
                          setTrimStart(Math.round(newStart * 10) / 10);
                        }}
                      >
                        <Text style={styles.trimActionBtnText}>
                          ⇤ Set Start ({videoCurrentTime.toFixed(1)}s)
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.trimActionBtn}
                        onPress={() => {
                          const newEnd = Math.max(trimStart + 0.5, Math.min(videoDuration, videoCurrentTime));
                          setTrimEnd(Math.round(newEnd * 10) / 10);
                        }}
                      >
                        <Text style={styles.trimActionBtnText}>
                          Set End ({videoCurrentTime.toFixed(1)}s) ⇥
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Steppers */}
                    <View style={styles.trimSteppersRow}>
                      <View style={styles.trimStepperPair}>
                        <Text style={styles.trimStepperLabel}>Start:</Text>
                        <TouchableOpacity
                          style={styles.trimMiniBtn}
                          onPress={() => setTrimStart((s) => Math.max(0, Math.round((s - 0.5) * 10) / 10))}
                        >
                          <Text style={styles.trimMiniText}>-0.5s</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.trimMiniBtn}
                          onPress={() => setTrimStart((s) => Math.min(trimEnd - 0.5, Math.round((s + 0.5) * 10) / 10))}
                        >
                          <Text style={styles.trimMiniText}>+0.5s</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.trimStepperPair}>
                        <Text style={styles.trimStepperLabel}>End:</Text>
                        <TouchableOpacity
                          style={styles.trimMiniBtn}
                          onPress={() => setTrimEnd((e) => Math.max(trimStart + 0.5, Math.round((e - 0.5) * 10) / 10))}
                        >
                          <Text style={styles.trimMiniText}>-0.5s</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.trimMiniBtn}
                          onPress={() => setTrimEnd((e) => Math.min(videoDuration, Math.round((e + 0.5) * 10) / 10))}
                        >
                          <Text style={styles.trimMiniText}>+0.5s</Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={styles.trimResetBtn}
                        onPress={() => {
                          setTrimStart(0);
                          setTrimEnd(videoDuration);
                        }}
                      >
                        <RotateCcw size={11} color="#06b6d4" />
                        <Text style={styles.trimResetText}>Reset</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
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
                          width: \`\${Math.min(
                            100,
                            Math.max(
                              0,
                              ((videoCurrentTime - trimStart) /
                                Math.max(0.1, trimEnd - trimStart)) *
                                100
                            )
                          )}%\`,
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              ) : null}

              {/* Floating Right-Side Tools (Retractable & Direct Actions) */}
              <View style={styles.floatingTools}>
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
                    <Sparkles size={17} color={selectedFilterId !== "normal" ? "#06b6d4" : "#ffffff"} />
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
                      <Scissors size={17} color={activeTool === "trim" ? "#06b6d4" : "#ffffff"} />
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
                      <Zap size={17} color={playbackSpeed !== 1.0 ? "#10b981" : "#ffffff"} />
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
                          backgroundColor: "rgba(239, 68, 68, 0.35)",
                          borderColor: "#ef4444",
                          borderWidth: 1,
                        },
                      ]}
                    >
                      {isMuted ? (
                        <VolumeX size={17} color="#ef4444" />
                      ) : (
                        <Volume2 size={17} color="#ffffff" />
                      )}
                    </View>
                    <Text style={[styles.floatingToolLabel, isMuted && { color: "#ef4444" }]}>
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
                    <Music size={17} color={selectedSound ? "#06b6d4" : "#ffffff"} />
                  </View>
                  <Text style={[styles.floatingToolLabel, selectedSound && { color: "#06b6d4" }]}>
                    {selectedSound ? "Sound ✓" : "Sound"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
`;

content = content.slice(0, idxStart) + newMediaPreviewSection + content.slice(idxEmpty);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully replaced busy suite box with retractable architecture!');

