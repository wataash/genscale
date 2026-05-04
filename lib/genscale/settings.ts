// SPDX-FileCopyrightText: Copyright (c) 2026 Wataru Ashihara <wataash0607@gmail.com>
// SPDX-License-Identifier: Apache-2.0

import { DEFAULT_NOTE_GRAY_LEVELS, ENHARMONICS } from "./notes";
import type { AppSettings } from "./types";

export function settingsText(settings: AppSettings): string {
  return JSON.stringify(settings, null, 2);
}

export function readableSettingsParam(settings: AppSettings): string {
  return JSON.stringify(settings).replace(
    /[%&#+\s]/g,
    (character) =>
      `%${character.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")}`,
  );
}

function readStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return null;
  }

  return value;
}

function readNoteGrayLevels(value: unknown): number[] | null {
  if (value === undefined) {
    return [...DEFAULT_NOTE_GRAY_LEVELS];
  }

  if (
    !Array.isArray(value) ||
    value.length !== DEFAULT_NOTE_GRAY_LEVELS.length ||
    value.some(
      (item) =>
        typeof item !== "number" ||
        !Number.isFinite(item) ||
        item < 0 ||
        item > 100,
    )
  ) {
    return null;
  }

  return value.map((item) => Math.round(item));
}

export function parseSettingsText(text: string): AppSettings | null {
  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value))
      return null;

    const settings = value as Partial<Record<keyof AppSettings, unknown>>;
    const tuning = readStringArray(settings.tuning);
    const notes = readStringArray(settings.notes);
    const noteGrayLevels = readNoteGrayLevels(settings.noteGrayLevels);

    if (typeof settings.key !== "string" || !tuning || !notes || !noteGrayLevels) {
      return null;
    }

    if (!ENHARMONICS[settings.key]) {
      return null;
    }

    return {
      key: settings.key,
      tuning,
      notes,
      noteGrayLevels,
    };
  } catch {
    return null;
  }
}
