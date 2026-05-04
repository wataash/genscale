// SPDX-FileCopyrightText: Copyright (c) 2026 Wataru Ashihara <wataash0607@gmail.com>
// SPDX-License-Identifier: Apache-2.0

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type NoteName =
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

type NoteLabel = {
  text: string;
  tone: NoteTone;
};

type NoteTone = 0 | 1 | 2 | 3;

type ParsedTuning = {
  noteIndices: number[];
  valid: boolean;
};

type Fretboard = {
  normalizedFretPositions: number[];
  noteIndices: number[][];
};

type Locale = "en" | "ja";

type GenscaleAppProps = {
  locale: Locale;
};

type AppSettings = {
  key: string;
  tuning: string[];
  notes: string[];
};

type TuningPreset = {
  id: string;
  labels: Record<Locale, string>;
  notes: string[];
};

const CUSTOM_SCALE = "custom";

const TRANSLATIONS: Record<
  Locale,
  {
    exportSvg: string;
    key: string;
    scale: string;
    customScale: string;
    tuning: string;
    tuningPreset: string;
    customTuning: string;
    notes: string;
    settingEditor: string;
    tokenError: string;
    tuningError: string;
    settingError: string;
    fretboardLabel: (key: string, scale: string) => string;
    localeLabel: string;
  }
> = {
  en: {
    exportSvg: "Export SVG",
    key: "Key",
    scale: "Scale",
    customScale: "Custom",
    tuning: "Tuning",
    tuningPreset: "Preset",
    customTuning: "Custom",
    notes: "Notes",
    settingEditor: "Settings editor",
    tokenError: "Notes must contain exactly 12 line-separated tokens.",
    tuningError: "Tuning must contain one note with octave per line.",
    settingError: "Settings editor must contain valid genscale JSON.",
    fretboardLabel: (key, scale) => `${key} ${scale} guitar scale fretboard`,
    localeLabel: "Language",
  },
  ja: {
    exportSvg: "SVGを書き出し",
    key: "キー",
    scale: "スケール",
    customScale: "カスタム",
    tuning: "チューニング",
    tuningPreset: "プリセット",
    customTuning: "カスタム",
    notes: "Notes",
    settingEditor: "設定エディタ",
    tokenError: "Notes は行区切りで12個にしてください。",
    tuningError: "チューニングは1行に1つ、音名とオクターブで指定してください。",
    settingError: "設定エディタには有効な genscale JSON を入力してください。",
    fretboardLabel: (key, scale) => `${key} ${scale} ギター指板スケール`,
    localeLabel: "言語",
  },
};

