import { expect, test } from "@playwright/test";

test("obsolete GitHub checks abort and cannot replace the latest name", async ({ page }) => {
  let releaseOld!: () => void;
  const oldReleased = new Promise<void>((resolve) => { releaseOld = resolve; });
  let oldRequests = 0;
  const aborted: string[] = [];
  page.on("requestfailed", (request) => {
    if (request.url().includes("/test-owner/older")) aborted.push(request.url());
  });
  await page.route("https://api.github.com/repos/**", async (route) => {
    const old = route.request().url().includes("/test-owner/older");
    if (old) {
      oldRequests++;
      await oldReleased;
    }
    const name = old ? "older" : "latest";
    await route.fulfill({ json: {
      name,
      full_name: `test-owner/${name}`,
      stargazers_count: 1000,
      license: { spdx_id: "MIT" },
      archived: false,
      private: false,
      created_at: "2020-01-01T00:00:00Z",
    } });
  });
  try {
    await page.goto("/submit");
    const repo = page.getByRole("textbox", { name: "GitHub repository" });
    const name = page.getByRole("textbox", { name: "Tool name" });
    await repo.fill("https://github.com/test-owner/older");
    await expect.poll(() => oldRequests).toBe(2);
    await expect(page.getByRole("status").filter({ hasText: "Checking against GitHub" })).toBeVisible();
    await repo.fill("https://github.com/test-owner/latest");
    await expect.poll(() => aborted.length).toBe(2);
    await expect(name).toHaveValue("latest");
    releaseOld();
    await expect(page.getByRole("status").filter({ hasText: "Meets the criteria" })).toBeVisible();
    await expect(name).toHaveValue("latest");
    await name.fill("My chosen name");
    await repo.fill("https://github.com/test-owner/another");
    await expect(page.getByRole("status").filter({ hasText: "Meets the criteria" })).toBeVisible();
    await expect(name).toHaveValue("My chosen name");
  } finally {
    releaseOld();
  }
});

test("pending retries preserve the label, unblock status and reset repeated errors", async ({ page }) => {
  let release!: () => void;
  let released = Promise.resolve();
  let submitting = false;
  await page.route("**/submit", async (route) => {
    if (route.request().method() === "POST") {
      submitting = true;
      await released;
    }
    await route.continue();
  });
  try {
    await page.goto("/submit");
    // Invalid syntax is rejected locally by the action, before any GitHub write or fetch.
    await page.getByRole("textbox", { name: "GitHub repository" }).fill("not-a-repository");
    await page.getByRole("textbox", { name: "Tool name" }).fill("Test tool");
    const [category] = await page.getByRole("combobox", { name: "Category" }).selectOption({ index: 1 });
    await page.getByRole("textbox", { name: "One-line description" }).fill("A test description");
    await page.getByRole("textbox", { name: "Replaces (optional)" }).fill("Example product");
    await page.getByRole("textbox", { name: "Why it can replace it" }).fill("A specific reason");
    const submit = page.getByRole("button", { name: "Submit for review", exact: true });
    const error = page.locator("form").getByRole("alert");
    for (let attempt = 0; attempt < 2; attempt++) {
      submitting = false;
      released = new Promise<void>((resolve) => { release = resolve; });
      await submit.click();
      await expect.poll(() => submitting).toBe(true);
      await expect(submit).toBeDisabled();
      await expect(submit).toHaveAttribute("aria-busy", "true");
      const status = page.getByRole("status").filter({ hasText: "Checking repository and submitting" });
      await expect(status).toBeVisible();
      await expect(status).not.toHaveAttribute("aria-busy", "true");
      await expect(status.locator('xpath=ancestor::*[@aria-busy="true"]')).toHaveCount(0);
      await expect(error).toBeEmpty();
      release();
      await expect(error).toContainText("Enter a GitHub repository");
      await expect(submit).toBeEnabled();
      await expect(submit).toHaveAttribute("aria-busy", "false");
      await expect(page.getByRole("combobox", { name: "Category" })).toHaveValue(category);
      await expect(page.getByRole("textbox", { name: "One-line description" })).toHaveValue("A test description");
      await expect(page.getByRole("textbox", { name: "Replaces (optional)" })).toHaveValue("Example product");
      await expect(page.getByRole("textbox", { name: "Why it can replace it" })).toHaveValue("A specific reason");
    }
  } finally {
    release?.();
  }
});
