// SPDX-FileCopyrightText: Copyright (c) 2026 Wataru Ashihara <wataash0607@gmail.com>
// SPDX-License-Identifier: Apache-2.0

import type { Locale } from "./types";

export const CUSTOM_SCALE = "custom";

const SCALE_DEFINITIONS = [
  [
    "M",
    { en: "Major", ja: "メジャー" },
    "1 ...♭9 ...9 ...♯9 ..3 ...11 ...♯11 .5 ...♭13 ...13 ...♭7 ...Δ7",
  ],
  [
    "6",
    { en: "6", ja: "6" },
    "1 ...♭9 ...9 ...♯9 ..3 ...11 ...♯11 .5 ...♭13 ..6 ...♭7 ...Δ7",
  ],
  [
    "69",
    { en: "69", ja: "69" },
    "1 ...♭9 ..9 ...♯9 ..3 ...11 ...♯11 .5 ...♭13 ..6 ...♭7 ...Δ7",
  ],
  [
    "7",
    { en: "7", ja: "7" },
    "1 ...♭9 ...9 ...♯9 ..3 ...11 ...♯11 .5 ...♭13 ...13 ..♭7 ...Δ7",
  ],
  [
    "M7",
    { en: "Δ7", ja: "Δ7" },
    "1 ...♭9 ...9 ...♯9 ..3 ...11 ...♯11 .5 ...♭13 ...13 ...♭7 ..Δ7",
  ],
  [
    "b9",
    { en: "♭9", ja: "♭9" },
    "1 ..♭9 ...9 ...♯9 ..3 ...11 ...♯11 .5 ...♭13 ...13 ..♭7 ...Δ7",
  ],
  [
    "9",
    { en: "9", ja: "9" },
    "1 ...♭9 ..9 ...♯9 ..3 ...11 ...♯11 .5 ...♭13 ...13 ..♭7 ...Δ7",
  ],
  [
    "M9",
    { en: "Δ9", ja: "Δ9" },
    "1 ...♭9 ..9 ...♯9 ..3 ...11 ...♯11 .5 ...♭13 ...13 ...♭7 ..Δ7",
  ],
  [
    "(9)",
    { en: "(9)", ja: "(9)" },
    "1 ...♭9 ..9 ...♯9 ..3 ...11 ...♯11 .5 ...♭13 ...13 ...♭7 ...Δ7",
  ],
  [
    "aug",
    { en: "aug", ja: "aug" },
    "1 ...♭9 ...9 ...♯9 ..3 ...11 ...♯11 ...5 ..♯5 ...13 ...♭7 ...Δ7",
  ],
  [
    "aug7",
    { en: "aug7 (7#5)", ja: "aug7 (7#5)" },
    "1 ...♭9 ...9 ...♯9 ..3 ...11 ...♯11 ...5 ..♯5 ...13 ..♭7 ...Δ7",
  ],
  [
    "augM7",
    { en: "augΔ7 (Δ7#5)", ja: "augΔ7 (Δ7#5)" },
    "1 ...♭9 ...9 ...♯9 ..3 ...11 ...♯11 ...5 ..♯5 ...13 ...♭7 ..Δ7",
  ],
  [
    "m",
    { en: "m", ja: "m" },
    "1 ...♭9 ...9 ..♭3 ...3 ...11 ...♯11 .5 ...♭13 ...13 ...♭7 ...Δ7",
  ],
  [
    "mb5",
    {
      en: "o (m♭5, Diminished Triad)",
      ja: "o (m♭5, ディミニッシュト・トライアド)",
    },
    "1 ...♭9 ...9 ..♭3 ...3 ...11 ..♭5 ...5 ...♭13 ...13 ...♭7 ...Δ7",
  ],
  [
    "m6",
    { en: "m6", ja: "m6" },
    "1 ...♭9 ...9 ..♭3 ...3 ...11 ...♯11 .5 ...♭13 ..6 ...♭7 ...Δ7",
  ],
  [
    "m7",
    { en: "m7", ja: "m7" },
    "1 ...♭9 ...9 ..♭3 ...3 ...11 ...♯11 .5 ...♭13 ...13 ..♭7 ...Δ7",
  ],
  [
    "mM7",
    { en: "mΔ7", ja: "mΔ7" },
    "1 ...♭9 ...9 ..♭3 ...3 ...11 ...♯11 .5 ...♭13 ...13 ...♭7 ..Δ7",
  ],
  [
    "m9",
    { en: "m9", ja: "m9" },
    "1 ...♭9 ..9 ..♭3 ...3 ...11 ...♯11 .5 ...♭13 ...13 ..♭7 ...Δ7",
  ],
  [
    "mM9",
    { en: "mΔ9", ja: "mΔ9" },
    "1 ...♭9 ..9 ..♭3 ...3 ...11 ...♯11 .5 ...♭13 ...13 ...♭7 ..Δ7",
  ],
  [
    "m(9)",
    { en: "m(9)", ja: "m(9)" },
    "1 ...♭9 ..9 ..♭3 ...3 ...11 ...♯11 .5 ...♭13 ...13 ...♭7 ...Δ7",
  ],
  [
    "hdim",
    {
      en: "ø7 (m7♭5, Half-Diminished Seventh)",
      ja: "ø7 (m7♭5, ハーフディミニッシュ)",
    },
    "1 ...♭9 ...9 ..♭3 ...3 ...11 ..♭5 ...5 ...♭13 ...13 ..♭7 ...Δ7",
  ],
  [
    "dim",
    { en: "o7 (Diminished)", ja: "o7 (ディミニッシュ)" },
    "1 ...♭9 ...9 ..♭3 ...3 ...11 ..♭5 ...5 ...♭13 ..𝄫7 ...♭7 ...Δ7",
  ],
  [
    "mP",
    { en: "Minor Pentatonic", ja: "マイナーペンタトニック" },
    "1 ...♭9 ...9 ..♭3 ...3 ..4 ...♭5 .5 ...♭13 ...13 ..♭7 ...Δ7",
  ],
  [
    "MP",
    { en: "Major Pentatonic", ja: "メジャーペンタトニック" },
    "1 ...♭9 ..9 ...♯9 ..3 ...11 ...♯11 .5 ...♭13 ..13 ...♭7 ...Δ7",
  ],
  [
    "hp5b",
    {
      en: "Phrygian Dominant (Harmonic Minor Perfect 5th Below, HP5↓)",
      ja: "フリジアンドミナント (ハーモニックマイナーパーフェクト5thビロウ, HP5↓)",
    },
    "1 ..♭9 ...9 ...♯9 ..3 ..11 ...♯11 .5 ..♭13 ...13 ..♭7 ...Δ7",
  ],
  [
    "mel",
    { en: "Melodic Minor", ja: "メロディックマイナー" },
    "1 ...♭9 ..9 ..♭3 ...3 ..11 ...♯11 .5 ...♭13 ..13 ...♯13 ..Δ7",
  ],
  [
    "phrNat6",
    { en: "Phrygian ♮6 / Dorian b2", ja: "フリジアン♮6 / ドリアン♭2" },
    "1 ..♭9 ...9 ..♭3 ...3 ..11 ...♯11 .5 ...♭13 ..13 ..♭7 ...Δ7",
  ],
  [
    "lydAug",
    { en: "Lydian Augmented", ja: "リディアンオーギュメンテッド" },
    "1 ...♭9 ..9 ...♭3 ..3 ...11 ..♯11 ...5 ..♭13 ..13 ...♭7 ..Δ7",
  ],
  [
    "lyd7",
    { en: "Lydian Dominant", ja: "リディアンドミナント (リディアン♭7)" },
    "1 ...♭9 ..9 ...♯9 ..3 ...11 ..♯11 .5 ...♭13 ..13 ..♭7 ...Δ7",
  ],
  [
    "mixB6",
    { en: "Mixolydian b6", ja: "ミクソリディアン♭6" },
    "1 ...♭9 ..9 ...♭3 ..3 ..11 ...♯11 .5 ..♭13 ...13 ..♭7 ...Δ7",
  ],
  [
    "halfDimScale",
    { en: "Half-Diminished", ja: "ハーフディミニッシュ" },
    "1 ...♭9 ..9 ..♭3 ...3 ..11 ..♯11 ...5 ..♭13 ...13 ..♭7 ...Δ7",
  ],
  [
    "alt",
    { en: "Altered dominant", ja: "オルタード" },
    "1 ..♭9 ...9 ..♯9 ..3 ...11 ..♯11 ...5 ..♭13 ...13 ..♯13 ...Δ7",
  ],
  [
    "sloc",
    { en: "Super Locrian", ja: "スーパーロクリアン" },
    "1 ..♭9 ...9 ..♭3 ..♭11 ...11 ..♭5 ...5 ..♭13 ...13 ..♭7 ...Δ7",
  ],
  [
    "cdim",
    {
      en: "Half-Whole Diminished Scale",
      ja: "コンディミ (Half-Whole Diminished Scale, Combination of Diminished)",
    },
    "1 ..♭9 ...9 ..♯9 ..3 ...11 ..♯11 .5 ...♭13 ..13 ..♭7 ...Δ7",
  ],
] as const;

export const SCALE_NAMES = SCALE_DEFINITIONS.map(([id]) => id);

const SCALE_PRESETS: Record<string, string[]> = Object.fromEntries(
  SCALE_DEFINITIONS.map(([id, , notes]) => [id, notes.split(" ")]),
);

const SCALE_DISPLAY_NAMES: Record<
  string,
  Record<Locale, string>
> = Object.fromEntries(
  SCALE_DEFINITIONS.map(([id, displayName]) => [id, displayName]),
);

export function scaleTokens(scale: string): string[] {
  return SCALE_PRESETS[scale] ?? SCALE_PRESETS.m7;
}

export function scaleDisplayName(scale: string, locale: Locale): string {
  return SCALE_DISPLAY_NAMES[scale]?.[locale] ?? scale;
}

export function noteTokensText(scale: string): string {
  return scaleTokens(scale).join("\n");
}

function tokenListsEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((token, index) => token === b[index]);
}

function matchingScaleName(notes: string[]): string | null {
  return (
    SCALE_NAMES.find((name) => tokenListsEqual(notes, scaleTokens(name))) ??
    null
  );
}

export function scaleFromNotes(notes: string[]): string {
  return matchingScaleName(notes) ?? CUSTOM_SCALE;
}
