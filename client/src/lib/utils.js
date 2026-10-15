import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getApiUrl(endpoint = "") {
  let base = (import.meta.env.VITE_API_URL || "http://localhost:3001/").trim();
  if (!base.startsWith("http://") && !base.startsWith("https://")) {
    base = `https://${base}`;
  }
  const formattedBase = base.endsWith("/") ? base : `${base}/`;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${formattedBase}${cleanEndpoint}`;
}

