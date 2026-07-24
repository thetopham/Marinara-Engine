import { existsSync, readFileSync } from "fs";
import { extname, join } from "path";
import { DATA_DIR } from "../../utils/data-dir.js";
import { assertInsideDir, isAllowedImageBuffer } from "../../utils/security.js";

type CharacterGalleryImageLike = {
  id: string;
  characterId: string;
  filePath: string;
};

export type CharacterGalleryReferenceStore = {
  getById: (id: string) => Promise<CharacterGalleryImageLike | null>;
};

export type CharacterVisualReferenceSource = "visual-reference" | "sprite" | "avatar";

export function selectCharacterVisualReference(args: {
  visualReference?: string;
  fullBodySprite?: string;
  avatar?: string;
}): { base64: string; source: CharacterVisualReferenceSource } | null {
  if (args.visualReference) return { base64: args.visualReference, source: "visual-reference" };
  if (args.fullBodySprite) return { base64: args.fullBodySprite, source: "sprite" };
  if (args.avatar) return { base64: args.avatar, source: "avatar" };
  return null;
}

function parseRecord(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function readCharacterVisualReferenceImageId(characterData: unknown): string | null {
  const data = parseRecord(characterData);
  const extensions = parseRecord(data.extensions);
  const imageId = extensions.visualReferenceImageId ?? extensions.characterSheetImageId;
  return typeof imageId === "string" && imageId.trim() ? imageId.trim() : null;
}

export async function readCharacterVisualReferenceBase64(args: {
  characterId: string;
  characterData: unknown;
  characterGallery: CharacterGalleryReferenceStore;
}): Promise<string | undefined> {
  const imageId = readCharacterVisualReferenceImageId(args.characterData);
  if (!imageId) return undefined;

  try {
    const image = await args.characterGallery.getById(imageId);
    if (!image || image.characterId !== args.characterId) return undefined;

    const galleryRoot = join(DATA_DIR, "gallery");
    const filePath = assertInsideDir(galleryRoot, join(galleryRoot, image.filePath));
    if (!existsSync(filePath)) return undefined;

    const buffer = readFileSync(filePath);
    if (!isAllowedImageBuffer(buffer, extname(filePath))) return undefined;
    return buffer.toString("base64");
  } catch {
    return undefined;
  }
}
