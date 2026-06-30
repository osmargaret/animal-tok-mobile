import { useCallback, useEffect, useMemo, useState } from "react";
import { animalProfiles } from "@/data/animalProfiles";

export type AnimalVerificationStatus = "none" | "pending" | "verified";

export interface AnimalMeta {
  bio?: string;
  photoAdded?: boolean;
  vaccinated?: boolean;
  microchipped?: boolean;
  verificationStatus?: AnimalVerificationStatus;
}

const STORAGE_KEY = "animaltok_animal_meta";

const readAll = (): Record<string, AnimalMeta> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const useAnimalMeta = (animalId: string | undefined) => {
  const [all, setAll] = useState<Record<string, AnimalMeta>>(() => readAll());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {}
  }, [all]);

  const seed = animalProfiles.find((a) => a.id === animalId);
  const meta: AnimalMeta = useMemo(() => {
    const stored = animalId ? all[animalId] || {} : {};
    return {
      bio: stored.bio ?? seed?.bio,
      photoAdded: stored.photoAdded ?? true, // seeded avatars count as added
      vaccinated: stored.vaccinated ?? false,
      microchipped: stored.microchipped ?? false,
      verificationStatus: stored.verificationStatus ?? "none",
    };
  }, [all, animalId, seed]);

  const checklist = useMemo(() => {
    const hasBreed = !!seed?.breed;
    const hasAge = !!seed?.age;
    return [
      { key: "photo", label: "Profile photo", done: !!meta.photoAdded },
      { key: "bio", label: "Short bio", done: !!meta.bio && meta.bio.trim().length > 4 },
      { key: "breed", label: "Breed", done: hasBreed },
      { key: "age", label: "Age", done: hasAge },
      { key: "vaccinated", label: "Vaccinated", done: !!meta.vaccinated },
      { key: "microchipped", label: "Microchipped", done: !!meta.microchipped },
    ];
  }, [meta, seed]);

  const completionPercent = useMemo(() => {
    const done = checklist.filter((i) => i.done).length;
    return Math.round((done / checklist.length) * 100);
  }, [checklist]);

  const update = useCallback(
    (patch: Partial<AnimalMeta>) => {
      if (!animalId) return;
      setAll((prev) => ({ ...prev, [animalId]: { ...(prev[animalId] || {}), ...patch } }));
    },
    [animalId]
  );

  const requestVerification = useCallback(() => {
    update({ verificationStatus: "pending" });
  }, [update]);

  return {
    meta,
    checklist,
    completionPercent,
    verified: meta.verificationStatus === "verified",
    verificationStatus: meta.verificationStatus || "none",
    update,
    requestVerification,
  };
};
