import { test, expect } from "@playwright/test";
test("fixed-price buyer: offer, counter, payment and inspection", async ({
  page,
}) => {
  await page.goto("/#/listings/rolex");
  await page
    .getByRole("button", { name: "Make an offer", exact: true })
    .click();
  await page
    .getByRole("spinbutton", { name: "Your offer (AED)" })
    .fill("42000");
  await page.getByRole("button", { name: "Submit offer", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "AED 44,000", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Accept counteroffer", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Full name", exact: true })
    .fill("Demo Collector");
  await page
    .getByRole("textbox", { name: "Delivery address", exact: true })
    .fill("Sample Building, Demo Street");
  await page
    .getByRole("checkbox", {
      name: "I agree to the purchase terms and 48-hour inspection period.",
    })
    .check();
  await page
    .getByRole("button", {
      name: "Simulate secure payment · AED 44,810",
      exact: true,
    })
    .click();
  await page
    .getByRole("link", { name: "Track your collectible", exact: true })
    .click();
  for (let i = 0; i < 5; i++) {
    const next = page.getByRole("button", {
      name: "Simulate next update",
      exact: true,
    });
    await expect(next).toBeEnabled();
    await next.click();
    await expect(page.getByText("Up next", { exact: true })).toHaveCount(5 - i);
  }
  await page
    .getByRole("button", { name: "Everything looks good", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "A collectible, safely yours.",
      exact: true,
    }),
  ).toBeVisible();
});
test("auction: competing bid, anti-sniping and winner checkout", async ({
  page,
}) => {
  await page.goto("/#/auctions/charizard");
  await page
    .getByRole("button", { name: "Auto competitor: on", exact: true })
    .click();
  await page.getByRole("button", { name: "Place bid", exact: true }).click();
  await expect(
    page.getByText("Bid accepted. You are the highest bidder.", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Simulate competing bid", exact: true })
    .click();
  await expect(
    page.getByText("You have been outbid.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Jump to final 30 seconds", exact: true })
    .click();
  await expect(
    page.getByRole("spinbutton", { name: "Your bid (AED)" }),
  ).toHaveValue("26000");
  await page.getByRole("button", { name: "Place bid", exact: true }).click();
  await expect(page.getByText(/Auction extended to two minutes/)).toBeVisible();
  await page
    .getByRole("button", { name: "Close auction now", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Complete auction purchase", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Complete your purchase.", exact: true }),
  ).toBeVisible();
});
test("seller: dynamic schema, media, valuation and submission", async ({
  page,
}) => {
  await page.goto("/#/sell");
  await page.getByRole("button", { name: /Trading card Franchise/ }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Card name", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Reference", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Use sample details", exact: true })
    .click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Private certificate number", exact: true })
    .fill("DEMO1234");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Use demo image", exact: true })
    .click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "A clearer picture of value.",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Submit listing", exact: true })
    .click();
  await expect(
    page.getByText(
      "Listing submitted. It is visible in your studio while verification is pending.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByText("Review pending", { exact: true })).toBeVisible();
});
