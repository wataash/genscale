// SPDX-FileCopyrightText: Copyright (c) 2026 Wataru Ashihara <wataash0607@gmail.com>
// SPDX-License-Identifier: Apache-2.0

import type { Fretboard } from "./types";

export const CANVAS = {
  fretLabelFontSize: 14,
  nutW: 40,
  boardW: 1400,
  stringGap: 40,
  noteRadius: 13,
};

export function calcNormalizedFretPositions(fretCount: number): number[] {
  const positions = Array.from(
    { length: fretCount + 2 },
    (_, n) => 1 - 1 / 2 ** (n / 12),
  );
  const total = positions[positions.length - 1];
  return positions.map((p) => Number((p / total).toFixed(12)));
}

export function buildFretboard(openNoteIndices: number[]): Fretboard {
  return {
    normalizedFretPositions: calcNormalizedFretPositions(24),
    noteIndices: openNoteIndices.map((open) =>
      Array.from({ length: 25 }, (_, fret) => (open + fret) % 12),
    ),
  };
}
