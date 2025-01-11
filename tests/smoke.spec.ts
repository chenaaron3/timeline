import { expect, Page, test } from '@playwright/test';

const testDeckSeed = 1;
const testDeckSize = 5;
const testDeckName = "world_history";

test("has title", async ({ page }) => {
  await page.goto("http://localhost:3000");
  const title = await page.title();
  expect(title).toBe("TimeShift");
});

async function dragCard(
  page: Page,
  source: string,
  target: string,
  offset: { x: number; y: number },
) {
  const activeCard = page.getByText(source);
  const playedCard = page.getByText(target);
  const activeBB = await activeCard.boundingBox();
  const playedBB = await playedCard.boundingBox();
  if (!activeBB || !playedBB) {
    throw new Error("No bounding box!");
  }
  // Move active card to the left
  await page.mouse.move(
    activeBB.x + activeBB.width / 2,
    activeBB.y + activeBB.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    playedBB.x + playedBB.width / 2 + offset.x,
    playedBB.y + playedBB.height / 2 + offset.y,
  );
  await page.mouse.up();
}

test.describe("board setup", () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto(
      `http://localhost:3000?seed=${testDeckSeed}&size=${testDeckSize}&name=${testDeckName}`,
    );
  });

  test("initial", async ({ page }) => {
    await page.waitForTimeout(500);
    // Scoreboard Items
    const correct = page.locator("#score-correct > span");
    const incorrect = page.locator("#score-incorrect > span");
    const cardsLeft = page.locator("#cards-left > span");
    const timer = page.locator("#timer > span");
    await expect(correct).toHaveText("1");
    await expect(incorrect).toHaveText("0");
    await expect(cardsLeft).toHaveText([(testDeckSize - 1).toString()]);
    await expect(timer).toHaveText(["0", "0", ":", "0", "0"]);

    // Playing Field
    await expect(page.getByText("Before?")).toBeVisible();
    await expect(page.getByText("After?")).toBeVisible();
    await expect(page.getByText("The First Crusade")).toBeVisible();
    await expect(
      page.getByText("Gutenberg Invents Printing Press"),
    ).toBeVisible();
  });

  test("details", async ({ page }) => {
    // Drag First Crusade before Printing Press
    page.getByText("Gutenberg Invents Printing Press").click();
    // Modal shows up
    await expect(page.locator("#details-modal")).toBeVisible();
  });

  test("correct card", async ({ page }) => {
    // Drag First Crusade before Printing Press
    await dragCard(
      page,
      "The First Crusade",
      "Gutenberg Invents Printing Press",
      {
        x: -25,
        y: 0,
      },
    );
    // Next card shows up
    expect(page.getByText("Start of Slave Trade in Americas")).toBeVisible();
  });

  test("incorrect card", async ({ page }) => {
    // Drag First Crusade after Printing Press
    await dragCard(
      page,
      "The First Crusade",
      "Gutenberg Invents Printing Press",
      {
        x: 25,
        y: 0,
      },
    );
    // Next card should not show up
    await expect(
      page.getByText("Start of Slave Trade in Americas"),
    ).not.toBeVisible();
    await page.waitForTimeout(3000);
    // Modal shows up
    await expect(page.locator("#details-modal")).toBeVisible();
  });

  test("finish game", async ({ page }) => {
    // Drag First Crusade before Printing Press
    await dragCard(
      page,
      "The First Crusade",
      "Gutenberg Invents Printing Press",
      {
        x: -25,
        y: 0,
      },
    );
    await page.waitForTimeout(500);
    // Drag Slave Trade after Printing Press
    await dragCard(
      page,
      "Start of Slave Trade in Americas",
      "Gutenberg Invents Printing Press",
      {
        x: 25,
        y: 0,
      },
    );
    await page.waitForTimeout(500);
    // Drag Modern Calendar before First Crusade
    await dragCard(page, "Birth of the Modern Calendar", "The First Crusade", {
      x: -25,
      y: 0,
    });
    await page.waitForTimeout(500);
    // Drag WWI after Slave Trade
    await dragCard(
      page,
      "World War I Begins",
      "Start of Slave Trade in Americas",
      {
        x: 25,
        y: 0,
      },
    );
    await page.waitForTimeout(500);
    // Game finishes and restart
    const restart = page.getByText("Restart");
    await expect(restart).toBeVisible();
    await restart.click();
    // Game should have reset
    await expect(page.getByText("Before?")).toBeVisible();
    await expect(page.getByText("After?")).toBeVisible();
  });
});