const DEFAULT_TUNING = ["E4", "B3", "G3", "D3", "A2", "E2"].join("\n");
const TUNING_PRESETS: TuningPreset[] = [
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
const NOTE_INDICES: Record<NoteName, number> = {
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
const ENHARMONICS: Record<string, NoteName> = {
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

const SCALE_DEFINITIONS = [
  [
    "M",
    { en: "Major", ja: "メジャー" },
    "1 ...♭9 ...9 ...♯9 3 ...11 ...♯11 5 ...♭13 ...13 ...♭7 ...Δ7",
  ],
  [
    "6",
    { en: "6", ja: "6" },
    "1 ...♭9 ...9 ...♯9 3 ...11 ...♯11 5 ...♭13 6 ...♭7 ...Δ7",
  ],
  [
    "69",
    { en: "69", ja: "69" },
    "1 ...♭9 9 ...♯9 3 ...11 ...♯11 5 ...♭13 6 ...♭7 ...Δ7",
  ],
  [
    "7",
    { en: "7", ja: "7" },
    "1 ...♭9 ...9 ...♯9 3 ...11 ...♯11 5 ...♭13 ...13 ♭7 ...Δ7",
  ],
  [
    "M7",
    { en: "Δ7", ja: "Δ7" },
    "1 ...♭9 ...9 ...♯9 3 ...11 ...♯11 5 ...♭13 ...13 ...♭7 Δ7",
  ],
  [
    "b9",
    { en: "♭9", ja: "♭9" },
    "1 ♭9 ...9 ...♯9 3 ...11 ...♯11 5 ...♭13 ...13 ♭7 ...Δ7",
  ],
  [
    "9",
    { en: "9", ja: "9" },
    "1 ...♭9 9 ...♯9 3 ...11 ...♯11 5 ...♭13 ...13 ♭7 ...Δ7",
  ],
  [
    "M9",
    { en: "Δ9", ja: "Δ9" },
    "1 ...♭9 9 ...♯9 3 ...11 ...♯11 5 ...♭13 ...13 ...♭7 Δ7",
  ],
  [
    "(9)",
    { en: "(9)", ja: "(9)" },
    "1 ...♭9 ...9 ...♯9 3 ...11 ...♯11 5 ...♭13 ...13 ...♭7 ...Δ7",
  ],
  [
    "aug",
    { en: "aug", ja: "aug" },
    "1 ...♭9 ...9 ...♯9 3 ...11 ...♯11 ...5 ♯5 ...13 ...♭7 ...Δ7",
  ],
  [
    "aug7",
    { en: "aug7 (7#5)", ja: "aug7 (7#5)" },
    "1 ...♭9 ...9 ...♯9 3 ...11 ...♯11 ...5 ♯5 ...13 ♭7 ...Δ7",
  ],
  [
    "augM7",
    { en: "augΔ7 (Δ7#5)", ja: "augΔ7 (Δ7#5)" },
    "1 ...♭9 ...9 ...♯9 3 ...11 ...♯11 ...5 ♯5 ...13 ...♭7 Δ7",
  ],
  [
    "m",
    { en: "m", ja: "m" },
    "1 ...♭9 ...9 ♭3 ...3 ...11 ...♯11 5 ...♭13 ...13 ...♭7 ...Δ7",
  ],
  [
    "mb5",
    {
      en: "o (m♭5, Diminished Triad)",
      ja: "o (m♭5, ディミニッシュト・トライアド)",
    },
    "1 ...♭9 ...9 ♭3 ...3 ...11 ♭5 ...5 ...♭13 ...13 ...♭7 ...Δ7",
  ],
  [
    "m6",
    { en: "m6", ja: "m6" },
    "1 ...♭9 ...9 ♭3 ...3 ...11 ...♯11 5 ...♭13 6 ...♭7 ...Δ7",
  ],
  [
    "m7",
    { en: "m7", ja: "m7" },
    "1 ...♭9 ...9 ♭3 ...3 ...11 ...♯11 5 ...♭13 ...13 ♭7 ...Δ7",
  ],
  [
    "mM7",
    { en: "mΔ7", ja: "mΔ7" },
    "1 ...♭9 ...9 ♭3 ...3 ...11 ...♯11 5 ...♭13 ...13 ...♭7 Δ7",
  ],
  [
    "m9",
    { en: "m9", ja: "m9" },
    "1 ...♭9 9 ♭3 ...3 ...11 ...♯11 5 ...♭13 ...13 ♭7 ...Δ7",
  ],
  [
    "mM9",
    { en: "mΔ9", ja: "mΔ9" },
    "1 ...♭9 9 ♭3 ...3 ...11 ...♯11 5 ...♭13 ...13 ...♭7 Δ7",
  ],
  [
    "m(9)",
    { en: "m(9)", ja: "m(9)" },
    "1 ...♭9 9 ♭3 ...3 ...11 ...♯11 5 ...♭13 ...13 ...♭7 ...Δ7",
  ],
  [
    "hdim",
    {
      en: "ø7 (m7♭5, Half-Diminished Seventh)",
      ja: "ø7 (m7♭5, ハーフディミニッシュ)",
    },
    "1 ...♭9 ...9 ♭3 ...3 ...11 ♭5 ...5 ...♭13 ...13 ♭7 ...Δ7",
  ],
  [
    "dim",
    { en: "o7 (Diminished)", ja: "o7 (ディミニッシュ)" },
    "1 ...♭9 ...9 ♭3 ...3 ...11 ♭5 ...5 ...♭13 𝄫7 ...♭7 ...Δ7",
  ],
  [
    "mP",
    { en: "Minor Pentatonic", ja: "マイナーペンタトニック" },
    "1 ...♭9 ...9 ♭3 ...3 4 ...♭5 5 ...♭13 ...13 ♭7 ...Δ7",
  ],
  [
    "MP",
    { en: "Major Pentatonic", ja: "メジャーペンタトニック" },
    "1 ...♭9 9 ...♯9 3 ...11 ...♯11 5 ...♭13 13 ...♭7 ...Δ7",
  ],
  [
    "hp5b",
    {
      en: "Phrygian Dominant (Harmonic Minor Perfect 5th Below, HP5↓)",
      ja: "フリジアンドミナント (ハーモニックマイナーパーフェクト5thビロウ, HP5↓)",
    },
    "1 ♭9 ...9 ...♯9 3 11 ...♯11 5 ♭13 ...13 ♭7 ...Δ7",
  ],
  [
    "lyd7",
    { en: "Lydian Dominant", ja: "リディアンドミナント (リディアン♭7)" },
    "1 ...♭9 9 ...♯9 3 ...11 ♯11 5 ...♭13 13 ♭7 ...Δ7",
  ],
  [
    "alt",
    { en: "Altered", ja: "オルタード" },
    "1 ♭9 ...9 ♯9 3 ...11 ♯11 ...5 ♭13 ...13 ♯13 ...Δ7",
  ],
  [
    "sloc",
    { en: "Super Locrian", ja: "スーパーロクリアン" },
    "1 ♭9 ...9 ♭3 ♭11 ...11 ♭5 ...5 ♭13 ...13 ♭7 ...Δ7",
  ],
  [
    "cdim",
    {
      en: "Half-Whole Diminished Scale",
      ja: "コンディミ (Half-Whole Diminished Scale, Combination of Diminished)",
    },
    "1 ♭9 ...9 ♯9 3 ...11 ♯11 5 ...♭13 13 ♭7 ...Δ7",
  ],
] as const;

const SCALE_NAMES = SCALE_DEFINITIONS.map(([id]) => id);
const SCALE_PRESETS: Record<string, string[]> = Object.fromEntries(
  SCALE_DEFINITIONS.map(([id, , notes]) => [id, notes.split(" ")]),
);
const SCALE_DISPLAY_NAMES: Record<
  string,
  Record<Locale, string>
> = Object.fromEntries(
  SCALE_DEFINITIONS.map(([id, displayName]) => [id, displayName]),
);
const KEY_NAMES = Object.keys(ENHARMONICS);
const CANVAS = {
  fretLabelFontSize: 14,
  nutW: 40,
  boardW: 1400,
  stringGap: 40,
  noteRadius: 13,
};

function calcNormalizedFretPositions(fretCount: number): number[] {
  const positions = Array.from(
    { length: fretCount + 2 },
    (_, n) => 1 - 1 / 2 ** (n / 12),
  );
  const total = positions[positions.length - 1];
  return positions.map((p) => Number((p / total).toFixed(12)));
}

function parseTuning(tuning: string): ParsedTuning {
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

function buildFretboard(openNoteIndices: number[]): Fretboard {
  return {
    normalizedFretPositions: calcNormalizedFretPositions(24),
    noteIndices: openNoteIndices.map((open) =>
      Array.from({ length: 25 }, (_, fret) => (open + fret) % 12),
    ),
  };
}

function parseLabels(tokens: string[]): NoteLabel[] {
  return tokens.map((token) => {
    const prefixLength = token.match(/^\.*/)?.[0].length ?? 0;
    const tone = Math.min(prefixLength, 3) as NoteTone;

    return {
      text: token.slice(prefixLength),
      tone,
    };
  });
}

function noteColors(tone: NoteTone): {
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

function scaleTokens(scale: string): string[] {
  return SCALE_PRESETS[scale] ?? SCALE_PRESETS.m7;
}

function scaleDisplayName(scale: string, locale: Locale): string {
  return SCALE_DISPLAY_NAMES[scale]?.[locale] ?? scale;
}

function noteTokensText(scale: string): string {
  return scaleTokens(scale).join("\n");
}

function linesFromText(text: string): string[] {
  return text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
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

function scaleFromNotes(notes: string[]): string {
  return matchingScaleName(notes) ?? CUSTOM_SCALE;
}

function settingsText(settings: AppSettings): string {
  return JSON.stringify(settings, null, 2);
}

function readStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return null;
  }

  return value;
}

function parseSettingsText(text: string): AppSettings | null {
  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value))
      return null;

    const settings = value as Partial<Record<keyof AppSettings, unknown>>;
    const tuning = readStringArray(settings.tuning);
    const notes = readStringArray(settings.notes);

    if (typeof settings.key !== "string" || !tuning || !notes) {
      return null;
    }

    if (!ENHARMONICS[settings.key]) {
      return null;
    }

    return {
      key: settings.key,
      tuning,
      notes,
    };
  } catch {
    return null;
  }
}

function serializeSvg(svg: SVGSVGElement | null): string {
  if (!svg) return "";
  return new XMLSerializer().serializeToString(svg);
}

export default function GenscaleApp({ locale }: GenscaleAppProps) {
  const t = TRANSLATIONS[locale];
  const [key, setKey] = useState("A");
  const [scale, setScale] = useState("m7");
  const [tuning, setTuning] = useState(DEFAULT_TUNING);
  const [noteText, setNoteText] = useState(noteTokensText("m7"));
  const [settingEditorText, setSettingEditorText] = useState("");
  const [settingValid, setSettingValid] = useState(true);
  const parsedTuning = useMemo(() => parseTuning(tuning), [tuning]);
  const board = useMemo(
    () => buildFretboard(parsedTuning.noteIndices),
    [parsedTuning.noteIndices],
  );
  const rootKey = NOTE_INDICES[ENHARMONICS[key]];
  const activeTokens = linesFromText(noteText);
  const labels = parseLabels(
    activeTokens.length === 12 ? activeTokens : scaleTokens(scale),
  );

  const boardH = CANVAS.stringGap * (board.noteIndices.length - 1);
  const nutH = boardH + 30;
  const labelH = CANVAS.fretLabelFontSize + CANVAS.noteRadius;
  const canvasW = CANVAS.nutW + CANVAS.boardW;
  const canvasH = labelH + boardH + labelH;
  const fretXs = board.normalizedFretPositions.map(
    (x) => CANVAS.nutW + CANVAS.boardW * x,
  );
  const stringYs = board.noteIndices.map(
    (_, i) => labelH + CANVAS.stringGap * i,
  );
  const yMid = (stringYs[0] + stringYs[stringYs.length - 1]) / 2;
  const tokenValid = activeTokens.length === 12;
  const stringCount = stringYs.length;
  const inlayY =
    stringCount >= 3
      ? (stringYs[0] + stringYs[1]) / 2
      : yMid - (boardH * 0.8) / 2;
  const inlayH =
    stringCount >= 3
      ? (stringYs[stringCount - 2] + stringYs[stringCount - 1]) / 2 - inlayY
      : boardH * 0.8;
  const inlayW = 8;
  const octaveInlayW = 13;
  const tuningPresetId =
    TUNING_PRESETS.find((preset) => preset.notes.join("\n") === tuning)?.id ??
    "custom";
  const currentScaleDisplayName =
    scale === CUSTOM_SCALE ? t.customScale : scaleDisplayName(scale, locale);
  const currentSettingEditorText = settingsText({
    key,
    tuning: linesFromText(tuning),
    notes: linesFromText(noteText),
  });

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function downloadSvg() {
    const source = serializeSvg(document.querySelector("#fretboard-svg"));
    const blob = new Blob([source], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `${key}-${scale}.svg`;
    link.click();
    URL.revokeObjectURL(href);
  }

  function applySettingEditor(text: string) {
    setSettingEditorText(text);

    const settings = parseSettingsText(text);
    if (!settings) {
      setSettingValid(false);
      return;
    }

    setKey(settings.key);
    setScale(scaleFromNotes(settings.notes));
    setTuning(settings.tuning.join("\n"));
    setNoteText(settings.notes.join("\n"));
    setSettingValid(true);
  }

  return (
    <main className="min-h-screen bg-[#f6f3ed] text-[#262521]">
      <section className="mx-auto flex w-full flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-[#d8d0c2] pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-[#24211d] sm:text-4xl">
              genscale
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="h-10 rounded-md bg-[#2d4f47] px-4 text-sm font-semibold text-white transition hover:bg-[#213d37]"
              type="button"
              onClick={downloadSvg}
            >
              {t.exportSvg}
            </button>
            <nav
              aria-label={t.localeLabel}
              className="flex h-10 items-center rounded-md border border-[#c9bda9] bg-white p-1 text-sm font-semibold"
            >
              <Link
                aria-current={locale === "en" ? "page" : undefined}
                className={`rounded px-3 py-1.5 ${
                  locale === "en"
                    ? "bg-[#2d4f47] text-white"
                    : "text-[#4c463e] hover:bg-[#eee8dc]"
                }`}
                href="/en"
              >
                EN
              </Link>
              <Link
                aria-current={locale === "ja" ? "page" : undefined}
                className={`rounded px-3 py-1.5 ${
                  locale === "ja"
                    ? "bg-[#2d4f47] text-white"
                    : "text-[#4c463e] hover:bg-[#eee8dc]"
                }`}
                href="/ja"
              >
                JA
              </Link>
            </nav>
          </div>
        </header>

        <div className="grid gap-4">
          <aside className="order-2 rounded-lg border border-[#d8d0c2] bg-white p-4 shadow-sm">
            <div className="grid gap-4">
              <div className="grid gap-2 text-sm font-semibold">
                <span>
                  {t.key} / {t.scale}
                </span>
                <div className="grid gap-3 sm:grid-cols-[minmax(8rem,12rem)_minmax(14rem,1fr)]">
                  <select
                    aria-label={t.key}
                    className="h-10 rounded-md border border-[#c9bda9] bg-white px-3 text-base"
                    value={key}
                    onChange={(event) => {
                      setKey(event.target.value);
                      setSettingValid(true);
                    }}
                  >
                    {KEY_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label={t.scale}
                    className="h-10 rounded-md border border-[#c9bda9] bg-white px-3 text-base"
                    value={scale}
                    onChange={(event) => {
                      const nextNotes = scaleTokens(event.target.value);
                      setScale(event.target.value);
                      setNoteText(nextNotes.join("\n"));
                      setSettingValid(true);
                    }}
                  >
                    {scale === CUSTOM_SCALE ? (
                      <option value={CUSTOM_SCALE}>{t.customScale}</option>
                    ) : null}
                    {SCALE_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {scaleDisplayName(name, locale)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="grid gap-2 text-sm font-semibold">
                {t.notes}
                <textarea
                  className="min-h-72 resize-y rounded-md border border-[#c9bda9] bg-white p-3 font-mono text-sm leading-6"
                  value={noteText}
                  spellCheck={false}
                  onChange={(event) => {
                    const nextText = event.target.value;
                    setNoteText(nextText);
                    setScale(scaleFromNotes(linesFromText(nextText)));
                    setSettingValid(true);
                  }}
                />
              </label>

              {!tokenValid ? (
                <p className="rounded-md bg-[#fff4df] px-3 py-2 text-sm text-[#7a4f00]">
                  {t.tokenError}
                </p>
              ) : null}

              <div className="grid gap-2 text-sm font-semibold">
                <span>{t.tuning}</span>
                <select
                  aria-label={t.tuningPreset}
                  className="h-10 rounded-md border border-[#c9bda9] bg-white px-3 text-base"
                  value={tuningPresetId}
                  onChange={(event) => {
                    const preset = TUNING_PRESETS.find(
                      (item) => item.id === event.target.value,
                    );
                    if (!preset) return;
                    setTuning(preset.notes.join("\n"));
                    setSettingValid(true);
                  }}
                >
                  {tuningPresetId === "custom" ? (
                    <option value="custom">{t.customTuning}</option>
                  ) : null}
                  {TUNING_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.labels[locale]}
                    </option>
                  ))}
                </select>
                <textarea
                  aria-label={t.tuning}
                  className="min-h-36 resize-y rounded-md border border-[#c9bda9] bg-white p-3 font-mono text-sm leading-6"
                  value={tuning}
                  spellCheck={false}
                  onChange={(event) => {
                    setTuning(event.target.value);
                    setSettingValid(true);
                  }}
                />
              </div>

              {!parsedTuning.valid ? (
                <p className="rounded-md bg-[#fff4df] px-3 py-2 text-sm text-[#7a4f00]">
                  {t.tuningError}
                </p>
              ) : null}

              <label className="grid gap-2 text-sm font-semibold">
                {t.settingEditor}
                <textarea
                  aria-label={t.settingEditor}
                  className="min-h-72 resize-y rounded-md border border-[#c9bda9] bg-white p-3 font-mono text-sm leading-6"
                  value={
                    settingValid ? currentSettingEditorText : settingEditorText
                  }
                  spellCheck={false}
                  onChange={(event) => applySettingEditor(event.target.value)}
                />
              </label>

              {!settingValid ? (
                <p className="rounded-md bg-[#fff4df] px-3 py-2 text-sm text-[#7a4f00]">
                  {t.settingError}
                </p>
              ) : null}
            </div>
          </aside>

          <section className="order-1 overflow-hidden rounded-lg border border-[#d8d0c2] bg-white shadow-sm">
            <div className="overflow-x-auto p-4">
              <svg
                id="fretboard-svg"
                aria-label={t.fretboardLabel(key, currentScaleDisplayName)}
                className="block w-[1008px] max-w-none sm:w-[1440px]"
                width={canvasW}
                height={canvasH}
                viewBox={`0 0 ${canvasW} ${canvasH}`}
                xmlns="http://www.w3.org/2000/svg"
              >
                <style>{`text{font-family:Arial,sans-serif;}`}</style>
                <rect
                  x="0"
                  y={(stringYs[0] + stringYs[stringYs.length - 1] - nutH) / 2}
                  width={CANVAS.nutW}
                  height={nutH}
                  fill="#d6cec0"
                />
                {fretXs.slice(0, -1).map((x, fretIndex) => (
                  <line
                    key={`fret-${fretIndex}`}
                    x1={x}
                    y1={stringYs[0]}
                    x2={x}
                    y2={stringYs[stringYs.length - 1]}
                    stroke={
                      fretIndex === 12 || fretIndex === 24
                        ? "#5f6f67"
                        : "#b7ad9d"
                    }
                    strokeWidth={fretIndex === 12 || fretIndex === 24 ? 3 : 1}
                  />
                ))}
                {fretXs.slice(0, -1).map((x, fretIndex) => (
                  <g key={`fret-label-${fretIndex}`}>
                    <text
                      x={x}
                      y={labelH / 2 - CANVAS.noteRadius / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#948b7d"
                      fontSize={CANVAS.fretLabelFontSize}
                      fontWeight="600"
                    >
                      {fretIndex}
                    </text>
                    <text
                      x={x}
                      y={labelH + boardH + labelH / 2 + CANVAS.noteRadius / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#948b7d"
                      fontSize={CANVAS.fretLabelFontSize}
                      fontWeight="600"
                    >
                      {fretIndex}
                    </text>
                  </g>
                ))}
                {stringYs.map((y, stringIndex) => (
                  <line
                    key={`string-${stringIndex}`}
                    x1={fretXs[0]}
                    y1={y}
                    x2={fretXs[fretXs.length - 2]}
                    y2={y}
                    stroke="#a59c8f"
                    strokeWidth={1 + stringIndex * 0.25}
                  />
                ))}
                {[3, 5, 7, 9, 15, 17, 19, 21].map((fret) => (
                  <rect
                    key={`inlay-${fret}`}
                    x={(fretXs[fret - 1] + fretXs[fret]) / 2 - inlayW / 2}
                    y={inlayY}
                    width={inlayW}
                    height={inlayH}
                    rx="2"
                    fill="#7c8f85"
                  />
                ))}
                {[12, 24].map((fret) => (
                  <rect
                    key={`inlay-${fret}`}
                    x={(fretXs[fret - 1] + fretXs[fret]) / 2 - octaveInlayW / 2}
                    y={inlayY}
                    width={octaveInlayW}
                    height={inlayH}
                    rx="2"
                    fill="#7c8f85"
                  />
                ))}
                {board.noteIndices.map((stringNoteIndices, stringIndex) =>
                  stringNoteIndices.map((fretNoteIndex, noteIndex) => {
                    const offset = (fretNoteIndex - rootKey + 12) % 12;
                    const note = labels[offset];
                    const colors = noteColors(note.tone);
                    const cx =
                      noteIndex === 0
                        ? fretXs[0] - CANVAS.nutW / 2
                        : (fretXs[noteIndex - 1] + fretXs[noteIndex]) / 2;
                    const cy = stringYs[stringIndex];

                    return (
                      <g key={`note-${stringIndex}-${noteIndex}`}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={CANVAS.noteRadius}
                          fill={colors.fill}
                          stroke={colors.stroke}
                          strokeWidth="1.25"
                        />
                        {note.text ? (
                          <text
                            x={cx}
                            y={cy + 4}
                            textAnchor="middle"
                            fill={colors.text}
                            fontSize="16"
                            fontWeight="700"
                          >
                            {note.text}
                          </text>
                        ) : null}
                      </g>
                    );
                  }),
                )}
              </svg>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
