export interface FeedPost {
  id: number | string;
  animalId?: string;
  username: string;
  displayName: string;
  avatar: string;
  time: string;
  caption: string;
  hashtags: string;
  videoUrl: string;
  posterUrl: string;
  imageUrl?: string;
  audioUrl?: string;
  audioName?: string;
  likes: number;
  comments: number;
  saves: number;
  commentsList: CommentItem[];
}

export interface CommentItem {
  user: string;
  avatar: string;
  text: string;
  time: string;
}

export const feedPosts: FeedPost[] = [
  {
    id: 1,
    animalId: "1",
    username: "@bailey.thelab",
    displayName: "Bailey",
    avatar: "🐕",
    time: "Just now",
    caption: "Golden hour sprint at the dog park! Autumn breeze and endless fetch 🍂🎾",
    hashtags: "#goldenretriever #doglife #playfulpet #daily",
    videoUrl: "https://res.cloudinary.com/lo1xfi5f/video/upload/v1794484176/animaltok/posts/dxqt6qs6d4zkiynkgd0f.webm",
    posterUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop&q=80",
    audioUrl: "https://animal-tok-backend.onrender.com/uploads/sounds/track1.wav",
    audioName: "Golden Hour Bark & Bounce - The Paws Crew",
    likes: 0,
    comments: 0,
    saves: 0,
    commentsList: [],
  },
  {
    id: 2,
    animalId: "2",
    username: "@luna.cat",
    displayName: "Luna",
    avatar: "🐈",
    time: "15m ago",
    caption: "Found the perfect sunspot by the living room window ☀️ cozy nap time",
    hashtags: "#mainecoon #catlover #cozypets #daily",
    videoUrl: "",
    posterUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80",
    audioUrl: "https://animal-tok-backend.onrender.com/uploads/sounds/track3.wav",
    audioName: "Cute Cat Nap (Lofi Purr) - Chill Whiskers",
    likes: 0,
    comments: 0,
    saves: 0,
    commentsList: [],
  },
  {
    id: 3,
    animalId: "coco",
    username: "@coco.parrot",
    displayName: "Coco",
    avatar: "🦜",
    time: "45m ago",
    caption: "Practicing morning whistles and saying 'Good morning Animandler!' 🦜🎶",
    hashtags: "#parrot #smartpet #whistlebeat #tricks",
    videoUrl: "",
    posterUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80",
    audioUrl: "https://animal-tok-backend.onrender.com/uploads/sounds/track4.wav",
    audioName: "Happy Puppy Walk - Sunny Tails",
    likes: 0,
    comments: 0,
    saves: 0,
    commentsList: [],
  },
  {
    id: 4,
    animalId: "bella",
    username: "@bella.lab",
    displayName: "Bella",
    avatar: "🐕",
    time: "2h ago",
    caption: "Agility practice complete! Ready for this weekend's local tournament 🏆🐾",
    hashtags: "#dogagility #sports #workingdog #fitpet",
    videoUrl: "https://res.cloudinary.com/lo1xfi5f/video/upload/v1794484176/animaltok/posts/dxqt6qs6d4zkiynkgd0f.webm",
    posterUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop&q=80",
    audioUrl: "https://animal-tok-backend.onrender.com/uploads/sounds/track2.wav",
    audioName: "Agility Sprint Beat (Electro Pet) - DJ Pawz x BeatClub",
    likes: 0,
    comments: 0,
    saves: 0,
    commentsList: [],
  },
  {
    id: 5,
    animalId: "pet_jasper",
    username: "@jasper.shepherd",
    displayName: "Jasper",
    avatar: "🐕‍🦺",
    time: "3h ago",
    caption: "Beach sprint zoomies with my handler! Best afternoon workout ever 🌊⚡️",
    hashtags: "#germanshepherd #beachrun #zoomies #sports",
    videoUrl: "",
    posterUrl: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&auto=format&fit=crop&q=80",
    audioUrl: "https://animal-tok-backend.onrender.com/uploads/sounds/track5.wav",
    audioName: "Zoomies Anthem (Bass Boosted) - HyperHound",
    likes: 0,
    comments: 0,
    saves: 0,
    commentsList: [],
  },
  {
    id: 6,
    animalId: "pet_peanut",
    username: "@peanut.bunny",
    displayName: "Peanut",
    avatar: "🐰",
    time: "5h ago",
    caption: "Crunchy snack time! Fresh organic cilantro hits the spot 🌿🐰",
    hashtags: "#bunnylife #dwarfrabbit #cute #daily",
    videoUrl: "",
    posterUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&auto=format&fit=crop&q=80",
    audioUrl: "https://animal-tok-backend.onrender.com/uploads/sounds/track6.wav",
    audioName: "Dramatic Hamster Nibble - Comedy Pets Co.",
    likes: 0,
    comments: 0,
    saves: 0,
    commentsList: [],
  },
];
