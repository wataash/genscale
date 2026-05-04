// SPDX-FileCopyrightText: Copyright (c) 2026 Wataru Ashihara <wataash0607@gmail.com>
// SPDX-License-Identifier: Apache-2.0

import type { NoteLabel, NoteName, NoteTone } from "./types";

export const NOTE_INDICES: Record<NoteName, number> = {
  A: 0,
  "A#": 1,
  B: 2,
  C: 3,
  "C#": 4,
  D: 5,
  "D#": 6,
  E: 7,
  F: 8,
  "F#": 9,
  G: 10,
  "G#": 11,
};

export const ENHARMONICS: Record<string, NoteName> = {
  Ab: "G#",
  A: "A",
  "A#": "A#",
  Bb: "A#",
  B: "B",
  "B#": "C",
  Cb: "B",
  C: "C",
  "C#": "C#",
  Db: "C#",
  D: "D",
  "D#": "D#",
  Eb: "D#",
  E: "E",
  "E#": "F",
  Fb: "E",
  F: "F",
  "F#": "F#",
  Gb: "F#",
  G: "G",
  "G#": "G#",
};

export const KEY_NAMES = Object.keys(ENHARMONICS);

export const DEFAULT_NOTE_GRAY_LEVELS = [20, 40, 75, 100] as const;

export function parseLabels(tokens: string[]): NoteLabel[] {
  return tokens.map((token) => {
    const prefixLength = token.match(/^\.*/)?.[0].length ?? 0;
    const tone = Math.min(prefixLength, 3) as NoteTone;

    return {
      text: token.slice(prefixLength),
      tone,
    };
  });
}

export function noteColors(
  tone: NoteTone,
  grayLevels: readonly number[] = DEFAULT_NOTE_GRAY_LEVELS,
): {
  fill: string;
  stroke: string;
  text: string;
} {
  if (usesDefaultNoteGrayLevels(grayLevels)) {
    return [
      { fill: "#333333", stroke: "#575757", text: "#f8f8f8" },
      { fill: "#666666", stroke: "#8a8a8a", text: "#f8f8f8" },
      { fill: "#bfbfbf", stroke: "#636363", text: "#333333" },
      { fill: "#ffffff", stroke: "#a3a3a3", text: "#333333" },
    ][tone];
  }

  const gray = clampGray(grayLevels[tone] ?? DEFAULT_NOTE_GRAY_LEVELS[tone]);
  const strokeGray = gray < 50 ? Math.min(gray + 14, 100) : Math.max(gray - 36, 0);
  const fill = grayHex(gray);

  return {
    fill,
    stroke: grayHex(strokeGray),
    text: gray < 62 ? "#f8f8f8" : "#333333",
  };
}

function clampGray(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function usesDefaultNoteGrayLevels(grayLevels: readonly number[]): boolean {
  return DEFAULT_NOTE_GRAY_LEVELS.every(
    (level, index) => grayLevels[index] === level,
  );
}

function grayHex(value: number): string {
  const channel = Math.round((clampGray(value) / 100) * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${channel}${channel}${channel}`;
}

export function linesFromText(text: string): string[] {
  return text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
