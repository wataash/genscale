// SPDX-FileCopyrightText: Copyright (c) 2026 Wataru Ashihara <wataash0607@gmail.com>
// SPDX-License-Identifier: Apache-2.0

export type Locale = "en" | "ja";

export type NoteName =
  | "A"
  | "A#"
  | "B"
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#";

export type NoteTone = 0 | 1 | 2 | 3;

export type NoteLabel = {
  text: string;
  tone: NoteTone;
};

export type ParsedTuning = {
  noteIndices: number[];
  valid: boolean;
};

export type Fretboard = {
  normalizedFretPositions: number[];
  noteIndices: number[][];
};

export type AppSettings = {
  key: string;
  tuning: string[];
  notes: string[];
};
