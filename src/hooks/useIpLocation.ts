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

  useEffect(() => {
    if (location) return;
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) throw new Error("Failed to detect location");
        const j = await res.json();
        const data: IpLocation = {
          city: j.city || "",
          region: j.region || "",
          country: j.country_name || "",
          countryCode: j.country_code || "",
          ip: j.ip,
        };
        if (cancel) return;
        setLocation(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
      } catch (e: unknown) {
        if (!cancel) setError(e instanceof Error ? e.message : "Failed");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [location]);

  return { location, loading, error };
};
