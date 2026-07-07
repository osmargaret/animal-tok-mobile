import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "animaltok_pinned_posts";
const MAX_PINNED = 3;

type PinnedMap = Record<string, Array<number | string>>;

const read = (): PinnedMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const usePinnedPosts = (ownerId: string | undefined) => {
  const [all, setAll] = useState<PinnedMap>(() => read());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {}
  }, [all]);

  const pinned = ownerId ? all[ownerId] || [] : [];

  const isPinned = useCallback(
    (postId: number | string) => pinned.includes(postId),
    [pinned]
  );

  const togglePin = useCallback(
    (postId: number | string) => {
      if (!ownerId) return;
      setAll((prev) => {
        const list = prev[ownerId] || [];
        if (list.includes(postId)) {
          return { ...prev, [ownerId]: list.filter((p) => p !== postId) };
        }
        if (list.length >= MAX_PINNED) return prev;
        return { ...prev, [ownerId]: [postId, ...list] };
      });
    },
    [ownerId]
  );

  return { pinned, isPinned, togglePin, maxPinned: MAX_PINNED };
};
