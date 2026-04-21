import { kv } from "@vercel/kv";

export interface Feedback {
  id: string;
  userId: string;
  type: "feature_request" | "bug_report" | "general_feedback";
  message: string;
  npsScore?: number;
  sentiment?: "positive" | "neutral" | "negative";
  createdAt: number;
  email?: string;
}

export interface NPSSurvey {
  score: number;
  feedback?: string;
  createdAt: number;
  userId: string;
}

// Submit feedback
export async function submitFeedback(
  userId: string,
  type: Feedback["type"],
  message: string,
  email?: string
): Promise<Feedback> {
  const id = `feedback:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
  const sentiment = await analyzeSentiment(message);

  const feedback: Feedback = {
    id,
    userId,
    type,
    message,
    sentiment,
    createdAt: Date.now(),
    email,
  };

  await kv.hset(`feedback:${id}`, feedback as unknown as Record<string, unknown>);
  await kv.lpush(`feedback:list`, id);
  await kv.lpush(`feedback:${type}`, id);

  return feedback;
}

// Submit NPS score
export async function submitNPS(
  userId: string,
  score: number,
  feedback?: string
): Promise<NPSSurvey> {
  const survey: NPSSurvey = {
    score,
    feedback,
    createdAt: Date.now(),
    userId,
  };

  const surveyId = `nps:${Date.now()}:${userId}`;
  await kv.hset(`nps:${surveyId}`, survey as unknown as Record<string, unknown>);
  await kv.lpush("nps:list", surveyId);

  // Categorize as promoter, passive, or detractor
  let category = "detractor";
  if (score >= 9) category = "promoter";
  else if (score >= 7) category = "passive";

  await kv.lpush(`nps:${category}`, surveyId);
  await kv.incr(`nps:count:${category}`);

  return survey;
}

// Analyze sentiment (simplified - uses keyword matching)
async function analyzeSentiment(
  text: string
): Promise<"positive" | "neutral" | "negative"> {
  const posKeywords = [
    "great",
    "amazing",
    "love",
    "excellent",
    "perfect",
    "awesome",
    "happy",
    "fantastic",
    "wonderful",
  ];
  const negKeywords = [
    "terrible",
    "horrible",
    "hate",
    "bad",
    "poor",
    "awful",
    "disappointing",
    "broken",
    "issue",
    "bug",
  ];

  const lowerText = text.toLowerCase();
  const posCount = posKeywords.filter((k) => lowerText.includes(k)).length;
  const negCount = negKeywords.filter((k) => lowerText.includes(k)).length;

  if (posCount > negCount) return "positive";
  if (negCount > posCount) return "negative";
  return "neutral";
}

// Get NPS score
export async function getNPSScore(): Promise<{
  npsScore: number;
  promoters: number;
  passives: number;
  detractors: number;
  responseCount: number;
}> {
  const promoters = (await kv.get<number>("nps:count:promoter")) || 0;
  const passives = (await kv.get<number>("nps:count:passive")) || 0;
  const detractors = (await kv.get<number>("nps:count:detractor")) || 0;

  const responseCount = promoters + passives + detractors;
  const npsScore =
    responseCount > 0
      ? ((promoters - detractors) / responseCount) * 100
      : 0;

  return {
    npsScore: parseFloat(npsScore.toFixed(1)),
    promoters,
    passives,
    detractors,
    responseCount,
  };
}

// Get feedback by type
export async function getFeedbackByType(
  type: Feedback["type"],
  limit: number = 50
) {
  const ids = await kv.lrange(`feedback:${type}`, 0, limit - 1);
  const feedback = [];

  for (const id of ids) {
    const item = await kv.hgetall(`feedback:${id}`);
    if (item) feedback.push(item);
  }

  return feedback;
}

// Get sentiment breakdown
export async function getSentimentBreakdown(): Promise<{
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}> {
  const ids = await kv.lrange("feedback:list", 0, -1);
  let positive = 0,
    neutral = 0,
    negative = 0;

  for (const id of ids) {
    const item = await kv.hgetall(`feedback:${id}`);
    if (!item) continue;

    const sentiment = item.sentiment as string;
    if (sentiment === "positive") positive++;
    else if (sentiment === "negative") negative++;
    else neutral++;
  }

  return {
    positive,
    neutral,
    negative,
    total: positive + neutral + negative,
  };
}

// Get recent feedback (last 24 hours)
export async function getRecentFeedback(hoursBack: number = 24) {
  const ids = await kv.lrange("feedback:list", 0, -1);
  const cutoff = Date.now() - hoursBack * 60 * 60 * 1000;
  const recent = [];

  for (const id of ids) {
    const item = await kv.hgetall(`feedback:${id}`);
    if (item && (item.createdAt as number) > cutoff) {
      recent.push(item);
    }
  }

  return recent.sort((a, b) => (b.createdAt as number) - (a.createdAt as number));
}
