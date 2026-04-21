import { kv } from "@vercel/kv";

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: {
    id: string;
    name: string;
    config: Record<string, any>;
  }[];
  startDate: number;
  endDate?: number;
  status: "draft" | "running" | "paused" | "completed";
}

export interface VariantAssignment {
  userId: string;
  testId: string;
  variantId: string;
  assignedAt: number;
}

export interface ABTestMetrics {
  testId: string;
  variantId: string;
  conversions: number;
  totalVisitors: number;
  conversionRate: number;
  avgSessionDuration: number;
  avgOrderValue: number;
}

// Create A/B test
export async function createABTest(test: ABTest): Promise<ABTest> {
  const id = `test:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
  const testData = {
    ...test,
    id,
  };

  await kv.hset(`ab_test:${id}`, testData);
  await kv.lpush("ab_tests", id);

  return testData;
}

// Assign variant to user
export async function assignVariant(
  userId: string,
  testId: string
): Promise<VariantAssignment | null> {
  // Check if user already assigned
  const existing = await kv.get<string>(`user:${userId}:test:${testId}`);
  if (existing) {
    return {
      userId,
      testId,
      variantId: existing,
      assignedAt: Date.now(),
    };
  }

  // Get test
  const test = await kv.hgetall(`ab_test:${testId}`);
  if (!test || test.status !== "running") return null;

  // Random variant assignment
  const variants = test.variants as Array<{ id: string }>;
  const variantId = variants[Math.floor(Math.random() * variants.length)].id;

  const assignment: VariantAssignment = {
    userId,
    testId,
    variantId,
    assignedAt: Date.now(),
  };

  await Promise.all([
    kv.set(`user:${userId}:test:${testId}`, variantId),
    kv.lpush(`test:${testId}:assignments`, userId),
    kv.incr(`test:${testId}:variant:${variantId}:visitors`),
  ]);

  return assignment;
}

// Track conversion for A/B test
export async function trackTestConversion(
  userId: string,
  testId: string,
  value: number
) {
  const variantId = await kv.get<string>(`user:${userId}:test:${testId}`);
  if (!variantId) return null;

  await Promise.all([
    kv.incr(`test:${testId}:variant:${variantId}:conversions`),
    kv.incrbyfloat(
      `test:${testId}:variant:${variantId}:total_value`,
      value
    ),
  ]);

  return { testId, variantId, converted: true };
}

// Get A/B test metrics
export async function getABTestMetrics(testId: string): Promise<{
  test: ABTest | null;
  metrics: ABTestMetrics[];
  winner?: { variantId: string; conversionRate: number };
}> {
  const test = await kv.hgetall(`ab_test:${testId}`);
  if (!test) return { test: null, metrics: [] };

  const variants = test.variants as Array<{ id: string }>;
  const metrics: ABTestMetrics[] = [];
  let bestVariant = { variantId: "", conversionRate: 0 };

  for (const variant of variants) {
    const visitors =
      (await kv.get<number>(
        `test:${testId}:variant:${variant.id}:visitors`
      )) || 0;
    const conversions =
      (await kv.get<number>(
        `test:${testId}:variant:${variant.id}:conversions`
      )) || 0;
    const totalValue =
      (await kv.get<number>(
        `test:${testId}:variant:${variant.id}:total_value`
      )) || 0;

    const conversionRate = visitors > 0 ? (conversions / visitors) * 100 : 0;
    const avgOrderValue = conversions > 0 ? totalValue / conversions : 0;

    metrics.push({
      testId,
      variantId: variant.id,
      conversions,
      totalVisitors: visitors,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      avgSessionDuration: 0, // Would need separate tracking
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
    });

    if (conversionRate > bestVariant.conversionRate) {
      bestVariant = {
        variantId: variant.id,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
      };
    }
  }

  return {
    test: test as unknown as ABTest,
    metrics,
    winner: bestVariant.conversionRate > 0 ? bestVariant : undefined,
  };
}

// Get running tests
export async function getRunningTests(): Promise<ABTest[]> {
  const testIds = await kv.lrange("ab_tests", 0, -1);
  const tests: ABTest[] = [];

  for (const id of testIds) {
    const test = await kv.hgetall(`ab_test:${id}`);
    if (test && test.status === "running") {
      tests.push(test as unknown as ABTest);
    }
  }

  return tests;
}

// End A/B test
export async function endABTest(testId: string) {
  const test = await kv.hgetall(`ab_test:${testId}`);
  if (!test) return null;

  test.status = "completed";
  test.endDate = Date.now();

  await kv.hset(`ab_test:${testId}`, test);
  return test;
}

// Optimization config
export interface OptimizationConfig {
  enableDarkMode: boolean;
  buttonStyle: "rounded" | "square";
  heroImageSize: "small" | "medium" | "large";
  challengeDifficulty: "easy" | "medium" | "hard";
  rewardValue: number; // Percentage bonus
}

// Get optimization config for user
export async function getOptimizationConfig(
  userId: string
): Promise<OptimizationConfig> {
  const stored = await kv.hgetall(`user:${userId}:config`);
  if (stored) {
    return stored as unknown as OptimizationConfig;
  }

  // Default config
  const config: OptimizationConfig = {
    enableDarkMode: false,
    buttonStyle: "rounded",
    heroImageSize: "medium",
    challengeDifficulty: "medium",
    rewardValue: 100,
  };

  await kv.hset(`user:${userId}:config`, config as unknown as Record<string, unknown>);
  return config;
}

// Update optimization config
export async function updateOptimizationConfig(
  userId: string,
  config: Partial<OptimizationConfig>
) {
  const current = await getOptimizationConfig(userId);
  const updated = { ...current, ...config };
  await kv.hset(`user:${userId}:config`, updated);
  return updated;
}
