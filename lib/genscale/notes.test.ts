// SPDX-FileCopyrightText: Copyright (c) 2026 Wataru Ashihara <wataash0607@gmail.com>
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from "vitest";

import { linesFromText, noteColors, parseLabels } from "./notes";

describe("parseLabels", () => {
  test("uses leading dots as tone levels and removes them from labels", () => {
    expect(parseLabels(["1", ".♭9", "..9", "..."])).toEqual([
      { text: "1", tone: 0 },
      { text: "♭9", tone: 1 },
      { text: "9", tone: 2 },
      { text: "", tone: 3 },
    ]);
  });

  test("caps tone levels at the white-circle level", () => {
    expect(parseLabels(["....♭13"])).toEqual([{ text: "♭13", tone: 3 }]);
  });
});

describe("noteColors", () => {
  test("maps tone levels to grayscale colors", () => {
    expect(noteColors(0)).toEqual({
      fill: "#333333",
      stroke: "#575757",
      text: "#f8f8f8",
    });
    expect(noteColors(3)).toEqual({
      fill: "#ffffff",
      stroke: "#a3a3a3",
      text: "#333333",
    });
  });

  test("maps custom tone grayscale levels to SVG colors", () => {
    expect(noteColors(1, [0, 50, 75, 100])).toEqual({
      fill: "#808080",
      stroke: "#242424",
      text: "#f8f8f8",
    });
    expect(noteColors(2, [0, 50, 75, 100])).toEqual({
      fill: "#bfbfbf",
      stroke: "#636363",
      text: "#333333",
    });
  });
});

describe("linesFromText", () => {
  test("splits line-separated text and ignores blank lines", () => {
    expect(linesFromText("  E4\n\nB3  \nG3\n")).toEqual(["E4", "B3", "G3"]);
  });
});
