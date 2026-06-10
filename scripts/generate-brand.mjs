/**
 * 브랜드 에셋 생성 스크립트 (1회성, 산출물은 커밋됨)
 *   node scripts/generate-brand.mjs
 *
 * 산출물:
 *   src/app/favicon.ico        (32+16 멀티사이즈)
 *   src/app/apple-icon.png     (180x180)
 *   src/app/opengraph-image.png (1200x630)
 *
 * 폰트는 Google Fonts css2의 text 서브셋(TTF)을 받아 satori에 주입한다.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import pngToIco from 'png-to-ico';

const ROOT = path.resolve(import.meta.dirname, '..');
const PAPER = '#f6f4ee';
const INK = '#1c1a15';
const INK_SOFT = '#5c574c';
const INK_FAINT = '#8a8478';
const VERMILION = '#d23b18';
const HAIRLINE = 'rgba(28,26,21,0.35)';

const WORDMARK = '세미콜론';
const TAGLINE = '한 줄의 끝에서, 같이 다음 줄을 쓴다';

// ── 폰트 서브셋 다운로드 (구형 UA → TTF 응답) ──────────────────
async function fetchSubsetFont(family, weight, text) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family,
  )}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (
    await fetch(cssUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1)' } })
  ).text();
  const m = css.match(/url\((https:[^)]+\.ttf)\)/) ?? css.match(/url\((https:[^)]+)\)/);
  if (!m) throw new Error(`폰트 URL 파싱 실패: ${family}\n${css.slice(0, 300)}`);
  const buf = await (await fetch(m[1])).arrayBuffer();
  return Buffer.from(buf);
}

// ── 마크(세미콜론) data URI ─────────────────────────────────────
async function markDataUri() {
  const svg = await readFile(path.join(ROOT, 'public', 'logo-mark.svg'), 'utf8');
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}

// ── OG 이미지 (1200x630) ───────────────────────────────────────
async function renderOg(fonts, mark) {
  const el = {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: PAPER,
        fontFamily: 'NotoSerifKR',
        position: 'relative',
      },
      children: [
        // 헤어라인 프레임
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 32,
              left: 32,
              right: 32,
              bottom: 32,
              border: `1px solid ${HAIRLINE}`,
              display: 'flex',
            },
          },
        },
        // 우측 거대 마크 (프레임에 일부 걸치게)
        {
          type: 'img',
          props: {
            src: mark,
            width: 340,
            height: 340,
            style: { position: 'absolute', right: 88, top: 145 },
          },
        },
        // 본문
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 70,
              left: 84,
              right: 84,
              bottom: 70,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            },
            children: [
              // 상단 모노 라벨
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontFamily: 'IBMPlexMono',
                    fontSize: 21,
                    letterSpacing: 6,
                    color: INK_SOFT,
                  },
                  children: [
                    { type: 'span', props: { children: 'SEMICOLLON — PROGRAMMING CLUB' } },
                    { type: 'span', props: { style: { color: VERMILION }, children: 'EST. 2026' } },
                  ],
                },
              },
              // 워드마크 + 태그라인
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'flex-start',
                          fontSize: 168,
                          fontWeight: 900,
                          color: INK,
                          lineHeight: 1,
                          letterSpacing: -4,
                        },
                        children: [
                          { type: 'span', props: { children: WORDMARK } },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontFamily: 'IBMPlexMono',
                                color: VERMILION,
                                fontSize: 150,
                                marginLeft: 6,
                              },
                              children: ';',
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          marginTop: 34,
                          fontSize: 36,
                          color: INK_SOFT,
                        },
                        children: TAGLINE,
                      },
                    },
                  ],
                },
              },
              // 하단 모노 라벨
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontFamily: 'IBMPlexMono',
                    fontSize: 19,
                    letterSpacing: 3,
                    color: INK_FAINT,
                  },
                  children: '// WE WRITE THE NEXT LINE TOGETHER',
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(el, { width: 1200, height: 630, fonts });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}

// ── 아이콘 래스터 ───────────────────────────────────────────────
async function renderIconPng(size) {
  const svg = await readFile(path.join(ROOT, 'src', 'app', 'icon.svg'), 'utf8');
  return new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
}

// ── main ───────────────────────────────────────────────────────
const subsetText = `${WORDMARK}${TAGLINE};`;
const [serif, mono] = await Promise.all([
  fetchSubsetFont('Noto Serif KR', 900, subsetText),
  fetchSubsetFont(
    'IBM Plex Mono',
    500,
    'SEMICOLN—PRGAMIBUT.206;/WHXLToenwritehgblua',
  ),
]);

const fonts = [
  { name: 'NotoSerifKR', data: serif, weight: 900, style: 'normal' },
  { name: 'IBMPlexMono', data: mono, weight: 500, style: 'normal' },
];

const og = await renderOg(fonts, await markDataUri());
await writeFile(path.join(ROOT, 'src', 'app', 'opengraph-image.png'), og);
console.log('opengraph-image.png ✓');

const apple = await renderIconPng(180);
await writeFile(path.join(ROOT, 'src', 'app', 'apple-icon.png'), apple);
console.log('apple-icon.png ✓');

const ico = await pngToIco([await renderIconPng(32), await renderIconPng(16)]);
await writeFile(path.join(ROOT, 'src', 'app', 'favicon.ico'), ico);
console.log('favicon.ico ✓');
