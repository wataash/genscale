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
  scale: string;
  tuning: string[];
  notes: string[];
};

const TRANSLATIONS: Record<
  Locale,
  {
    exportSvg: string;
    key: string;
    scale: string;
    tuning: string;
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
    tuning: "Tuning",
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
    tuning: "チューニング",
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

const SCALE_PRESETS: Record<string, string[]> = {
  M: "1 ___♭9 ___9 ___♯9 3 ___11 ___♯11 5 ___♭13 ___13 ___♭7 ___Δ7".split(" "),
  "6": "1 ___♭9 ___9 ___♯9 3 ___11 ___♯11 5 ___♭13 6 ___♭7 ___Δ7".split(" "),
  "69": "1 ___♭9 9 ___♯9 3 ___11 ___♯11 5 ___♭13 6 ___♭7 ___Δ7".split(" "),
  "7": "1 ___♭9 ___9 ___♯9 3 ___11 ___♯11 5 ___♭13 ___13 ♭7 ___Δ7".split(" "),
  M7: "1 ___♭9 ___9 ___♯9 3 ___11 ___♯11 5 ___♭13 ___13 ___♭7 Δ7".split(" "),
  b9: "1 ♭9 ___9 ___♯9 3 ___11 ___♯11 5 ___♭13 ___13 ♭7 ___Δ7".split(" "),
  "9": "1 ___♭9 9 ___♯9 3 ___11 ___♯11 5 ___♭13 ___13 ♭7 ___Δ7".split(" "),
  M9: "1 ___♭9 9 ___♯9 3 ___11 ___♯11 5 ___♭13 ___13 ___♭7 Δ7".split(" "),
  "(9)": "1 ___♭9 ___9 ___♯9 3 ___11 ___♯11 5 ___♭13 ___13 ___♭7 ___Δ7".split(" "),
  aug: "1 ___♭9 ___9 ___♯9 3 ___11 ___♯11 ___5 ♯5 ___13 ___♭7 ___Δ7".split(" "),
  aug7: "1 ___♭9 ___9 ___♯9 3 ___11 ___♯11 ___5 ♯5 ___13 ♭7 ___Δ7".split(" "),
  augM7: "1 ___♭9 ___9 ___♯9 3 ___11 ___♯11 ___5 ♯5 ___13 ___♭7 Δ7".split(" "),
  m: "1 ___♭9 ___9 ♭3 ___3 ___11 ___♯11 5 ___♭13 ___13 ___♭7 ___Δ7".split(" "),
  mb5: "1 ___♭9 ___9 ♭3 ___3 ___11 ♭5 ___5 ___♭13 ___13 ___♭7 ___Δ7".split(" "),
  m6: "1 ___♭9 ___9 ♭3 ___3 ___11 ___♯11 5 ___♭13 6 ___♭7 ___Δ7".split(" "),
  m7: "1 ___♭9 ___9 ♭3 ___3 ___11 ___♯11 5 ___♭13 ___13 ♭7 ___Δ7".split(" "),
  mM7: "1 ___♭9 ___9 ♭3 ___3 ___11 ___♯11 5 ___♭13 ___13 ___♭7 Δ7".split(" "),
  m9: "1 ___♭9 9 ♭3 ___3 ___11 ___♯11 5 ___♭13 ___13 ♭7 ___Δ7".split(" "),
  mM9: "1 ___♭9 9 ♭3 ___3 ___11 ___♯11 5 ___♭13 ___13 ___♭7 Δ7".split(" "),
  "m(9)": "1 ___♭9 9 ♭3 ___3 ___11 ___♯11 5 ___♭13 ___13 ___♭7 ___Δ7".split(" "),
  hdim: "1 ___♭9 ___9 ♭3 ___3 ___11 ♭5 ___5 ___♭13 ___13 ♭7 ___Δ7".split(" "),
  dim: "1 ___♭9 ___9 ♭3 ___3 ___11 ♭5 ___5 ___♭13 𝄫7 ___♭7 ___Δ7".split(" "),
  mP: "1 ___♭9 ___9 ♭3 ___3 4 ___♭5 5 ___♭13 ___13 ♭7 ___Δ7".split(" "),
  MP: "1 ___♭9 9 ___♯9 3 ___11 ___♯11 5 ___♭13 13 ___♭7 ___Δ7".split(" "),
  hp5b: "1 ♭9 ___9 ___♯9 3 11 ___♯11 5 ♭13 ___13 ♭7 ___Δ7".split(" "),
  lyd7: "1 ___♭9 9 ___♯9 3 ___11 ♯11 5 ___♭13 13 ♭7 ___Δ7".split(" "),
  alt: "1 ♭9 ___9 ♯9 3 ___11 ♯11 ___5 ♭13 ___13 ♯13 ___Δ7".split(" "),
  sloc: "1 ♭9 ___9 ♭3 ♭11 ___11 ♭5 ___5 ♭13 ___13 ♭7 ___Δ7".split(" "),
  cdim: "1 ♭9 ___9 ♯9 3 ___11 ♯11 5 ___♭13 13 ♭7 ___Δ7".split(" "),
};

const SCALE_DISPLAY_NAMES: Record<string, string> = {
  M: "Major",
  "6": "Major 6",
  "69": "Major 6/9",
  "7": "Dominant 7",
  M7: "Major 7",
  b9: "Dominant 7 flat 9",
  "9": "Dominant 9",
  M9: "Major 9",
  "(9)": "Major add 9",
  aug: "Augmented",
  aug7: "Augmented 7",
  augM7: "Augmented Major 7",
  m: "Minor",
  mb5: "Minor flat 5",
  m6: "Minor 6",
  m7: "Minor 7",
  mM7: "Minor Major 7",
  m9: "Minor 9",
  mM9: "Minor Major 9",
  "m(9)": "Minor add 9",
  hdim: "Half-diminished",
  dim: "Diminished",
  mP: "Minor Pentatonic",
  MP: "Major Pentatonic",
  hp5b: "Harmonic Minor Perfect 5 Below",
  lyd7: "Lydian Dominant",
  alt: "Altered",
  sloc: "Super Locrian",
  cdim: "Combination Diminished",
};

const SCALE_ALIASES: Record<string, string> = {
  hp5: "hp5b",
  HP5: "hp5b",
  "hp5↓": "hp5b",
  "HP5↓": "hp5b",
  "maj 7": "M7",
  "Maj 7": "M7",
  maj7: "M7",
  Maj7: "M7",
  "major 7": "M7",
  "Major 7": "M7",
  "major pentatonic": "MP",
  "Major pentatonic": "MP",
  "Major Pentatonic": "MP",
  major7: "M7",
  Major7: "M7",
  "min 7": "m7",
  min7: "m7",
  "minor 7": "m7",
  "Minor 7": "m7",
  "minor pentatonic": "mP",
  "Minor pentatonic": "mP",
  "Minor Pentatonic": "mP",
  minor7: "m7",
  Minor7: "m7",
};

const SCALE_NAMES = Object.keys(SCALE_PRESETS);
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
    return { noteIndices: parseTuning(DEFAULT_TUNING).noteIndices, valid: false };
  }

  const noteIndices = notes.map((note) => {
    const match = /^([A-G](?:#|b)?)-?\d+$/.exec(note);
    if (!match) return null;

    const noteName = ENHARMONICS[match[1]];
    return noteName ? NOTE_INDICES[noteName] : null;
  });

  if (noteIndices.some((noteIndex) => noteIndex === null)) {
    return { noteIndices: parseTuning(DEFAULT_TUNING).noteIndices, valid: false };
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
    const prefixLength = token.match(/^_*/)?.[0].length ?? 0;
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
  return SCALE_PRESETS[SCALE_ALIASES[scale] ?? scale] ?? SCALE_PRESETS.m7;
}

function scaleDisplayName(scale: string): string {
  return SCALE_DISPLAY_NAMES[SCALE_ALIASES[scale] ?? scale] ?? scale;
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
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;

    const settings = value as Partial<Record<keyof AppSettings, unknown>>;
    const tuning = readStringArray(settings.tuning);
    const notes = readStringArray(settings.notes);

    if (
      typeof settings.key !== "string" ||
      typeof settings.scale !== "string" ||
      !tuning ||
      !notes
    ) {
      return null;
    }

    if (!ENHARMONICS[settings.key] || !SCALE_PRESETS[SCALE_ALIASES[settings.scale] ?? settings.scale]) {
      return null;
    }

    return {
      key: settings.key,
      scale: SCALE_ALIASES[settings.scale] ?? settings.scale,
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
  const stringYs = board.noteIndices.map((_, i) => labelH + CANVAS.stringGap * i);
  const yMid = (stringYs[0] + stringYs[stringYs.length - 1]) / 2;
  const tokenValid = activeTokens.length === 12;
  const inlayH = Math.max(34, Math.min(boardH * 0.42, 82));
  const inlayW = 8;
  const octaveInlayW = 13;
  const currentSettingEditorText = settingsText({
    key,
    scale,
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
    setScale(settings.scale);
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
                    {SCALE_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {scaleDisplayName(name)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="grid gap-2 text-sm font-semibold">
                {t.tuning}
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
              </label>

              {!parsedTuning.valid ? (
                <p className="rounded-md bg-[#fff4df] px-3 py-2 text-sm text-[#7a4f00]">
                  {t.tuningError}
                </p>
              ) : null}

              <label className="grid gap-2 text-sm font-semibold">
                {t.notes}
                <textarea
                  className="min-h-72 resize-y rounded-md border border-[#c9bda9] bg-white p-3 font-mono text-sm leading-6"
                  value={noteText}
                  spellCheck={false}
                  onChange={(event) => {
                    setNoteText(event.target.value);
                    setSettingValid(true);
                  }}
                />
              </label>

              {!tokenValid ? (
                <p className="rounded-md bg-[#fff4df] px-3 py-2 text-sm text-[#7a4f00]">
                  {t.tokenError}
                </p>
              ) : null}

              <label className="grid gap-2 text-sm font-semibold">
                {t.settingEditor}
                <textarea
                  aria-label={t.settingEditor}
                  className="min-h-72 resize-y rounded-md border border-[#c9bda9] bg-white p-3 font-mono text-sm leading-6"
                  value={settingValid ? currentSettingEditorText : settingEditorText}
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
                aria-label={t.fretboardLabel(key, scaleDisplayName(scale))}
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
                    stroke={fretIndex === 12 || fretIndex === 24 ? "#5f6f67" : "#b7ad9d"}
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
                    y={yMid - inlayH / 2}
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
                    y={yMid - inlayH / 2}
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
