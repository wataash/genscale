// SPDX-FileCopyrightText: Copyright (c) 2026 Wataru Ashihara <wataash0607@gmail.com>
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from "vitest";

import {
  parseSettingsText,
  parseSettingsUrl,
  readableSettingsParam,
  settingsText,
} from "./settings";
import type { AppSettings } from "./types";

const settings: AppSettings = {
  key: "D",
  tuning: ["E4", "B3", "G3", "D3", "A2", "E2"],
  notes: [
    "1",
    "♭9",
    "...9",
    "♯9",
    "3",
    "...11",
    "♯11",
    "...5",
    "♭13",
    "...13",
    "♯13",
    "...Δ7",
  ],
  noteGrayLevels: [20, 40, 75, 100],
};

describe("settingsText", () => {
  test("serializes settings as pretty JSON without scale", () => {
    const text = settingsText(settings);
    const parsed = JSON.parse(text);

    expect(parsed).toEqual(settings);
    expect(parsed).not.toHaveProperty("scale");
    expect(text).toContain("\n  ");
  });
});

describe("readableSettingsParam", () => {
  test("keeps JSON readable while encoding query-breaking characters", () => {
    const param = readableSettingsParam(settings);

    expect(param).toContain('{"key":"D"');
    expect(param).toContain('"♭9"');
    expect(param).toContain('"♯11"');
    expect(param).not.toContain("%7B");
    expect(param).not.toContain("%22");
    expect(param).not.toContain("#");
  });
});

describe("parseSettingsText", () => {
  test("accepts valid settings JSON", () => {
    expect(parseSettingsText(JSON.stringify(settings))).toEqual(settings);
  });

  test("fills default note grayscale levels for legacy settings JSON", () => {
    const legacySettings: Omit<AppSettings, "noteGrayLevels"> = {
      key: settings.key,
      tuning: settings.tuning,
      notes: settings.notes,
    };

    expect(parseSettingsText(JSON.stringify(legacySettings))).toEqual(settings);
  });

  test("rejects invalid JSON, invalid keys, and incomplete settings", () => {
    expect(parseSettingsText("{")).toBeNull();
    expect(parseSettingsText(JSON.stringify({ ...settings, key: "H" }))).toBeNull();
    expect(parseSettingsText(JSON.stringify({ key: "A", notes: [] }))).toBeNull();
    expect(
      parseSettingsText(JSON.stringify({ ...settings, noteGrayLevels: [20, 40] })),
    ).toBeNull();
  });
});

describe("parseSettingsUrl", () => {
  test("reads settings from copied absolute and relative URLs", () => {
    const param = readableSettingsParam(settings);

    expect(
      parseSettingsUrl(
        `https://example.com/en?settings=${param}`,
        "https://example.com",
      ),
    ).toEqual(settings);
    expect(parseSettingsUrl(`/ja?settings=${param}`, "https://example.com")).toEqual(
      settings,
    );
  });

  test("rejects urls without valid settings", () => {
    expect(parseSettingsUrl("https://example.com/en", "https://example.com")).toBeNull();
    expect(
      parseSettingsUrl(
        "https://example.com/en?settings={",
        "https://example.com",
      ),
    ).toBeNull();
    expect(parseSettingsUrl("not a url", "://invalid")).toBeNull();
  });
});
