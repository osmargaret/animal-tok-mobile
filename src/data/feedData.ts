export interface FeedPost {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  time: string;
  caption: string;
  hashtags: string;
  videoUrl: string;
  posterUrl: string;
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
    username: "@nikikua_gang",
    displayName: "Nikikua Gang",
    avatar: "🐕",
    time: "2h ago",
    caption: "NIKIKUA NITAACHA GANG jump and shake well 😂😂😂",
    hashtags: "#funny #animals #dance",
    videoUrl: "https://cdn.pixabay.com/video/2020/05/25/40130-424930032_large.mp4",
    posterUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=700&fit=crop",
    likes: 1200,
    comments: 89,
    saves: 245,
    commentsList: [
      { user: "@dog_lover", avatar: "🐕", text: "Hilarious! 😂", time: "5 min ago" },
      { user: "@cat_whisperer", avatar: "🐈", text: "Love this!", time: "12 min ago" },
    ],
  },
  {
    id: 2,
    username: "@luna_cat",
    displayName: "Luna",
    avatar: "🐈",
    time: "5h ago",
    caption: "Just chillin' 😎 #catlife",
    hashtags: "#cat #relax",
    videoUrl: "https://cdn.pixabay.com/video/2021/01/12/62244-500662700_large.mp4",
    posterUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=700&fit=crop",
    likes: 3400,
    comments: 215,
    saves: 678,
    commentsList: [
      { user: "@catlover", avatar: "🐈", text: "Luna is so cute!", time: "10 min ago" },
      { user: "@dogfan", avatar: "🐕", text: "Cats and boxes 😂", time: "1h ago" },
    ],
  },
  {
    id: 3,
    username: "@coco.parrot",
    displayName: "Coco",
    avatar: "🦜",
    time: "1d ago",
    caption: 'Learning new words! "Pretty bird!" 🗣️🦜',
    hashtags: "#parrot #talkingbird #smartpet",
    videoUrl: "https://cdn.pixabay.com/video/2019/11/11/29026-373780607_large.mp4",
    posterUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=700&fit=crop",
    likes: 5800,
    comments: 312,
    saves: 1023,
    commentsList: [
      { user: "@birdlover", avatar: "🦜", text: "Coco is so talented!", time: "20 min ago" },
      { user: "@parrotfan", avatar: "🦜", text: "Pretty bird! 🦜", time: "2h ago" },
    ],
  },
];
