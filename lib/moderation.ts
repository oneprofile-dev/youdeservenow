/**
 * Content Moderation using OpenAI Moderation API
 * 
 * Detects and flags:
 * - Violence and harmful threats
 * - Self-harm and suicide
 * - Sexual content involving minors
 * - Hate speech and harassment
 * - Illegal activities
 * 
 * Cost: Free (included in API)
 * Latency: ~200ms per request
 * Accuracy: 99%+ precision
 */

interface ModerationResult {
  flagged: boolean;
  categories?: Record<string, boolean>;
  categoryScores?: Record<string, number>;
  reason?: string;
}

/**
 * Check if input violates content policy
 * Returns flagged status and category breakdown
 */
export async function checkContentModerationStatus(input: string): Promise<ModerationResult> {
  if (!input || input.length === 0) {
    return { flagged: false };
  }

  // Truncate to API limit (32k chars, but we'll be stricter)
  const truncated = input.slice(0, 1000);

  try {
    // Use OpenAI SDK's moderation endpoint
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: truncated,
        model: 'text-moderation-latest',
      }),
    });

    if (!response.ok) {
      // Log error but don't fail — fail open (don't block on API errors)
      console.error(`Moderation API error: ${response.status}`);
      return { flagged: false };
    }

    const data = (await response.json()) as {
      results: Array<{
        flagged: boolean;
        categories: Record<string, boolean>;
        category_scores: Record<string, number>;
      }>;
    };

    const result = data.results[0];
    if (!result) {
      return { flagged: false };
    }

    // Get flagged categories
    const flaggedCategories = Object.entries(result.categories)
      .filter(([_, flagged]) => flagged)
      .map(([name]) => name);

    let reason: string | undefined;
    if (flaggedCategories.length > 0) {
      reason = `Content flagged for: ${flaggedCategories.join(', ')}`;
    }

    return {
      flagged: result.flagged,
      categories: result.categories,
      categoryScores: result.category_scores,
      reason,
    };
  } catch (error) {
    console.error('Content moderation check failed:', error);
    // Fail open — don't block on network/API errors
    return { flagged: false };
  }
}

/**
 * Filter message to remove profanity/inappropriate words
 * This is a last-resort filter for edge cases
 */
export function filterProfanity(input: string): string {
  // Using a basic pattern — for production, use bad-words package
  // This is already available in your package.json
  const profanityPatterns = [
    /\bf+[a-z]*ck\b/gi,
    /\bsh[i!1]t\b/gi,
    /\bass+hole\b/gi,
  ];

  let cleaned = input;
  for (const pattern of profanityPatterns) {
    cleaned = cleaned.replace(pattern, (match) => '*'.repeat(match.length));
  }

  return cleaned;
}

/**
 * Create a friendly error message for rejected content
 */
export function getModerationErrorMessage(categories?: Record<string, boolean>): string {
  const hasViolence = categories?.violence || categories?.['graphic violence'];
  const hasSelfHarm = categories?.['self-harm'] || categories?.['sexual abuse'];
  const hasHate = categories?.['hate speech'];
  const hasIllegal = categories?.['illegal activity'];

  if (hasViolence) {
    return 'The Institute does not have research on this category. Try telling us about something smaller — a meal you cooked, a meeting you survived, a walk you took.';
  }

  if (hasSelfHarm) {
    return 'The Institute genuinely cares about your wellbeing. If you\'re struggling, please reach out to a counselor or call the 988 Suicide & Crisis Lifeline.';
  }

  if (hasHate) {
    return 'The Institute doesn\'t do research on topics like that. Try something more positive about your day.';
  }

  if (hasIllegal) {
    return 'The Institute operates within the law. Tell us about something legal you accomplished instead!';
  }

  return 'The Institute doesn\'t have research on this category. Try something different!';
}

/**
 * Validate input before AI generation
 * Returns OK or appropriate error message
 */
export async function validateInputForGeneration(input: string): Promise<{ valid: boolean; error?: string }> {
  // Length checks
  if (input.length < 3) {
    return { valid: false, error: 'Please tell us more about what you accomplished!' };
  }

  if (input.length > 500) {
    return { valid: false, error: 'That\'s a lot! Keep it under 500 characters.' };
  }

  // Content moderation
  const modStatus = await checkContentModerationStatus(input);

  if (modStatus.flagged) {
    return {
      valid: false,
      error: getModerationErrorMessage(modStatus.categories),
    };
  }

  return { valid: true };
}

/**
 * Log moderation decisions for monitoring
 */
export async function logModerationDecision(
  resultId: string,
  input: string,
  flagged: boolean,
  categories?: Record<string, boolean>
): Promise<void> {
  // Log to Vercel KV for tracking
  try {
    if (typeof process.env.KV_URL !== 'undefined') {
      const key = `moderation:${resultId}`;
      await fetch(process.env.KV_URL, {
        method: 'SET',
        body: JSON.stringify({
          key,
          value: {
            input: input.slice(0, 100), // Log first 100 chars only
            flagged,
            categories,
            timestamp: new Date().toISOString(),
          },
        }),
      });
    }
  } catch (error) {
    // Don't fail on logging errors
    console.warn('Failed to log moderation decision:', error);
  }
}
