import { expect, test } from "@playwright/test";
import { createTodoViaUI, registerViaUI, uniqueEmail } from "./helpers";

test.describe("Full user journey", () => {
  test("register -> create todo -> toggle completion -> verify -> logout", async ({
    page,
  }) => {
    const email = uniqueEmail("journey");

    // Register/Login
    await registerViaUI(page, email);
    await expect(page.getByText(email)).toBeVisible();

    // Create a todo
    const title = `Buy groceries ${Date.now()}`;
    await createTodoViaUI(page, title, "Milk, eggs, bread");

    const todoRow = page.locator("div", { hasText: title }).filter({
      has: page.getByRole("checkbox"),
    });
    await expect(todoRow.first()).toBeVisible();

    // Toggle completion on
    const checkbox = todoRow.first().getByRole("checkbox");
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Verify item in UI: label gets the "completed" (line-through) style
    const label = page.getByText(title);
    await expect(label).toHaveClass(/line-through/);

    // Toggle back off, to also exercise the true -> false regression path
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();

    // Logout
    await page.getByRole("button", { name: "Logout" }).click();
    await page.waitForURL("/login");
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();

    // Session must actually be cleared: going back to "/" bounces to /login
    await page.goto("/");
    await page.waitForURL("/login");
  });
});
