// SPDX-FileCopyrightText: Copyright (c) 2026 Wataru Ashihara <wataash0607@gmail.com>
// SPDX-License-Identifier: Apache-2.0

import { ENHARMONICS, NOTE_INDICES } from "./notes";
import type { Locale, ParsedTuning } from "./types";

export type TuningPreset = {
  id: string;
  labels: Record<Locale, string>;
  notes: string[];
};

export const DEFAULT_TUNING = ["E4", "B3", "G3", "D3", "A2", "E2"].join(
  "\n",
);

export const TUNING_PRESETS: TuningPreset[] = [
  {
    id: "guitar",
    labels: { en: "Guitar", ja: "ギター" },
    notes: ["E4", "B3", "G3", "D3", "A2", "E2"],
  },
  {
    id: "bass",
    labels: { en: "Bass", ja: "ベース" },
    notes: ["G2", "D2", "A1", "E1"],
  },
  {
    id: "bass5",
    labels: { en: "5-string bass", ja: "5弦ベース" },
    notes: ["G2", "D2", "A1", "E1", "B1"],
  },
  {
    id: "bass6",
    labels: { en: "6-string bass", ja: "6弦ベース" },
    notes: ["C3", "G2", "D2", "A1", "E1", "B1"],
  },
  {
    id: "guitar7",
    labels: { en: "7-string guitar", ja: "7弦ギター" },
    notes: ["E4", "B3", "G3", "D3", "A2", "E2", "B2"],
  },
];

export function parseTuning(tuning: string): ParsedTuning {
  const notes = tuning
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (notes.length === 0) {
    return {
      noteIndices: parseTuning(DEFAULT_TUNING).noteIndices,
      valid: false,
    };
  }

  const noteIndices = notes.map((note) => {
    const match = /^([A-G](?:#|b)?)-?\d+$/.exec(note);
    if (!match) return null;

    const noteName = ENHARMONICS[match[1]];
    return noteName ? NOTE_INDICES[noteName] : null;
  });

  if (noteIndices.some((noteIndex) => noteIndex === null)) {
    return {
      noteIndices: parseTuning(DEFAULT_TUNING).noteIndices,
      valid: false,
    };
  }

  return { noteIndices: noteIndices as number[], valid: true };
}
