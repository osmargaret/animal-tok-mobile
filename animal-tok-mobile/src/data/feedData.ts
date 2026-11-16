export interface FeedPost {
  id: number | string;
  animalId?: string;
  username: string;
  displayName: string;
  avatar: string;
  time: string;
  createdAt?: string;
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
  // Sponsored Ad / Promoted Content Fields
  isAd?: boolean;
  adType?: 'video' | 'image' | 'audio';
  title?: string;
  advertiserName?: string;
  advertiserAvatar?: string;
  sponsorBadge?: string;
  ctaText?: string;
  ctaUrl?: string;
  category?: string;
  mediaUrl?: string;
}

export interface CommentItem {
  user: string;
  avatar: string;
  text: string;
  time: string;
  createdAt?: string;
}

export const feedPosts: FeedPost[] = [
  {
    id: 1,
    animalId: "1",
    username: "@bailey.thelab",
    displayName: "Bailey",
    avatar: "🐕",
    time: "5m ago",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
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
    time: "25m ago",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
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
    time: "1h ago",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
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
    time: "3h ago",
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
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
    time: "5h ago",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
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
    time: "Yesterday",
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
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
  {
    id: "ad_emergency_vet_1",
    isAd: true,
    adType: "video",
    advertiserName: "Austin Pet Emergency Hospital",
    advertiserAvatar: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=150&auto=format&fit=crop&q=80",
    sponsorBadge: "Verified Hospital Partner",
    category: "Emergency Vet Care",
    time: "Sponsored",
    username: "@austin.pethospital",
    displayName: "Austin Pet Emergency Hospital",
    avatar: "🏥",
    caption: "24/7 Emergency trauma, intensive ICU, digital radiography & life-saving pet surgery. Certified veterinary specialists always on duty.",
    hashtags: "#AnimalHospital #EmergencyVet #AnimandlerPartner",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    posterUrl: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&auto=format&fit=crop&q=80",
    ctaText: "Call Emergency Vet 📞",
    ctaUrl: "tel:+15125550199",
    likes: 1420,
    comments: 184,
    saves: 52,
    commentsList: [],
  },
  {
    id: "ad_wellness_vet_2",
    isAd: true,
    adType: "image",
    advertiserName: "Paws & Whiskers Animal Clinic",
    advertiserAvatar: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=150&auto=format&fit=crop&q=80",
    sponsorBadge: "Featured Vet Clinic",
    category: "Preventive Care",
    time: "Sponsored",
    username: "@pawsandwhiskers.vet",
    displayName: "Paws & Whiskers Clinic",
    avatar: "🩺",
    caption: "Keep your furry family member thriving! Comprehensive physical checkups, core vaccinations, dental cleanings & nutrition planning. $25 off first visit!",
    hashtags: "#PetWellness #VetCheckup #PuppyVaccines",
    videoUrl: "",
    posterUrl: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&auto=format&fit=crop&q=80",
    ctaText: "Book Appointment 🩺",
    ctaUrl: "https://animandler.app",
    likes: 980,
    comments: 122,
    saves: 41,
    commentsList: [],
  }
];
