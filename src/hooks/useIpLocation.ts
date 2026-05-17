import { useEffect, useState } from "react";

export interface IpLocation {
  city: string;
  region: string;
  country: string;
  countryCode: string;
  ip?: string;
}

const CACHE_KEY = "at_ip_location";
const CACHE_TTL = 1000 * 60 * 30; // 30 min

const fetchLocation = async (): Promise<IpLocation> => {
  const res = await fetch("https://ipapi.co/json/");
  if (!res.ok) throw new Error("Failed to detect location");
  const j = await res.json();
  return {
    city: j.city || "",
    region: j.region || "",
    country: j.country_name || "",
    countryCode: j.country_code || "",
    ip: j.ip,
  };
};

export const useIpLocation = () => {
  const [location, setLocation] = useState<IpLocation | null>(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts < CACHE_TTL) return data;
      return null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!location);
  const [error, setError] = useState<string | null>(null);

  const load = async (force = false) => {
    if (!force && location) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLocation();
      setLocation(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!location) load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { location, loading, error, refresh: () => load(true) };
};
