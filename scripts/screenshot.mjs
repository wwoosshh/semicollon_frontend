/**
 * 시각 검증용 스크린샷 (진단용, 산출물은 .gitignore 대상)
 *   node scripts/screenshot.mjs
 * 사전 조건: next start가 3100 포트에서 실행 중
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = 'http://localhost:3100';
const OUT = 'screenshots';
const PAGES = ['/', '/about', '/activities', '/posts', '/recruit', '/calendar', '/login', '/signup', '/recruit/apply'];
const VIEWPORTS = [
  { name: 'mobile', width: 360, height: 780 },
  { name: 'desktop', width: 1440, height: 900 },
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  // reducedMotion: 모션을 끄고 순수 레이아웃을 검증 (스크롤 구동 리빌의 캡처 아티팩트 제거)
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  for (const path of PAGES) {
    const slug = path === '/' ? 'home' : path.replace(/\//g, '_').replace(/^_/, '');
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1600); // 폰트·모션 안정화
    await page.screenshot({ path: `${OUT}/${vp.name}-${slug}.png`, fullPage: true });
    console.log(`${vp.name}-${slug}.png ✓`);
  }
  await ctx.close();
}

await browser.close();
