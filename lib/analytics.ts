import { kv } from "@vercel/kv";

export interface EngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  avgSessionDuration: number;
  bounceRate: number;
  returningUserRate: number;
}

export interface ConversionMetrics {
  totalSessions: number;
  completedLeaderboards: number;
  purchasesAttempted: number;
  purchasesCompleted: number;
  conversionRate: number;
  avgOrderValue: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  affiliateRevenue: number;
  directRevenue: number;
  topAffiliateTag: string;
  topAffiliateRevenue: number;
  revenuePerUser: number;
}

export interface PerformanceMetrics {
  avgPageLoadTime: number;
  avgFCP: number;
  avgLCP: number;
  avgCLS: number;
  coreWebVitalsScore: number;
}

export interface AnalyticsSnapshot {
  timestamp: number;
  engagement: EngagementMetrics;
  conversion: ConversionMetrics;
  revenue: RevenueMetrics;
  performance: PerformanceMetrics;
}

// Track user session
export async function trackUserSession(userId: string, sessionId: string) {
  const today = new Date().toISOString().split("T")[0];
  const dailyKey = `dau:${today}:${userId}`;
  const weekKey = `wau:week-${getWeek()}:${userId}`;
  const monthKey = `mau:month-${getMonth()}:${userId}`;

  // Set user in daily/weekly/monthly sets (expire after period)
  await Promise.all([
    kv.setex(dailyKey, 86400, 1), // 24h
    kv.setex(weekKey, 604800, 1), // 7d
    kv.setex(monthKey, 2592000, 1), // 30d
  ]);

  // Track session
  await kv.hset(`session:${sessionId}`, {
    userId,
    startTime: Date.now(),
    lastActivity: Date.now(),
  });
}

// Track conversion event
export async function trackConversion(
  userId: string,
  type: "leaderboard_complete" | "purchase_attempt" | "purchase_complete",
  value?: number
) {
  const today = new Date().toISOString().split("T")[0];
  const key = `conversion:${today}:${type}`;

  await kv.incr(key);

  if (value) {
    await kv.incrbyfloat(`revenue:${today}`, value);
  }
}

// Track affiliate revenue
export async function trackAffiliateClick(
  affiliateTag: string,
  revenue: number
) {
  const today = new Date().toISOString().split("T")[0];
  const key = `affiliate:${today}:${affiliateTag}`;

  await Promise.all([
    kv.incr(key),
    kv.incrbyfloat(`affiliate_revenue:${today}:${affiliateTag}`, revenue),
    kv.incrbyfloat(`total_affiliate_revenue:${today}`, revenue),
  ]);
}

// Track Web Vitals
export async function trackWebVitals(
  metrics: {
    fcp?: number;
    lcp?: number;
    cls?: number;
    ttfb?: number;
  }
) {
  const today = new Date().toISOString().split("T")[0];

  for (const [key, value] of Object.entries(metrics)) {
    if (value) {
      await kv.lpush(`vital:${today}:${key}`, value);
    }
  }
}

// Get current engagement metrics
export async function getEngagementMetrics(): Promise<EngagementMetrics> {
  const today = new Date().toISOString().split("T")[0];
  const week = `week-${getWeek()}`;
  const month = `month-${getMonth()}`;

  // Count unique users in sets
  const dau = await kv.dbsize().then(() =>
    kv.keys(`dau:${today}:*`).then((keys) => keys.length)
  );
  const wau = await kv.keys(`wau:${week}:*`).then((keys) => keys.length);
  const mau = await kv.keys(`mau:${month}:*`).then((keys) => keys.length);

  // Get average session duration
  const sessions = await kv.keys("session:*");
  let totalDuration = 0;
  for (const session of sessions) {
    const data = await kv.hgetall(session);
    if (data && data.startTime && data.lastActivity) {
      totalDuration += (data.lastActivity as number) - (data.startTime as number);
    }
  }
  const avgSessionDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;

  return {
    dailyActiveUsers: Math.max(dau, 1),
    weeklyActiveUsers: Math.max(wau, 1),
    monthlyActiveUsers: Math.max(mau, 1),
    avgSessionDuration: Math.round(avgSessionDuration / 1000), // Convert to seconds
    bounceRate: 0.25, // Placeholder - calculate from session data
    returningUserRate: 0.35, // Placeholder - calculate from repeat visits
  };
}

