const fs = require('fs');
const path = require('path');

// 1. Update create.tsx
const createPath = path.resolve('animal-tok-mobile/app/(tabs)/create.tsx');
let createContent = fs.readFileSync(createPath, 'utf8').replace(/\r\n/g, '\n');

// Import AsyncStorage
if (!createContent.includes('@react-native-async-storage/async-storage')) {
  createContent = createContent.replace(
    'import * as ImagePicker from "expo-image-picker";',
    'import * as ImagePicker from "expo-image-picker";\nimport AsyncStorage from "@react-native-async-storage/async-storage";'
  );
}

// Update api.createPost call in create.tsx
const oldCreateCall = `      const serverPost = await api.createPost({
        animalId: activeProfile?.id,
        caption: caption.trim(),
        videoUrl: isVideo ? finalMediaUrl : undefined,
        imageUrl: !isVideo ? finalMediaUrl : undefined,
        tags: [
          ...hashtags.split(" ").filter((t) => t.trim().length > 0),
          \`#\${selectedPillar}\`,
        ],
        audioUrl: soundUrl,
        audioName: soundTitle,
      });

      // 3. Optimistic update to feed
      feedPosts.unshift({
        id: serverPost?.id || Date.now(),
        username: activeProfile?.username || "@pet",
        displayName: activeProfile?.name || "Pet",
        avatar: activeProfile?.avatar || "🐾",
        time: "Just now",
        caption: caption.trim(),
        hashtags: \`\${hashtags} #\${selectedPillar}\`,
        videoUrl: isVideo ? finalMediaUrl : "",
        posterUrl: finalMediaUrl,
        imageUrl: !isVideo ? finalMediaUrl : undefined,
        audioUrl: soundUrl,
        audioName: soundTitle ? \`🎵 \${soundTitle}\` : undefined,
        likes: 0,
        comments: 0,
        saves: 0,
        commentsList: [],
      });`;

const newCreateCall = `      const serverPost = await api.createPost({
        animalId: activeProfile?.id,
        animalName: activeProfile?.name,
        animalUsername: activeProfile?.username,
        animalAvatar: activeProfile?.avatar,
        caption: caption.trim(),
        videoUrl: isVideo ? finalMediaUrl : undefined,
        imageUrl: !isVideo ? finalMediaUrl : undefined,
        tags: [
          ...hashtags.split(" ").filter((t) => t.trim().length > 0),
          \`#\${selectedPillar}\`,
        ],
        audioUrl: soundUrl,
        audioName: soundTitle,
      });

      // 3. Optimistic update to feed & profile posts
      const newPostItem = {
        id: serverPost?.id || Date.now(),
        animalId: activeProfile?.id,
        username: activeProfile?.username || "@pet",
        displayName: activeProfile?.name || "Pet",
        avatar: activeProfile?.avatar || "🐾",
        time: "Just now",
        caption: caption.trim(),
        hashtags: \`\${hashtags} #\${selectedPillar}\`,
        videoUrl: isVideo ? finalMediaUrl : "",
        posterUrl: finalMediaUrl,
        imageUrl: !isVideo ? finalMediaUrl : undefined,
        audioUrl: soundUrl,
        audioName: soundTitle ? \`🎵 \${soundTitle}\` : undefined,
        likes: 0,
        comments: 0,
        saves: 0,
        commentsList: [],
      };
      feedPosts.unshift(newPostItem as any);

      // Persist post locally so it immediately shows in the profile grid and feed
      try {
        const storedPosts = await AsyncStorage.getItem("animaltok_custom_posts");
        const list = storedPosts ? JSON.parse(storedPosts) : [];
        list.unshift(newPostItem);
        await AsyncStorage.setItem("animaltok_custom_posts", JSON.stringify(list));
      } catch (e) {
        console.warn("Failed to persist custom post:", e);
      }`;

if (createContent.includes(oldCreateCall)) {
  createContent = createContent.replace(oldCreateCall, newCreateCall);
  fs.writeFileSync(createPath, createContent, 'utf8');
  console.log('Successfully updated create.tsx with post persistence!');
} else {
  console.warn('Could not find oldCreateCall in create.tsx');
}

// 2. Update AuthContext.tsx to load persisted posts on startup
const authPath = path.resolve('animal-tok-mobile/src/contexts/AuthContext.tsx');
let authContent = fs.readFileSync(authPath, 'utf8').replace(/\r\n/g, '\n');

const loadCustomPostsSnippet = `    // Load persisted custom user posts into feedPosts
    AsyncStorage.getItem("animaltok_custom_posts").then((storedPosts) => {
      if (storedPosts) {
        try {
          const list = JSON.parse(storedPosts);
          if (Array.isArray(list)) {
            const { feedPosts } = require("@/data/feedData");
            list.forEach((p: any) => {
              if (!feedPosts.some((existing: any) => existing.id === p.id)) {
                feedPosts.unshift(p);
              }
            });
          }
        } catch (e) {}
      }
    }).catch(() => {});\n`;

if (!authContent.includes('animaltok_custom_posts')) {
  authContent = authContent.replace(
    'Promise.all([\n      AsyncStorage.getItem(ACTIVE_PROFILE_KEY),',
    loadCustomPostsSnippet + '\n    Promise.all([\n      AsyncStorage.getItem(ACTIVE_PROFILE_KEY),'
  );
  fs.writeFileSync(authPath, authContent, 'utf8');
  console.log('Successfully updated AuthContext.tsx with startup post loading!');
}

