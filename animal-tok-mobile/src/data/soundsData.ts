import { getBaseUrl } from "@/services/api";

const getSoundUrl = (filename: string) => {
  const base = getBaseUrl().replace(/\/api\/?$/, "");
  return `${base}/uploads/sounds/${filename}`;
};

export interface SoundItem {
  id: string;
  title: string;
  artist: string;
  duration: string;
  category: "Trending" | "Promoted" | "Sports" | "Relaxing" | "Funny";
  isPromoted?: boolean;
  sponsorBadge?: string;
  coverUrl: string;
  previewUrl: string;
  usageCount: string;
}

export const SUGGESTED_SOUNDS: SoundItem[] = [
  {
    id: "sound-1",
    title: "Golden Hour Bark & Bounce",
    artist: "The Paws Crew",
    duration: "0:30",
    category: "Trending",
    coverUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80",
    previewUrl: getSoundUrl("track1.wav"),
    usageCount: "Active Track",
  },
  {
    id: "sound-2",
    title: "Agility Sprint Beat (Electro Pet)",
    artist: "DJ Pawz x BeatClub",
    duration: "0:30",
    category: "Sports",
    coverUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=150&q=80",
    previewUrl: getSoundUrl("track2.wav"),
    usageCount: "Active Track",
  },
  {
    id: "sound-3",
    title: "Cute Cat Nap (Lofi Purr)",
    artist: "Chill Whiskers",
    duration: "0:30",
    category: "Relaxing",
    coverUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&q=80",
    previewUrl: getSoundUrl("track3.wav"),
    usageCount: "Active Track",
  },
  {
    id: "sound-4",
    title: "Happy Puppy Walk",
    artist: "Sunny Tails",
    duration: "0:30",
    category: "Trending",
    coverUrl: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=150&q=80",
    previewUrl: getSoundUrl("track4.wav"),
    usageCount: "Active Track",
  },
  {
    id: "sound-5",
    title: "Zoomies Anthem (Bass Boosted)",
    artist: "HyperHound",
    duration: "0:30",
    category: "Sports",
    coverUrl: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=150&q=80",
    previewUrl: getSoundUrl("track5.wav"),
    usageCount: "Active Track",
  },
  {
    id: "sound-6",
    title: "Playful Paws Bounce (Acoustic)",
    artist: "Animandler Studio",
    duration: "0:30",
    category: "Funny",
    coverUrl: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=150&q=80",
    previewUrl: getSoundUrl("track6.wav"),
    usageCount: "Active Track",
  },
];
