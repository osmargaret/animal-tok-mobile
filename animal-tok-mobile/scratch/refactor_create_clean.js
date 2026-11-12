const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('animal-tok-mobile/app/(tabs)/create.tsx');
let content = fs.readFileSync(targetFile, 'utf8').replace(/\r\n/g, '\n');

// 1. Remove controls from <video> on web, track currentTime
const oldVideoEl = `        src={uri}
        controls
        autoPlay
        loop
        playsInline
        muted={isMuted}`;

const newVideoEl = `        src={uri}
        autoPlay
        loop
        playsInline
        muted={isMuted}`;

content = content.replace(oldVideoEl, newVideoEl);

// 2. Add onCurrentTimeChange prop to VideoPreviewPlayer
const oldVideoPreviewDecl = `function VideoPreviewPlayer({
  uri,
  filterCss,
  playbackSpeed,
  trimStart,
  trimEnd,
  isMuted,
  onDurationLoaded,
}: {
  uri: string;
  filterCss?: string;
  playbackSpeed: number;
  trimStart: number;
  trimEnd: number;
  isMuted: boolean;
  onDurationLoaded?: (dur: number) => void;
}) {`;

const newVideoPreviewDecl = `function VideoPreviewPlayer({
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
}) {`;

content = content.replace(oldVideoPreviewDecl, newVideoPreviewDecl);

// Add seekTime listener in VideoPreviewPlayer
const oldSeekBlock = `  useEffect(() => {
    if (videoRef.current) {
      if (
        videoRef.current.currentTime < trimStart ||
        videoRef.current.currentTime >= trimEnd
      ) {
        videoRef.current.currentTime = trimStart;
      }
    }
  }, [trimStart, trimEnd]);`;

const newSeekBlock = `  useEffect(() => {
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
  }, [seekTime]);`;

content = content.replace(oldSeekBlock, newSeekBlock);

// Update onTimeUpdate inside VideoPreviewPlayer
const oldOnTimeUpdate = `        onTimeUpdate={(e: any) => {
          const cur = e?.target?.currentTime;
          if (cur !== undefined) {
            if (cur >= trimEnd) {
              e.target.currentTime = trimStart;
            } else if (cur < trimStart) {
              e.target.currentTime = trimStart;
            }
          }
        }}`;

const newOnTimeUpdate = `        onTimeUpdate={(e: any) => {
          const cur = e?.target?.currentTime;
          if (cur !== undefined) {
            if (cur >= trimEnd) {
              e.target.currentTime = trimStart;
            } else if (cur < trimStart) {
              e.target.currentTime = trimStart;
            }
            onCurrentTimeChange?.(e.target.currentTime);
          }
        }}`;

content = content.replace(oldOnTimeUpdate, newOnTimeUpdate);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully updated VideoPreviewPlayer in create.tsx');

