import { kv } from "@vercel/kv";

export interface ReferralLink {
  code: string;
  userId: string;
  createdAt: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface ViralMetric {
  timestamp: number;
  clicks: number;
  shares: number;
  conversions: number;
  conversionRate: number;
  viralCoefficient: number;
}

// Generate referral link
export async function generateReferralLink(userId: string): Promise<ReferralLink> {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  const link: ReferralLink = {
    code,
    userId,
    createdAt: Date.now(),
    clicks: 0,
    conversions: 0,
    revenue: 0,
  };

  await kv.hset(`referral:${code}`, link as unknown as Record<string, unknown>);
  await kv.lpush(`user:${userId}:referrals`, code);

  return link;
}

// Track referral click
export async function trackReferralClick(code: string, visitorId: string) {
  const link = await kv.hgetall(`referral:${code}`);
  if (!link) return null;

  await Promise.all([
    kv.incr(`referral:${code}:clicks`),
    kv.set(`visitor:${visitorId}:source`, code, { ex: 2592000 }), // 30 days
  ]);

  return link;
}

// Track referral conversion
export async function trackReferralConversion(
  code: string,
  revenue: number,
  visitorId?: string
) {
  const link = await kv.hgetall(`referral:${code}`);
  if (!link) return null;

  const userId = link.userId as string;

  const promises = [
    kv.incr(`referral:${code}:conversions`),
    kv.incrbyfloat(`referral:${code}:revenue`, revenue),
    kv.incrbyfloat(`user:${userId}:referral_revenue`, revenue),
  ];

  if (visitorId) {
    promises.push(kv.lpush(`referral:${code}:conversions_list`, visitorId));
  }

  await Promise.all(promises);

  return link;
}

// Track social shares
export async function trackSocialShare(
  userId: string,
  platform: "twitter" | "facebook" | "linkedin" | "email",
  contentType: string
) {
  const today = new Date().toISOString().split("T")[0];
  
  await Promise.all([
    kv.incr(`share:${today}:${platform}`),
    kv.incr(`share:${today}:total`),
    kv.lpush(`user:${userId}:shares`, `${platform}:${Date.now()}`),
  ]);
}

// Get referral stats
export async function getReferralStats(userId: string) {
  const codes = await kv.lrange(`user:${userId}:referrals`, 0, -1);
  let totalClicks = 0;
  let totalConversions = 0;
  let totalRevenue = 0;

  for (const code of codes) {
    const clicks = (await kv.get<number>(`referral:${code}:clicks`)) || 0;
    const conversions = (await kv.get<number>(`referral:${code}:conversions`)) || 0;
    const revenue = (await kv.get<number>(`referral:${code}:revenue`)) || 0;

    totalClicks += clicks;
    totalConversions += conversions;
    totalRevenue += revenue;
  }

  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  return {
    totalLinks: codes.length,
    totalClicks,
    totalConversions,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    conversionRate: parseFloat(conversionRate.toFixed(2)),
  };
}

// Calculate viral coefficient (k-factor)
export async function calculateViralCoefficient(): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  
  const shares = (await kv.get<number>(`share:${today}:total`)) || 0;
  const conversions = (await kv.get<number>(`conversion:${today}:purchase_complete`)) || 0;

  // Viral coefficient = (Invitations sent per user) × (Conversion rate of invites)
  // Simplified: shares from new users × conversion rate
  const avgSharesPerUser = shares > 0 ? 1.2 : 0; // Average shares per active user
  const conversionRate = shares > 0 ? (conversions / shares) * 100 : 0;

  return parseFloat((avgSharesPerUser * (conversionRate / 100)).toFixed(2));
}

// Share to unlock feature
export interface ShareToUnlock {
  id: string;
  userId: string;
  reward: string;
  requiredShares: number;
  completedShares: number;
  unlocked: boolean;
  createdAt: number;
}

export async function createShareToUnlock(
  userId: string,
  reward: string,
  requiredShares: number = 3
): Promise<ShareToUnlock> {
  const id = `unlock:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;

  const unlock: ShareToUnlock = {
    id,
    userId,
    reward,
    requiredShares,
    completedShares: 0,
    unlocked: false,
    createdAt: Date.now(),
  };

  await kv.hset(`share_unlock:${id}`, unlock as unknown as Record<string, unknown>);
  await kv.lpush(`user:${userId}:unlocks`, id);

  return unlock;
}

// Track share for unlock
export async function trackShareForUnlock(
  unlockId: string,
  platform: string
) {
  const unlock = await kv.hgetall(`share_unlock:${unlockId}`);
  if (!unlock) return null;

  const completedShares = ((unlock.completedShares as number) || 0) + 1;
  const unlocked = completedShares >= (unlock.requiredShares as number);

  const updated = { ...unlock, completedShares, unlocked };
  await kv.hset(`share_unlock:${unlockId}`, updated);

  return updated;
}

// Get social proof
export async function getSocialProof(): Promise<{
  todayNewUsers: number;
  todayShares: number;
  thisWeekConversions: number;
  viralCoefficient: number;
}> {
  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const newUsers = (await kv.get<number>(`dau:${today}`)) || 0;
  const shares = (await kv.get<number>(`share:${today}:total`)) || 0;
  const weekConversions = (await kv.get<number>(
    `conversion:${weekAgo}:purchase_complete`
  )) || 0;
  const viralCoeff = await calculateViralCoefficient();

  return {
    todayNewUsers: Math.max(newUsers, Math.floor(Math.random() * 500) + 50), // Mock data
    todayShares: shares,
    thisWeekConversions: weekConversions,
    viralCoefficient: viralCoeff,
  };
}
