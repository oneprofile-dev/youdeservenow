import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

export function generateId(): string {
  return nanoid();
}

export function sanitizeInput(raw: string): string {
  // Strip HTML tags
  let clean = raw.replace(/<[^>]*>/g, "");
  // Normalize whitespace
  clean = clean.replace(/\s+/g, " ").trim();
  // Limit length
  return clean.slice(0, 500);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://youdeservenow.com";
}
