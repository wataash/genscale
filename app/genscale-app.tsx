// SPDX-FileCopyrightText: Copyright (c) 2026 Wataru Ashihara <wataash0607@gmail.com>
// SPDX-License-Identifier: Apache-2.0

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { buildFretboard, CANVAS } from "@/lib/genscale/fretboard";
import { TRANSLATIONS } from "@/lib/genscale/i18n";
import {
  ENHARMONICS,
  KEY_NAMES,
  DEFAULT_NOTE_GRAY_LEVELS,
  linesFromText,
  noteColors,
  NOTE_INDICES,
  parseLabels,
} from "@/lib/genscale/notes";
import {
  CUSTOM_SCALE,
  noteTokensText,
  SCALE_NAMES,
  scaleDisplayName,
  scaleFromNotes,
  scaleTokens,
} from "@/lib/genscale/scales";
import {
  parseSettingsText,
  readableSettingsParam,
  settingsText,
} from "@/lib/genscale/settings";
import { serializeSvg } from "@/lib/genscale/svg";
import {
  DEFAULT_TUNING,
  parseTuning,
  TUNING_PRESETS,
} from "@/lib/genscale/tuning";
import type { Locale, NoteTone } from "@/lib/genscale/types";

type GenscaleAppProps = {
  initialSettingsText?: string;
  locale: Locale;
};

type CopySettingsStatus = "idle" | "copying" | "copied" | "failed";

const NOTE_GRAY_CONTROLS: { label: string; tone: NoteTone }[] = [
  { label: "NOTE", tone: 0 },
  { label: ".NOTE", tone: 1 },
  { label: "..NOTE", tone: 2 },
  { label: "...NOTE", tone: 3 },
];

export default function GenscaleApp({
  initialSettingsText,
  locale,
}: GenscaleAppProps) {
  const t = TRANSLATIONS[locale];
  const initialSettings = initialSettingsText
    ? parseSettingsText(initialSettingsText)
    : null;
  const [key, setKey] = useState(initialSettings?.key ?? "A");
  const [scale, setScale] = useState(
    initialSettings ? scaleFromNotes(initialSettings.notes) : "m7",
  );
  const [tuning, setTuning] = useState(
    initialSettings?.tuning.join("\n") ?? DEFAULT_TUNING,
  );
  const [noteText, setNoteText] = useState(
    initialSettings?.notes.join("\n") ?? noteTokensText("m7"),
  );
  const [settingEditorText, setSettingEditorText] = useState(
    initialSettingsText ?? "",
  );
  const [settingValid, setSettingValid] = useState(
    initialSettingsText ? Boolean(initialSettings) : true,
  );
  const [copySettingsStatus, setCopySettingsStatus] =
    useState<CopySettingsStatus>("idle");
  const [noteGrayLevels, setNoteGrayLevels] = useState<number[]>([
    ...DEFAULT_NOTE_GRAY_LEVELS,
  ]);
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
  const currentSettings = {
    key,
    tuning: linesFromText(tuning),
    notes: linesFromText(noteText),
  };
  const currentSettingEditorText = settingsText(currentSettings);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (copySettingsStatus !== "copied" && copySettingsStatus !== "failed") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCopySettingsStatus("idle");
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [copySettingsStatus]);

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

  async function copySettingsUrl() {
    const settingsParam = readableSettingsParam(currentSettings);
    const url = `${window.location.origin}${window.location.pathname}?settings=${settingsParam}${window.location.hash}`;
    setCopySettingsStatus("copying");

    try {
      await navigator.clipboard.writeText(url);
      setCopySettingsStatus("copied");
    } catch {
      setCopySettingsStatus("failed");
    }
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

  function updateNoteGrayLevel(tone: NoteTone, value: string) {
    setNoteGrayLevels((current) =>
      current.map((level, index) => (index === tone ? Number(value) : level)),
    );
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
            <a
              aria-label="GitHub repository"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-[#c9bda9] bg-white text-[#24211d] transition hover:bg-[#eee8dc]"
              href="https://github.com/wataash/genscale"
              rel="noreferrer"
              target="_blank"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.41 7.86 10.93.58.1.79-.25.79-.56v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.16 1.18A10.9 10.9 0 0 1 12 6.06c.98 0 1.95.13 2.87.38 2.19-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.42.36.78 1.06.78 2.14v3.17c0 .31.21.67.79.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
              </svg>
            </a>
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

              <div className="grid gap-3 text-sm font-semibold">
                <span>{t.noteGrayLevels}</span>
                <div className="grid gap-3 md:grid-cols-2">
                  {NOTE_GRAY_CONTROLS.map(({ label, tone }) => {
                    const colors = noteColors(tone, noteGrayLevels);

                    return (
                      <label
                        key={label}
                        className="grid gap-2 rounded-md border border-[#d8d0c2] p-3"
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span>{label}</span>
                          <span className="flex items-center gap-2 font-mono text-xs text-[#5f584f]">
                            <span
                              aria-hidden="true"
                              className="h-5 w-5 rounded-full border"
                              style={{
                                backgroundColor: colors.fill,
                                borderColor: colors.stroke,
                              }}
                            />
                            {noteGrayLevels[tone]}%
                          </span>
                        </span>
                        <input
                          aria-label={t.noteGrayValue(label)}
                          className="w-full accent-[#2d4f47]"
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={noteGrayLevels[tone]}
                          onChange={(event) =>
                            updateNoteGrayLevel(tone, event.target.value)
                          }
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

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

              <button
                className={`inline-grid w-fit rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition active:translate-y-px active:scale-[0.99] ${
                  copySettingsStatus === "copied"
                    ? "bg-[#3f6b57] shadow-inner"
                    : copySettingsStatus === "failed"
                      ? "bg-[#7a4f00] shadow-inner"
                      : "bg-[#2d4f47] hover:bg-[#213d37]"
                }`}
                type="button"
                onClick={copySettingsUrl}
              >
                <span
                  aria-hidden="true"
                  className="col-start-1 row-start-1 invisible"
                >
                  {t.copySettingsUrl}
                </span>
                <span
                  aria-live="polite"
                  className="col-start-1 row-start-1 text-center"
                >
                  {copySettingsStatus === "copying"
                    ? t.copySettingsUrlCopying
                    : copySettingsStatus === "copied"
                      ? t.copySettingsUrlCopied
                      : copySettingsStatus === "failed"
                        ? t.copySettingsUrlFailed
                        : t.copySettingsUrl}
                </span>
              </button>
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
                    const colors = noteColors(note.tone, noteGrayLevels);
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
