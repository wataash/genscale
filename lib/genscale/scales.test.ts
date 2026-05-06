// SPDX-FileCopyrightText: Copyright (c) 2026 Wataru Ashihara <wataash0607@gmail.com>
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from "vitest";

import {
  CUSTOM_SCALE,
  noteTokensText,
  scaleDisplayName,
  scaleFromNotes,
  SCALE_NAMES,
  scaleTokens,
} from "./scales";

describe("scale presets", () => {
  test("keeps the scale select order in definition order", () => {
    expect(SCALE_NAMES.slice(0, 6)).toEqual(["M", "6", "69", "7", "M7", "b9"]);
  });

  test("uses the dotted preset note visibility convention", () => {
    for (const scale of SCALE_NAMES) {
      for (const token of scaleTokens(scale)) {
        if (token === "1" || token.startsWith("...")) {
          continue;
        }

        const note = token.replace(/^\.+/, "");

        if (note === "5") {
          expect(token).toBe(".5");
          continue;
        }

        expect(token.startsWith("..")).toBe(true);
      }
    }
  });

  test("shows formal names while keeping compact identifiers", () => {
    expect(scaleDisplayName("alt", "en")).toBe("Altered dominant");
    expect(scaleDisplayName("alt", "ja")).toBe("オルタード");
    expect(scaleDisplayName("unknown", "en")).toBe("unknown");
  });

  test("round-trips a preset through line-separated note text", () => {
    const notes = noteTokensText("m7").split("\n");

    expect(notes).toEqual(scaleTokens("m7"));
    expect(scaleFromNotes(notes)).toBe("m7");
  });

  test("returns Custom for notes that do not match a preset exactly", () => {
    const notes = [...scaleTokens("m7")];
    notes[1] = ".♭9";

    expect(scaleFromNotes(notes)).toBe(CUSTOM_SCALE);
  });
});
