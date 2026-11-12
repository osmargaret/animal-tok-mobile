const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('animal-tok-mobile/app/(tabs)/create.tsx');
let content = fs.readFileSync(targetFile, 'utf8').replace(/\r\n/g, '\n');

// Clean up old unused styles if present and add new retractable styles
const oldBadgeStyles = `  previewBadgesRow: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    maxWidth: "70%",
  },`;

const newRetractableStyles = `  previewTopBar: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
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
    backgroundColor: "rgba(239, 68, 68, 0.85)",
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
    backgroundColor: "rgba(13, 17, 23, 0.95)",
    padding: 12,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(6, 182, 212, 0.4)",
    zIndex: 25,
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
  },
  scrubberTimeLabel: {
    color: "#94a3b8",
    fontSize: 10,
  },
  filmstripTrack: {
    height: 18,
    justifyContent: "center",
  },
  filmstripFullLine: {
    height: 8,
    backgroundColor: "#21262d",
    borderRadius: 4,
    position: "relative",
    overflow: "hidden",
  },
  filmstripActiveSegment: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(6, 182, 212, 0.6)",
    borderWidth: 1,
    borderColor: "#06b6d4",
    borderRadius: 4,
  },
  filmstripPlayhead: {
    position: "absolute",
    top: -2,
    width: 3,
    height: 12,
    backgroundColor: "#ffffff",
    borderRadius: 2,
  },
  trimActionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  trimActionBtn: {
    flex: 1,
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.35)",
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  trimActionBtnText: {
    color: "#06b6d4",
    fontSize: 10,
    fontWeight: "700",
  },
  trimSteppersRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  trimStepperPair: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trimStepperLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "600",
  },
  trimMiniBtn: {
    backgroundColor: "#21262d",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  trimMiniText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  trimResetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trimResetText: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "600",
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
  },`;

content = content.replace(oldBadgeStyles, newRetractableStyles);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully updated create styles with retractable timeline and filter overlay!');

