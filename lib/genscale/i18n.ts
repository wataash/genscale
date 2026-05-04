// SPDX-FileCopyrightText: Copyright (c) 2026 Wataru Ashihara <wataash0607@gmail.com>
// SPDX-License-Identifier: Apache-2.0

import type { Locale } from "./types";

export const TRANSLATIONS: Record<
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
    copySettingsUrl: string;
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
    copySettingsUrl: "Copy URL with this settings (experimental)",
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
    copySettingsUrl: "この設定のURLをコピー (experimental)",
    tokenError: "Notes は行区切りで12個にしてください。",
    tuningError: "チューニングは1行に1つ、音名とオクターブで指定してください。",
    settingError: "設定エディタには有効な genscale JSON を入力してください。",
    fretboardLabel: (key, scale) => `${key} ${scale} ギター指板スケール`,
    localeLabel: "言語",
  },
};
