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
  inScale: boolean;
};

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

const TRANSLATIONS: Record<
  Locale,
  {
    exportSvg: string;
    key: string;
    scale: string;
    tuning: string;
    editLabels: string;
    notes: string;
    tokenError: string;
    tuningError: string;
    custom: string;
    fretboardLabel: (key: string, scale: string) => string;
    localeLabel: string;
  }
> = {
  en: {
    exportSvg: "Export SVG",
    key: "Key",
    scale: "Scale",
    tuning: "Tuning",
    editLabels: "Edit 12 note labels",
    notes: "Notes",
    tokenError: "Notes must contain exactly 12 line-separated tokens.",
    tuningError: "Tuning must contain one note with octave per line.",
    custom: "custom",
    fretboardLabel: (key, scale) => `${key} ${scale} guitar scale fretboard`,
    localeLabel: "Language",
  },
  ja: {
    exportSvg: "SVGを書き出し",
    key: "キー",
    scale: "スケール",
    tuning: "チューニング",
    editLabels: "12音ラベルを編集",
    notes: "Notes",
    tokenError: "Notes は行区切りで12個にしてください。",
    tuningError: "チューニングは1行に1つ、音名とオクターブで指定してください。",
    custom: "カスタム",
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
  M: "1 _♭9 _9 _♯9 3 _11 _♯11 5 _♭13 _13 _♭7 _Δ7".split(" "),
  "6": "1 _♭9 _9 _♯9 3 _11 _♯11 5 _♭13 6 _♭7 _Δ7".split(" "),
  "69": "1 _♭9 9 _♯9 3 _11 _♯11 5 _♭13 6 _♭7 _Δ7".split(" "),
  "7": "1 _♭9 _9 _♯9 3 _11 _♯11 5 _♭13 _13 ♭7 _Δ7".split(" "),
  M7: "1 _♭9 _9 _♯9 3 _11 _♯11 5 _♭13 _13 _♭7 Δ7".split(" "),
  b9: "1 ♭9 _9 _♯9 3 _11 _♯11 5 _♭13 _13 ♭7 _Δ7".split(" "),
  "9": "1 _♭9 9 _♯9 3 _11 _♯11 5 _♭13 _13 ♭7 _Δ7".split(" "),
  M9: "1 _♭9 9 _♯9 3 _11 _♯11 5 _♭13 _13 _♭7 Δ7".split(" "),
  "(9)": "1 _♭9 _9 _♯9 3 _11 _♯11 5 _♭13 _13 _♭7 _Δ7".split(" "),
  aug: "1 _♭9 _9 _♯9 3 _11 _♯11 _5 ♯5 _13 _♭7 _Δ7".split(" "),
  aug7: "1 _♭9 _9 _♯9 3 _11 _♯11 _5 ♯5 _13 ♭7 _Δ7".split(" "),
  augM7: "1 _♭9 _9 _♯9 3 _11 _♯11 _5 ♯5 _13 _♭7 Δ7".split(" "),
  m: "1 _♭9 _9 ♭3 _3 _11 _♯11 5 _♭13 _13 _♭7 _Δ7".split(" "),
  mb5: "1 _♭9 _9 ♭3 _3 _11 ♭5 _5 _♭13 _13 _♭7 _Δ7".split(" "),
  m6: "1 _♭9 _9 ♭3 _3 _11 _♯11 5 _♭13 6 _♭7 _Δ7".split(" "),
  m7: "1 _♭9 _9 ♭3 _3 _11 _♯11 5 _♭13 _13 ♭7 _Δ7".split(" "),
  mM7: "1 _♭9 _9 ♭3 _3 _11 _♯11 5 _♭13 _13 _♭7 Δ7".split(" "),
  m9: "1 _♭9 9 ♭3 _3 _11 _♯11 5 _♭13 _13 ♭7 _Δ7".split(" "),
  mM9: "1 _♭9 9 ♭3 _3 _11 _♯11 5 _♭13 _13 _♭7 Δ7".split(" "),
  "m(9)": "1 _♭9 9 ♭3 _3 _11 _♯11 5 _♭13 _13 _♭7 _Δ7".split(" "),
  hdim: "1 _♭9 _9 ♭3 _3 _11 ♭5 _5 _♭13 _13 ♭7 _Δ7".split(" "),
  dim: "1 _♭9 _9 ♭3 _3 _11 ♭5 _5 _♭13 𝄫7 _♭7 _Δ7".split(" "),
  mP: "1 _♭9 _9 ♭3 _3 4 _♭5 5 _♭13 _13 ♭7 _Δ7".split(" "),
  MP: "1 _♭9 9 _♯9 3 _11 _♯11 5 _♭13 13 _♭7 _Δ7".split(" "),
  hp5b: "1 ♭9 _9 _♯9 3 11 _♯11 5 ♭13 _13 ♭7 _Δ7".split(" "),
  lyd7: "1 _♭9 9 _♯9 3 _11 ♯11 5 _♭13 13 ♭7 _Δ7".split(" "),
  alt: "1 ♭9 _9 ♯9 3 _11 ♯11 _5 ♭13 _13 ♯13 _Δ7".split(" "),
  sloc: "1 ♭9 _9 ♭3 ♭11 _11 ♭5 _5 ♭13 _13 ♭7 _Δ7".split(" "),
  cdim: "1 ♭9 _9 ♯9 3 _11 ♯11 5 _♭13 13 ♭7 _Δ7".split(" "),
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
  return tokens.map((token) => ({
    text: token.startsWith("_") ? token.slice(1) : token,
    inScale: !token.startsWith("_"),
  }));
}

function scaleTokens(scale: string): string[] {
  return SCALE_PRESETS[SCALE_ALIASES[scale] ?? scale] ?? SCALE_PRESETS.m7;
}

function noteTokensText(scale: string): string {
  return scaleTokens(scale).join("\n");
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
  const [customMode, setCustomMode] = useState(false);
  const [customNotes, setCustomNotes] = useState(noteTokensText("m7"));
  const parsedTuning = useMemo(() => parseTuning(tuning), [tuning]);
  const board = useMemo(
    () => buildFretboard(parsedTuning.noteIndices),
    [parsedTuning.noteIndices],
  );
  const rootKey = NOTE_INDICES[ENHARMONICS[key]];
  const activeTokens = customMode
    ? customNotes
        .split(/\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    : scaleTokens(scale);
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
  const ySpread = stringYs[1] - stringYs[0] || CANVAS.stringGap;
  const tokenValid = activeTokens.length === 12;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function downloadSvg() {
    const source = serializeSvg(document.querySelector("#fretboard-svg"));
    const blob = new Blob([source], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `${key}-${customMode ? "custom" : scale}.svg`;
    link.click();
    URL.revokeObjectURL(href);
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
              <label className="grid gap-2 text-sm font-semibold">
                {t.key}
                <select
                  aria-label={t.key}
                  className="h-10 rounded-md border border-[#c9bda9] bg-white px-3 text-base"
                  value={key}
                  onChange={(event) => setKey(event.target.value)}
                >
                  {KEY_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                {t.scale}
                <select
                  aria-label={t.scale}
                  className="h-10 rounded-md border border-[#c9bda9] bg-white px-3 text-base disabled:bg-[#eee8dc]"
                  value={scale}
                  disabled={customMode}
                  onChange={(event) => {
                    setScale(event.target.value);
                    setCustomNotes(noteTokensText(event.target.value));
                  }}
                >
                  {SCALE_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                {t.tuning}
                <textarea
                  aria-label={t.tuning}
                  className="min-h-36 resize-y rounded-md border border-[#c9bda9] bg-white p-3 font-mono text-sm leading-6"
                  value={tuning}
                  spellCheck={false}
                  onChange={(event) => setTuning(event.target.value)}
                />
              </label>

              {!parsedTuning.valid ? (
                <p className="rounded-md bg-[#fff4df] px-3 py-2 text-sm text-[#7a4f00]">
                  {t.tuningError}
                </p>
              ) : null}

              <label className="flex items-center gap-3 text-sm font-semibold">
                <input
                  className="size-4 accent-[#2d4f47]"
                  type="checkbox"
                  checked={customMode}
                  onChange={(event) => setCustomMode(event.target.checked)}
                />
                {t.editLabels}
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                {t.notes}
                <textarea
                  className="min-h-72 resize-y rounded-md border border-[#c9bda9] bg-white p-3 font-mono text-sm leading-6 disabled:bg-[#eee8dc]"
                  value={customNotes}
                  disabled={!customMode}
                  spellCheck={false}
                  onChange={(event) => setCustomNotes(event.target.value)}
                />
              </label>

              {!tokenValid && customMode ? (
                <p className="rounded-md bg-[#fff4df] px-3 py-2 text-sm text-[#7a4f00]">
                  {t.tokenError}
                </p>
              ) : null}
            </div>
          </aside>

          <section className="order-1 overflow-hidden rounded-lg border border-[#d8d0c2] bg-white shadow-sm">
            <div className="overflow-x-auto p-4">
              <svg
                id="fretboard-svg"
                aria-label={t.fretboardLabel(key, customMode ? t.custom : scale)}
                className="block min-w-[980px]"
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
                  <circle
                    key={`inlay-${fret}`}
                    cx={(fretXs[fret - 1] + fretXs[fret]) / 2}
                    cy={yMid}
                    r="7"
                    fill="#7c8f85"
                  />
                ))}
                {[12, 24].flatMap((fret) => [
                  <circle
                    key={`inlay-${fret}-a`}
                    cx={(fretXs[fret - 1] + fretXs[fret]) / 2}
                    cy={yMid - ySpread}
                    r="7"
                    fill="#7c8f85"
                  />,
                  <circle
                    key={`inlay-${fret}-b`}
                    cx={(fretXs[fret - 1] + fretXs[fret]) / 2}
                    cy={yMid + ySpread}
                    r="7"
                    fill="#7c8f85"
                  />,
                ])}
                {board.noteIndices.map((stringNoteIndices, stringIndex) =>
                  stringNoteIndices.map((fretNoteIndex, noteIndex) => {
                    const offset = (fretNoteIndex - rootKey + 12) % 12;
                    const note = labels[offset];
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
                          fill={note.inScale ? "#2d4f47" : "#ece7dc"}
                        />
                        {note.text ? (
                          <text
                            x={cx}
                            y={cy + 4}
                            textAnchor="middle"
                            fill={note.inScale ? "#ffffff" : "#736b60"}
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
