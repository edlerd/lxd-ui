import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { gotoURL } from "./navigate";

export type ServerSettingType = "checkbox" | "text" | "number" | "password";

export const visitServerSettings = async (page: Page) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("link", { name: "Settings", exact: true }).click();
};

export const updateCheckbox = async (settingRow: Locator) => {
  const checkbox = settingRow.locator(".p-checkbox__label");
  await checkbox.click();
};

export const removePassword = async (
  page: Page,
  settingRow: Locator,
  settingName: string,
) => {
  const removeButton = settingRow.getByRole("button", {
    name: "Remove",
    exact: true,
  });
  await removeButton.click();
  await page.waitForSelector(`text=Setting ${settingName} updated.`);
  await page.getByRole("button", { name: "Close notification" }).click();
  await validateSettingValue(settingRow, "not set");
};

export const updateSetting = async (
  page: Page,
  settingName: string,
  settingType: ServerSettingType,
  content: string,
) => {
  const settingRow = page.locator("css=tr", { hasText: settingName });
  await settingRow.getByRole("button").click();

  if (settingType === "checkbox") {
    await updateCheckbox(settingRow);
  } else {
    const settingInput = settingRow.locator(`css=input[type=${settingType}]`);
    await settingInput.fill(content);
  }
  await settingRow.getByRole("button", { name: "Save", exact: true }).click();
  await page.waitForSelector(`text=Setting ${settingName} updated.`);
  await page.getByRole("button", { name: "Close notification" }).click();
  await validateSettingValue(
    settingRow,
    settingType === "password" ? "set" : content,
  );
};

export const validateSettingValue = async (
  settingRow: Locator,
  value: string,
) => {
  const readModeValue = settingRow.locator(".readmode-value");
  await expect(readModeValue).toHaveText(value);
};

export const resetSetting = async (
  page: Page,
  settingName: string,
  settingType: ServerSettingType,
  defaultValue: string,
) => {
  const settingRow = page.locator("css=tr", { hasText: settingName });
  await settingRow.getByRole("button").click();

  if (settingType === "password") {
    await removePassword(page, settingRow, settingName);
    return;
  }

  await settingRow
    .getByRole("button", { name: "Reset to default", exact: true })
    .click();
  await settingRow.getByRole("button", { name: "Save", exact: true }).click();
  await page.waitForSelector(`text=Setting ${settingName} updated.`);
  await page.getByRole("button", { name: "Close notification" }).click();
  await validateSettingValue(settingRow, defaultValue);
};

export const getServerSettingValue = async (
  page: Page,
  settingName: string,
) => {
  const settingRow = page.locator("css=tr", { hasText: settingName });
  const settingValueCell = settingRow.locator("css=.readmode-value");
  return settingValueCell.textContent();
};

export const openServerSetting = async (page: Page, setting: string) => {
  await page
    .locator("css=tr", { hasText: setting })
    .getByRole("button")
    .click();
};
