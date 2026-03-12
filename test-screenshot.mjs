import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

// Screenshot our site
const page1 = await browser.newPage();
await page1.setViewport({ width: 1440, height: 900 });
await page1.goto('http://127.0.0.1:3847/alexmucci', { waitUntil: 'networkidle0', timeout: 15000 });
await page1.screenshot({ path: '/root/.openclaw/workspace/test-ours-top.png', fullPage: false });

// Scroll down a bit and screenshot
await page1.evaluate(() => window.scrollBy(0, 300));
await new Promise(r => setTimeout(r, 500));
await page1.screenshot({ path: '/root/.openclaw/workspace/test-ours-scroll1.png', fullPage: false });

// Scroll more
await page1.evaluate(() => window.scrollBy(0, 300));
await new Promise(r => setTimeout(r, 500));
await page1.screenshot({ path: '/root/.openclaw/workspace/test-ours-scroll2.png', fullPage: false });

// Screenshot LinkMe
const page2 = await browser.newPage();
await page2.setViewport({ width: 1440, height: 900 });
await page2.goto('https://link.me/lilyphillip_s', { waitUntil: 'networkidle0', timeout: 15000 });
await page2.screenshot({ path: '/root/.openclaw/workspace/test-linkme-top.png', fullPage: false });

await page2.evaluate(() => window.scrollBy(0, 300));
await new Promise(r => setTimeout(r, 500));
await page2.screenshot({ path: '/root/.openclaw/workspace/test-linkme-scroll1.png', fullPage: false });

await page2.evaluate(() => window.scrollBy(0, 300));
await new Promise(r => setTimeout(r, 500));
await page2.screenshot({ path: '/root/.openclaw/workspace/test-linkme-scroll2.png', fullPage: false });

await browser.close();
console.log('Done! Screenshots saved.');
