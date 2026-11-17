import AsyncStorage from "@react-native-async-storage/async-storage";

const LEGACY_SAVED_KEY = "animaltok_saved_posts";
const profileSavedKey = (profileId?: string) =>
  profileId ? `animaltok_saved_posts_${profileId}` : LEGACY_SAVED_KEY;

async function readList(key: string): Promise<any[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getSavedPostsForProfile(
  profileId?: string,
  userId?: string
): Promise<any[]> {
  const scoped = profileId ? await readList(profileSavedKey(profileId)) : [];
  const legacy = await readList(LEGACY_SAVED_KEY);

  const isHandlerProfile = !profileId || (!!userId && String(profileId) === String(userId));
  const merged: any[] = [];
  const seen = new Set<string>();

  for (const item of scoped) {
    const key = String(item.id);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  }

  for (const item of legacy) {
    const key = String(item.id);
    if (seen.has(key)) continue;
    const owner = item.savedByProfileId ? String(item.savedByProfileId) : null;
    if ((profileId && owner === String(profileId)) || (isHandlerProfile && !owner)) {
      seen.add(key);
      merged.push(item);
    }
  }

  return merged;
}

export async function isPostSavedForProfile(
  postId: string | number,
  profileId?: string,
  userId?: string
): Promise<boolean> {
  const list = await getSavedPostsForProfile(profileId, userId);
  return list.some((p: any) => String(p.id) === String(postId));
}

export async function toggleSavedPostForProfile(
  post: any,
  shouldSave: boolean,
  profileId?: string,
  userId?: string
): Promise<void> {
  const key = profileSavedKey(profileId || userId);
  const current = await readList(key);
  const postIdStr = String(post.id);

  let updated: any[];
  if (shouldSave) {
    const filtered = current.filter((p: any) => String(p.id) !== postIdStr);
    updated = [{ ...post, savedByProfileId: profileId || userId }, ...filtered];
  } else {
    updated = current.filter((p: any) => String(p.id) !== postIdStr);
  }
  await AsyncStorage.setItem(key, JSON.stringify(updated));

  // If unsaving on handler/default profile, also clear from legacy key so old items don't reappear
  if (!shouldSave && (!profileId || (userId && String(profileId) === String(userId)))) {
    const legacy = await readList(LEGACY_SAVED_KEY);
    if (legacy.some((p: any) => String(p.id) === postIdStr && (!p.savedByProfileId || String(p.savedByProfileId) === String(profileId)))) {
      const cleanedLegacy = legacy.filter(
        (p: any) => !(String(p.id) === postIdStr && (!p.savedByProfileId || String(p.savedByProfileId) === String(profileId)))
      );
      await AsyncStorage.setItem(LEGACY_SAVED_KEY, JSON.stringify(cleanedLegacy));
    }
  }
}
