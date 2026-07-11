// ──────────────────────────────────────────────
// Conversation: Transcript Sanitizers
// ──────────────────────────────────────────────

const DATE_TAG_RE = /<\/?date(?:="[^"]*")?>/gi;
const CLOCK_TOKEN = String.raw`\d{1,2}[:.]\d{2}(?:\s*(?:am|pm))?`;
const FULL_DATE_TOKEN = String.raw`\d{1,2}\.\d{1,2}\.\d{2,4}`;
const DATE_TIME_TOKEN = String.raw`\d{1,2}\.\d{1,2}(?:\.\d{2,4})?\s+${CLOCK_TOKEN}`;
const TIMESTAMP_TOKEN = String.raw`\[(?:${DATE_TIME_TOKEN}|${CLOCK_TOKEN}|${FULL_DATE_TOKEN})\]`;
const LEADING_TIMESTAMP_RE = new RegExp(`^(\\s*(?:[-*]\\s*)?)(?:${TIMESTAMP_TOKEN}\\s*)+`, "gim");
const SPEAKER_TIMESTAMP_RE = new RegExp(`^(\\s*(?:[-*]\\s*)?[^:\\n]{1,80}:\\s*)(?:${TIMESTAMP_TOKEN}\\s*)+`, "gim");

/**
 * Conversation mode adds prompt-only timestamps like [12:01] for DM time awareness.
 * Strip those when conversation text crosses into roleplay/game context.
 */
export function stripConversationPromptTimestamps(content: string): string {
  return content
    .replace(DATE_TAG_RE, "")
    .replace(LEADING_TIMESTAMP_RE, "$1")
    .replace(SPEAKER_TIMESTAMP_RE, "$1")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Remove model-leaked Conversation metadata before persistence. Merged group
 * replies keep their `Name:` boundaries because the client uses them to split
 * speakers; single and individual replies already have a server-owned speaker.
 */
export function stripConversationResponseEnvelope(
  content: string,
  options: { speakerName?: string | null; preserveSpeakerPrefix?: boolean } = {},
): string {
  let cleaned = stripConversationPromptTimestamps(content);
  const speakerName = options.speakerName?.trim();
  if (!speakerName || options.preserveSpeakerPrefix) return cleaned;

  const escapedName = speakerName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  cleaned = cleaned
    .replace(new RegExp(`^\\s*${escapedName}\\s*:\\s*`, "i"), "")
    .replace(new RegExp(`^\\s*${escapedName}\\s*\\n+`, "i"), "")
    .trim();
  return cleaned;
}
