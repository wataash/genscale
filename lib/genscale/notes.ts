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

export function noteColors(tone: NoteTone): {
  fill: string;
  stroke: string;
  text: string;
} {
  return [
    { fill: "#343434", stroke: "#575757", text: "#f8f8f8" },
    { fill: "#555555", stroke: "#6f6f6f", text: "#f8f8f8" },
    { fill: "#e4e4e4", stroke: "#9a9a9a", text: "#333333" },
    { fill: "#f8f8f8", stroke: "#9a9a9a", text: "#333333" },
  ][tone];
}

export function linesFromText(text: string): string[] {
  return text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
