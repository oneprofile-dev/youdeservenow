const STREAK_COOKIE = "ydn_streak";
const LAST_VISIT_COOKIE = "ydn_last_visit";

export interface StreakData {
  count: number;
  isNew: boolean; // true if streak just incremented this visit
}

export function getStreakFromCookies(): StreakData {
  if (typeof document === "undefined") return { count: 0, isNew: false };

  const today = new Date().toISOString().slice(0, 10);
  const lastVisit = getCookie(LAST_VISIT_COOKIE);
  const currentStreak = parseInt(getCookie(STREAK_COOKIE) ?? "0", 10);

  if (lastVisit === today) {
    return { count: currentStreak, isNew: false };
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newStreak = lastVisit === yesterday ? currentStreak + 1 : 1;

  setCookie(STREAK_COOKIE, String(newStreak), 30);
  setCookie(LAST_VISIT_COOKIE, today, 30);

  return { count: newStreak, isNew: true };
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getStreakLabel(count: number): string {
  if (count >= 30) return "Legendary Deserver";
  if (count >= 14) return "Elite Reward Seeker";
  if (count >= 7) return "Dedicated Achiever";
  if (count >= 3) return "Habit Former";
  return "Day " + count;
}

export function isRareDiagnosis(count: number): boolean {
  return count >= 7;
}
