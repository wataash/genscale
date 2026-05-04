import { expect, test } from "@playwright/test";

test("renders the guitar scale board", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "ギター指板スケール生成" }),
  ).toBeVisible();
  await expect(
    page.getByLabel("A m7 guitar scale fretboard"),
  ).toBeVisible();
});

test("updates the fretboard label when key and scale change", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("combobox", { name: "Key" }).selectOption("C");
  await page.getByRole("combobox", { name: "Scale" }).selectOption("M7");

  await expect(
    page.getByLabel("C M7 guitar scale fretboard"),
  ).toBeVisible();
});
