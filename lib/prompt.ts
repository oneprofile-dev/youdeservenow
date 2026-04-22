import type { Product } from "./products";
import { LANG_PROMPT_SUFFIX, type Lang } from "./i18n";

export type PromptVoice = "classic" | "warm";

function warmVoiceAppendix(): string {
  return `

WARM VOICE MODE (mandatory overrides to the RULES above):
- Use shorter, clearer sentences; avoid stacking jargon in a single sentence.
- Keep exactly one fictional study or institute name (not a list).
- Sound genuinely affirming—permission and pride—not mockery of the reader.
- The final line should read like benevolent encouragement ("You've earned this.") rather than aggressive commands ("protocol," "non-negotiable," "medically necessary").
- Still no emojis; still include one plausible-sounding fake statistic.
`;
}

function voiceSuffix(voice: PromptVoice): string {
  return voice === "warm" ? warmVoiceAppendix() : "";
}

export function buildGiftPrompt(
  input: string,
  product: Product,
  recipientName: string,
  lang: Lang = "en",
  voice: PromptVoice = "classic"
): string {
  const langSuffix = LANG_PROMPT_SUFFIX[lang] ? `\n\n${LANG_PROMPT_SUFFIX[lang]}` : "";
  const v = voiceSuffix(voice);
  return `You are the world's most prestigious (and entirely fictional) Institute for Deserved Rewards, Science Division.

${recipientName} accomplished something today: "${input}"

Based on this achievement, write a SHORT (3-4 sentences max) pseudo-scientific justification for why ${recipientName} absolutely MUST receive: ${product.name} (${product.price}) as a gift.

RULES:
- Address the gift-giver directly ("The data confirms your instinct…", "You are correct to feel this…")
- Invent a fake but realistic-sounding study, journal name, or institute
- Use scientific-sounding language but make it absurd and funny
- Include a fake specific statistic (e.g. "91.2% of recipients", "3.8x gratitude spike")
- The tone is DEADPAN and completely authoritative — you are a serious scientist confirming the gift is medically necessary
- End with a dramatic one-liner that reads like a doctor's co-signature: e.g. "This gift is not optional. It is protocol."
- Do NOT use emojis
- Do NOT break character — never wink at the joke
- Keep the entire response under 300 characters if possible (for tweet shareability)

EXAMPLE OUTPUT:
"Peer-reviewed data from the Cambridge Institute of Relational Gratitude confirms: ${recipientName}'s achievement places them in the 96th percentile of gift-worthiness. Your instinct to reward them is clinically sound. Delay would constitute a measurable act of scientific negligence. Proceed immediately."

Generate the justification now (3-4 sentences, deadpan, specific fake stat, dramatic final line):${v}${langSuffix}`;
}

/** Pair / household win — justification addresses "you two", "together", joint treat. */
export function buildSharedPrompt(
  userInput: string,
  product: Product,
  lang: Lang = "en",
  voice: PromptVoice = "classic"
): string {
  const langSuffix = LANG_PROMPT_SUFFIX[lang] ? `\n\n${LANG_PROMPT_SUFFIX[lang]}` : "";
  const v = voiceSuffix(voice);
  return `You are the world's most prestigious (and entirely fictional) Institute for Deserved Rewards, Science Division.

Together, these people accomplished something shared: "${userInput}"

Based on this joint achievement, write a SHORT (3-4 sentences max) pseudo-scientific justification for why they BOTH absolutely MUST reward themselves together with: ${product.name} (${product.price}) — one shared ritual, not two separate guilt trips.

RULES:
- Speak to "you two," "both of you," or "the household unit" — never single recipient only
- Invent a fake couples/teams study, journal name, or institute when appropriate
- Use scientific-sounding language but make it absurd and funny
- Include a fake specific statistic about pairs, solidarity, or joint deservingness (e.g. "dyadic reward affinity", "92.6% co-regulation spike")
- The tone is DEADPAN and completely authoritative — you are a serious scientist prescribing for two
- End with a dramatic one-liner that reads like a joint prescription co-signed for both
- Do NOT use emojis
- Do NOT break character — never wink at the joke
- Keep the entire response under 300 characters if possible (for tweet shareability)

Generate the justification now (3-4 sentences, deadpan, specific fake stat, dramatic final line):${v}${langSuffix}`;
}

export function buildPrompt(
  userInput: string,
  product: Product,
  lang: Lang = "en",
  voice: PromptVoice = "classic"
): string {
  const langSuffix = LANG_PROMPT_SUFFIX[lang] ? `\n\n${LANG_PROMPT_SUFFIX[lang]}` : "";
  const v = voiceSuffix(voice);
  return `You are the world's most prestigious (and entirely fictional) Institute for Deserved Rewards, Science Division.

The user accomplished something today: "${userInput}"

Based on this achievement, write a SHORT (3-4 sentences max) pseudo-scientific justification for why they absolutely MUST reward themselves with: ${product.name} (${product.price}).

RULES:
- Invent a fake but realistic-sounding study, journal name, or institute (e.g. "Journal of Post-Exertion Neurochemistry", "Stanford Center for Earned Gratification")
- Use scientific-sounding language but make it absurd and funny
- Include a fake specific statistic (e.g. "87.3% of participants", "4.2x increase")
- The tone is DEADPAN and completely authoritative — you are a serious scientist
- End with a dramatic one-liner that reads like a doctor's prescription
- Do NOT use emojis
- Do NOT break character — never wink at the joke
- Keep the entire response under 300 characters if possible (for tweet shareability)
- The product must feel like an inevitable scientific conclusion, not a suggestion

EXAMPLE OUTPUT:
"A 2024 study in the Journal of Corporate Endurance found that 92.7% of meeting survivors experience acute justification-for-comfort events. The recommended intervention? Immediate noise-canceling therapy. Your brain has earned silence. This is not optional."

Generate the justification now (3-4 sentences, deadpan, specific fake stat, dramatic final line):${v}${langSuffix}`;
}
