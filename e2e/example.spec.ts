import { expect, test } from "@playwright/test";

test("renders the guitar scale board", async ({ page }) => {
  await page.goto("/en");

  await expect(
    page.getByRole("heading", { name: "genscale" }),
  ).toBeVisible();
  await expect(
    page.getByLabel("A m7 guitar scale fretboard"),
  ).toBeVisible();
});

test("updates the fretboard label when key and scale change", async ({ page }) => {
  await page.goto("/en");

  await page.getByRole("combobox", { name: "Key" }).selectOption("C");
  await page.getByRole("combobox", { name: "Scale" }).selectOption("M7");

  await expect(
    page.getByLabel("C M7 guitar scale fretboard"),
  ).toBeVisible();
});

test("supports underscore tokens for out-of-scale and hidden labels", async ({
  page,
}) => {
  await page.goto("/en");

  await page.getByLabel("Edit 12 note labels").check();
  await page
    .getByLabel("Notes")
    .fill("1 _ _ ♭3 _ _ _ 5 _ _ ♭7 _");

  await expect(page.getByLabel("A custom guitar scale fretboard")).toBeVisible();
  await expect(page.locator("svg text").filter({ hasText: "♭9" })).toHaveCount(0);
});

test("renders Japanese UI at /ja", async ({ page }) => {
  await page.goto("/ja");

  await expect(page.getByRole("heading", { name: "genscale" })).toBeVisible();
  await expect(page.getByRole("button", { name: "SVGを書き出し" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "キー" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "スケール" })).toBeVisible();
  await expect(page.getByLabel("A m7 ギター指板スケール")).toBeVisible();
});
