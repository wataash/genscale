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

  await expect(page.getByLabel("Tuning")).toHaveValue(
    "E4\nB3\nG3\nD3\nA2\nE2",
  );
  await expect(page.locator('svg line[stroke="#a59c8f"]')).toHaveCount(6);

  await page.getByLabel("Tuning").fill("G3\nD3\nA2\nE2");

  await expect(page.locator('svg line[stroke="#a59c8f"]')).toHaveCount(4);
});

test("syncs the setting editor with the controls", async ({ page }) => {
  await page.goto("/en");

  const settingEditor = page.getByLabel("Setting editor");
  let settings = JSON.parse(await settingEditor.inputValue());
  expect(settings).toMatchObject({
    key: "A",
    scale: "m7",
    customMode: false,
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
        customMode: true,
        notes: ["1", "_", "_", "♭3", "_", "_", "_", "5", "_", "_", "♭7", "_"],
      },
      null,
      2,
    ),
  );

  await expect(page.getByRole("combobox", { name: "Key" })).toHaveValue("D");
  await expect(page.getByRole("combobox", { name: "Scale" })).toHaveValue("M7");
  await expect(page.getByLabel("Tuning")).toHaveValue("G3\nD3\nA2\nE2");
  await expect(page.getByLabel("Edit 12 note labels")).toBeChecked();
  await expect(page.getByLabel("Notes")).toHaveValue(
    "1\n_\n_\n♭3\n_\n_\n_\n5\n_\n_\n♭7\n_",
  );
  await expect(page.locator('svg line[stroke="#a59c8f"]')).toHaveCount(4);
  await expect(page.getByLabel("D custom guitar scale fretboard")).toBeVisible();
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

test("supports underscore tokens for out-of-scale and hidden labels", async ({
  page,
}) => {
  await page.goto("/en");

  await page.getByLabel("Edit 12 note labels").check();
  await expect(page.getByLabel("Notes")).toHaveValue(
    "1\n_♭9\n_9\n♭3\n_3\n_11\n_♯11\n5\n_♭13\n_13\n♭7\n_Δ7",
  );
  await page
    .getByLabel("Notes")
    .fill("1\n_\n_\n♭3\n_\n_\n_\n5\n_\n_\n♭7\n_");

  await expect(page.getByLabel("A custom guitar scale fretboard")).toBeVisible();
  await expect(page.locator("svg text").filter({ hasText: "♭9" })).toHaveCount(0);
});

test("renders Japanese UI at /ja", async ({ page }) => {
  await page.goto("/ja");

  await expect(page.getByRole("heading", { name: "genscale" })).toBeVisible();
  await expect(page.getByRole("button", { name: "SVGを書き出し" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "キー" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "スケール" })).toBeVisible();
  await expect(page.getByLabel("チューニング")).toBeVisible();
  await expect(page.getByLabel("設定エディタ")).toBeVisible();
  await expect(page.getByLabel("A Minor 7 ギター指板スケール")).toBeVisible();
});