// Get conversion metrics
export async function getConversionMetrics(): Promise<ConversionMetrics> {
  const today = new Date().toISOString().split("T")[0];

  const leaderboard = await kv.get<number>(`conversion:${today}:leaderboard_complete`) || 0;
  const purchaseAttempt = await kv.get<number>(`conversion:${today}:purchase_attempt`) || 0;
  const purchaseComplete = await kv.get<number>(`conversion:${today}:purchase_complete`) || 0;

  const totalSessions = await kv.keys("session:*").then((keys) => keys.length);
  const conversionRate = totalSessions > 0 ? (purchaseComplete / totalSessions) * 100 : 0;
  const revenue = await kv.get<number>(`revenue:${today}`) || 0;
  const avgOrderValue = purchaseComplete > 0 ? revenue / purchaseComplete : 0;

  return {
    totalSessions: Math.max(totalSessions, 1),
    completedLeaderboards: leaderboard,
    purchasesAttempted: purchaseAttempt,
    purchasesCompleted: purchaseComplete,
    conversionRate: parseFloat(conversionRate.toFixed(2)),
    avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
  };
}

// Get revenue metrics
export async function getRevenueMetrics(): Promise<RevenueMetrics> {
  const today = new Date().toISOString().split("T")[0];

  const totalRevenue = await kv.get<number>(`revenue:${today}`) || 0;
  const affiliateRevenue = await kv.get<number>(`total_affiliate_revenue:${today}`) || 0;
  const directRevenue = totalRevenue - affiliateRevenue;

  // Get top affiliate
  const affiliateKeys = await kv.keys(`affiliate:${today}:*`);
  let topAffiliateTag = "N/A";
  let topAffiliateRevenue = 0;

  for (const key of affiliateKeys) {
    const tag = key.split(":")[2];
    const revenue = await kv.get<number>(`affiliate_revenue:${today}:${tag}`) || 0;
    if (revenue > topAffiliateRevenue) {
      topAffiliateRevenue = revenue;
      topAffiliateTag = tag;
    }
  }

  const engagement = await getEngagementMetrics();
  const revenuePerUser = engagement.dailyActiveUsers > 0
    ? totalRevenue / engagement.dailyActiveUsers
    : 0;

  return {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    affiliateRevenue: parseFloat(affiliateRevenue.toFixed(2)),
    directRevenue: parseFloat(directRevenue.toFixed(2)),
    topAffiliateTag,
    topAffiliateRevenue: parseFloat(topAffiliateRevenue.toFixed(2)),
    revenuePerUser: parseFloat(revenuePerUser.toFixed(2)),
  };
}

// Get performance metrics
export async function getPerformanceMetrics(): Promise<PerformanceMetrics> {
  const today = new Date().toISOString().split("T")[0];

  const getFCPList = async () => await kv.lrange(`vital:${today}:fcp`, 0, -1);
  const getLCPList = async () => await kv.lrange(`vital:${today}:lcp`, 0, -1);
  const getCLSList = async () => await kv.lrange(`vital:${today}:cls`, 0, -1);

  const [fcpList, lcpList, clsList] = await Promise.all([
    getFCPList(),
    getLCPList(),
    getCLSList(),
  ]);

  const avg = (nums: (string | number)[]) => {
    if (nums.length === 0) return 0;
    const sum = nums.reduce((a: number, b) => a + parseFloat(String(b)), 0);
    return sum / nums.length;
  };

  const avgFCP = avg(fcpList);
  const avgLCP = avg(lcpList);
  const avgCLS = avg(clsList);

  // Calculate Core Web Vitals score (simplified)
  const score =
    (avgFCP < 1800 ? 1 : 0) * 0.33 +
    (avgLCP < 2500 ? 1 : 0) * 0.33 +
    (avgCLS < 0.1 ? 1 : 0) * 0.34;

  return {
    avgPageLoadTime: Math.round((avgFCP + avgLCP) / 2),
    avgFCP: Math.round(avgFCP),
    avgLCP: Math.round(avgLCP),
    avgCLS: parseFloat(avgCLS.toFixed(3)),
    coreWebVitalsScore: parseFloat((score * 100).toFixed(1)),
  };
}

// Get full analytics snapshot
export async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  const [engagement, conversion, revenue, performance] = await Promise.all([
    getEngagementMetrics(),
    getConversionMetrics(),
    getRevenueMetrics(),
    getPerformanceMetrics(),
  ]);

  return {
    timestamp: Date.now(),
    engagement,
    conversion,
    revenue,
    performance,
  };
}

// Helper functions
function getWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const week = Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
  return week;
}

function getMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
