// ──────────────────────────────────────────────
// Speaker-segment parsing for merged multi-character conversation replies.
// A merged reply carries several characters' turns in one message, either as
// <speaker="Name">...</speaker> tags or as `Name: text` line prefixes. The client
// splits on these for the grouped display; the server splits on them to attribute
// reactions to the exact part they were aimed at. Shared so the two sides can
// never drift: a segment index stored by one is resolvable by the other.
// ──────────────────────────────────────────────
import { normalizeTextForMatch } from "./text-matching.js";

/** One parsed speaker turn: the speaker's name (null = narration) + its text. */
export interface SpeakerSegment {
  speaker: string | null;
  text: string;
}

/** Consecutive same-speaker segments merged into one display group. */
export interface GroupedSegment {
  speaker: string | null;
  lines: string[];
}

/**
 * Parse `<speaker="Name">...</speaker>` tagged segments. Returns null when the
 * content contains no complete tag (callers then fall back to the `Name: `
 * line-prefix format). Unknown speaker names become narration (null speaker);
 * `knownNames` holds normalizeTextForMatch()-normalized character names.
 */
export function parseSpeakerTags(content: string, knownNames: Set<string>): SpeakerSegment[] | null {
  const regex = /<speaker="([^"]*)">([\s\S]*?)<\/speaker>/g;
  let match: RegExpExecArray | null;
  const segments: SpeakerSegment[] = [];
  let lastIndex = 0;
  let foundTag = false;
  while ((match = regex.exec(content)) !== null) {
    foundTag = true;
    const speakerName = match[1]!.trim();
    const knownSpeaker = knownNames.has(normalizeTextForMatch(speakerName));
    if (match.index > lastIndex) {
      const before = content.slice(lastIndex, match.index).trim();
      if (before) segments.push({ speaker: null, text: before });
    }
    segments.push({ speaker: knownSpeaker ? speakerName : null, text: match[2]!.trim() });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    const after = content.slice(lastIndex).trim();
    if (after) segments.push({ speaker: null, text: after });
  }
  return foundTag ? segments : null;
}

/**
 * Parse `Name: text` line-prefixed segments (the fallback format when no speaker
 * tags are present). Returns null when no known name prefixes any line.
 * `knownNames` holds normalizeTextForMatch()-normalized character names.
 */
export function parseNamePrefixFormat(content: string, knownNames: Set<string>): SpeakerSegment[] | null {
  if (!knownNames.size) return null;
  const lines = content.split("\n");
  const segments: SpeakerSegment[] = [];
  let currentSpeaker: string | null = null;
  let currentLines: string[] = [];
  let found = false;
  for (const line of lines) {
    const colonIdx = line.indexOf(": ");
    if (colonIdx > 0) {
      const potentialName = line.slice(0, colonIdx).trim();
      if (knownNames.has(normalizeTextForMatch(potentialName))) {
        if (currentLines.length > 0) segments.push({ speaker: currentSpeaker, text: currentLines.join("\n") });
        currentSpeaker = potentialName;
        currentLines = [line.slice(colonIdx + 2)];
        found = true;
        continue;
      }
    }
    currentLines.push(line);
  }
  if (currentLines.length > 0) segments.push({ speaker: currentSpeaker, text: currentLines.join("\n") });
  if (!found) return null;
  return segments.filter((s) => s.text.trim());
}

/** Merge consecutive segments by the same speaker into one grouped segment. */
export function groupConsecutiveSegments(segments: SpeakerSegment[]): GroupedSegment[] {
  const groups: GroupedSegment[] = [];
  for (const seg of segments) {
    const last = groups[groups.length - 1];
    const trimmed = seg.text.replace(/^\n+|\n+$/g, "");
    if (
      last &&
      last.speaker &&
      seg.speaker &&
      normalizeTextForMatch(last.speaker) === normalizeTextForMatch(seg.speaker)
    ) {
      last.lines.push(trimmed);
    } else {
      groups.push({ speaker: seg.speaker, lines: [trimmed] });
    }
  }
  return groups;
}

/**
 * The full grouped-segment derivation for a message's content: complete speaker
 * tags win; the `Name: ` prefix format is only consulted when no tag exists;
 * null when the content has no recognizable speaker structure. This is the
 * canonical definition of "segment index N" — both the client's grouped layout
 * and the server's reaction attribution must derive indexes through it.
 */
export function parseGroupedSpeakerSegments(content: string, knownNames: Set<string>): GroupedSegment[] | null {
  const speakerSegs = parseSpeakerTags(content, knownNames);
  if (speakerSegs) return groupConsecutiveSegments(speakerSegs);
  const nameSegs = parseNamePrefixFormat(content, knownNames);
  if (nameSegs) return groupConsecutiveSegments(nameSegs);
  return null;
}
