import { chromium } from "playwright";

const URL = "http://localhost:3001/w3kit";
const ROOT = process.cwd();

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: "networkidle" });

  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const step = 900;
  let y = 0;
  let i = 1;

  while (y < totalHeight) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(300);
    const pad = String(i).padStart(2, "0");
    await page.screenshot({ path: `${ROOT}/screenshot-scroll-${pad}.png` });
    console.log(`✓ screenshot-scroll-${pad}.png (y=${y}px — ${y + 900}px)`);
    y += step;
    i++;
  }

  await browser.close();
}

main();
