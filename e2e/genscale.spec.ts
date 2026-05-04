// SPDX-FileCopyrightText: Copyright (c) 2026 Wataru Ashihara <wataash0607@gmail.com>
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from "@playwright/test";

test("renders the guitar scale board", async ({ page }) => {
  await page.goto("/en");

  await expect(
    page.getByRole("heading", { name: "genscale" }),
  ).toBeVisible();
  await expect(
    page.getByLabel("A Minor 7 guitar scale fretboard"),
  ).toBeVisible();
});

test("updates the fretboard label when key and scale change", async ({ page }) => {
  await page.goto("/en");

  await page.getByRole("combobox", { name: "Key" }).selectOption("C");
  await page.getByRole("combobox", { name: "Scale" }).selectOption("M7");

  await expect(
    page.getByLabel("C Major 7 guitar scale fretboard"),
  ).toBeVisible();
});

test("shows formal scale names while keeping compact scale identifiers", async ({
  page,
}) => {
  await page.goto("/en");

  const scaleSelect = page.getByRole("combobox", { name: "Scale" });
  await expect(scaleSelect.locator("option", { hasText: "Altered" })).toHaveAttribute(
    "value",
    "alt",
  );

  await scaleSelect.selectOption("alt");

  await expect(
    page.getByLabel("A Altered guitar scale fretboard"),
  ).toBeVisible();
  await expect(scaleSelect).toHaveValue("alt");
});

test("supports editable tuning and string count", async ({ page }) => {
  await page.goto("/en");

  const tuningPreset = page.getByRole("combobox", { name: "Preset" });
  await expect(tuningPreset).toHaveValue("guitar");
  await expect(page.getByLabel("Tuning")).toHaveValue(
    "E4\nB3\nG3\nD3\nA2\nE2",
  );
  await expect(page.locator('svg line[stroke="#a59c8f"]')).toHaveCount(6);

  await tuningPreset.selectOption("bass6");
  await expect(page.getByLabel("Tuning")).toHaveValue(
    "C3\nG2\nD2\nA1\nE1\nB1",
  );
  await expect(page.locator('svg line[stroke="#a59c8f"]')).toHaveCount(6);

  await page.getByLabel("Tuning").fill("G3\nD3\nA2\nE2");

  await expect(tuningPreset).toHaveValue("custom");
  await expect(page.locator('svg line[stroke="#a59c8f"]')).toHaveCount(4);
});

test("syncs the settings editor with the controls", async ({ page }) => {
  await page.goto("/en");

  const settingEditor = page.getByLabel("Settings editor");
  let settings = JSON.parse(await settingEditor.inputValue());
  expect(settings).toMatchObject({
    key: "A",
    scale: "m7",
  });
  expect(settings.tuning).toEqual(["E4", "B3", "G3", "D3", "A2", "E2"]);

  await page.getByRole("combobox", { name: "Key" }).selectOption("C");
  await page.getByRole("combobox", { name: "Scale" }).selectOption("alt");

  settings = JSON.parse(await settingEditor.inputValue());
  expect(settings).toMatchObject({
    key: "C",
    scale: "alt",
  });

  await settingEditor.fill(
    JSON.stringify(
      {
        key: "D",
        scale: "M7",
        tuning: ["G3", "D3", "A2", "E2"],
        notes: [
          "1",
          "...",
          "...",
          "♭3",
          "...",
          "...",
          "...",
          "5",
          "...",
          "...",
          "♭7",
          "...",
        ],
      },
      null,
      2,
    ),
  );

  await expect(page.getByRole("combobox", { name: "Key" })).toHaveValue("D");
  await expect(page.getByRole("combobox", { name: "Scale" })).toHaveValue("M7");
  await expect(page.getByLabel("Tuning")).toHaveValue("G3\nD3\nA2\nE2");
  await expect(page.getByLabel("Notes")).toHaveValue(
    "1\n...\n...\n♭3\n...\n...\n...\n5\n...\n...\n♭7\n...",
  );
  await expect(page.locator('svg line[stroke="#a59c8f"]')).toHaveCount(4);
  await expect(page.getByLabel("D Major 7 guitar scale fretboard")).toBeVisible();
});

test("keeps the fretboard above the controls at small and large widths", async ({
  page,
}) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/en");

    const fretboardBox = await page
      .getByLabel("A Minor 7 guitar scale fretboard")
      .boundingBox();
    const keyBox = await page
      .getByRole("combobox", { name: "Key" })
      .boundingBox();

    expect(fretboardBox).not.toBeNull();
    expect(keyBox).not.toBeNull();
    if (!fretboardBox || !keyBox) throw new Error("Missing layout element");

    expect(fretboardBox.y + fretboardBox.height).toBeLessThan(keyBox.y);
  }
});

test("renders a smaller fretboard on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");

  const fretboardBox = await page
    .getByLabel("A Minor 7 guitar scale fretboard")
    .boundingBox();

  expect(fretboardBox).not.toBeNull();
  if (!fretboardBox) throw new Error("Missing fretboard");

  expect(fretboardBox.width).toBeLessThan(1100);
});

test("shows the 24th fret when the browser is wide enough", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/en");

  const label24Box = await page
    .locator("svg text")
    .filter({ hasText: /^24$/ })
    .first()
    .boundingBox();

  expect(label24Box).not.toBeNull();
  if (!label24Box) throw new Error("Missing 24th fret label");

  expect(label24Box.x + label24Box.width).toBeLessThanOrEqual(1600);
});

test("supports editable dot tokens for out-of-scale and hidden labels", async ({
  page,
}) => {
  await page.goto("/en");

  await expect(page.getByLabel("Notes")).toHaveValue(
    "1\n...♭9\n...9\n♭3\n...3\n...11\n...♯11\n5\n...♭13\n...13\n♭7\n...Δ7",
  );
  const notes = page.getByLabel("Notes");
  await notes.click();
  await notes.press("Control+A");
  await notes.press("Backspace");
  await expect(notes).toHaveValue("");
  await notes.fill("1\n...\n...\n♭3\n...\n...\n...\n5\n...\n...\n♭7\n...");

  await expect(notes).toHaveValue(
    "1\n...\n...\n♭3\n...\n...\n...\n5\n...\n...\n♭7\n...",
  );
  await expect(page.getByLabel("A Minor 7 guitar scale fretboard")).toBeVisible();
  await expect(page.locator("svg text").filter({ hasText: "♭9" })).toHaveCount(0);
});

test("renders Japanese UI at /ja", async ({ page }) => {
  await page.goto("/ja");

  await expect(page.getByRole("heading", { name: "genscale" })).toBeVisible();
  await expect(page.getByRole("button", { name: "SVGを書き出し" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "キー" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "スケール" })).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "プリセット" }),
  ).toBeVisible();
  await expect(page.getByLabel("チューニング")).toBeVisible();
  await expect(page.getByLabel("設定エディタ")).toBeVisible();
  await expect(page.getByLabel("A Minor 7 ギター指板スケール")).toBeVisible();
});
