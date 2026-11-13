export interface AnimalPost {
  id: number;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

export interface AnimalProfile {
  id: string;
  name: string;
  username: string;
  bio: string;
  emoji: string;
  gradient: string;
  breed: string;
  age: string;
  following: number;
  followers: number;
  likes: number;
  profileViews: number;
  drafts: number;
  draftsSize: string;
  posts: AnimalPost[];
}

export const animalProfiles: AnimalProfile[] = [
  {
    id: "bella",
    name: "Bella",
    username: "@bella.lab",
    bio: "Living my best life 🐾 Fetch champion 2024",
    emoji: "🐕",
    gradient: "from-amber-500/20 to-orange-500/20",
    breed: "Labrador",
    age: "3 yrs",
    following: 0,
    followers: 0,
    likes: 0,
    profileViews: 12,
    drafts: 2,
    draftsSize: "3.4 MB",
    posts: [
      { id: 1, thumbnail: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=400&fit=crop", views: 340, likes: 280, comments: 45, shares: 32, saves: 120 },
      { id: 2, thumbnail: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=400&fit=crop", views: 520, likes: 410, comments: 67, shares: 55, saves: 200 },
      { id: 3, thumbnail: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=400&fit=crop", views: 189, likes: 150, comments: 23, shares: 18, saves: 76 },
      { id: 4, thumbnail: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=400&fit=crop", views: 445, likes: 380, comments: 89, shares: 44, saves: 156 },
      { id: 5, thumbnail: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&h=400&fit=crop", views: 267, likes: 220, comments: 34, shares: 28, saves: 98 },
      { id: 6, thumbnail: "https://images.unsplash.com/photo-1544568100-847a948585b9?w=300&h=400&fit=crop", views: 612, likes: 500, comments: 112, shares: 78, saves: 245 },
    ],
  },
  {
    id: "whiskers",
    name: "Whiskers",
    username: "@whiskers.meow",
    bio: "Professional napper 😴 Box inspector 📦",
    emoji: "🐱",
    gradient: "from-purple-500/20 to-pink-500/20",
    breed: "Maine Coon",
    age: "5 yrs",
    following: 0,
    followers: 0,
    likes: 0,
    profileViews: 8,
    drafts: 0,
    draftsSize: "0 MB",
    posts: [
      { id: 1, thumbnail: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=400&fit=crop", views: 290, likes: 240, comments: 56, shares: 22, saves: 110 },
      { id: 2, thumbnail: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=300&h=400&fit=crop", views: 410, likes: 350, comments: 78, shares: 45, saves: 180 },
      { id: 3, thumbnail: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=300&h=400&fit=crop", views: 156, likes: 120, comments: 19, shares: 12, saves: 55 },
      { id: 4, thumbnail: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=300&h=400&fit=crop", views: 380, likes: 310, comments: 67, shares: 38, saves: 145 },
    ],
  },
  {
    id: "spirit",
    name: "Spirit",
    username: "@spirit.arabian",
    bio: "Born to run 🏇 Desert soul",
    emoji: "🐴",
    gradient: "from-emerald-500/20 to-teal-500/20",
    breed: "Arabian",
    age: "8 yrs",
    following: 0,
    followers: 0,
    likes: 0,
    profileViews: 4,
    drafts: 1,
    draftsSize: "1.1 MB",
    posts: [
      { id: 1, thumbnail: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=300&h=400&fit=crop", views: 890, likes: 720, comments: 134, shares: 98, saves: 340 },
      { id: 2, thumbnail: "https://images.unsplash.com/photo-1534773728080-33d4b294e695?w=300&h=400&fit=crop", views: 650, likes: 540, comments: 89, shares: 67, saves: 245 },
      { id: 3, thumbnail: "https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=300&h=400&fit=crop", views: 430, likes: 360, comments: 56, shares: 42, saves: 178 },
      { id: 4, thumbnail: "https://images.unsplash.com/photo-1450052590821-8bf91254a353?w=300&h=400&fit=crop", views: 1200, likes: 980, comments: 210, shares: 156, saves: 490 },
      { id: 5, thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=400&fit=crop", views: 340, likes: 280, comments: 45, shares: 32, saves: 120 },
    ],
  },
];
