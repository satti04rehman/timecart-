/**
 * Generates premium SVG watch mockups for TimeCart.
 * Run: node scripts/generate-mockups.mjs
 * Outputs to public/images/{products,categories,brands,home}.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "public/images");
const P = resolve(OUT, "products");
const C = resolve(OUT, "categories");
const B = resolve(OUT, "brands");
const H = resolve(OUT, "home");

const TAU = Math.PI * 2;

// ---------- palette ----------
const INK = "#111111";
const IVORY = "#F7F5F0";
const CHAMPAGNE = "#C6A15B";
const GOLD = "#C6A15B";
const STEEL = "#9AA1AC";
const STEEL_DARK = "#5E6672";
const SILVER = "#C7CCD4";
const WHITE = "#F4F4F2";
const BLACK = "#181A1E";
const OLIVE_LCD = "#9FB49A";
const LCD_TEXT = "#B8D6B4";
const GRAY = "#6E6E6A";

const DIALS = {
  black: "#1C1E22",
  obsidian: "#22262E",
  silver: "#E4E6EA",
  white: "#F6F5F1",
  navy: "#26315A",
  blue: "#2F4278",
  royal: "#24418F",
  steel: "#A9B0BC",
  green: "#2E5A48",
  olive: "#4A5A3A",
  red: "#A03328",
  rose: "#B76E79",
  gold: "#C6A15B",
  champagne: "#CBA66B",
};

const STRAPS = {
  steel: ["#B9BFC9", "#858C99", "#C7CCD4"],
  rose: ["#D3A0A8", "#B76E79", "#E0B7BE"],
  gold: ["#D9B983", "#C6A15B", "#E3C89B"],
  leather_brown: ["#7A4E2D", "#5E3A1F", "#8C5C37"],
  leather_black: ["#2A2A2E", "#1B1B1E", "#38383D"],
  leather_tan: ["#A9743F", "#8C5C28", "#BF9158"],
  nato_blue: ["#2F4278", "#E2E2DE", "#22304F"],
  navy_nylon: ["#22304F", "#2F4278", "#1A2438"],
  olive_nylon: ["#5B5B3E", "#6E6E4C", "#4A4A32"],
  black_resin: ["#232326", "#17171A", "#2E2E32"],
  white_resin: ["#EAEAE6", "#D7D7D1", "#F6F6F2"],
  silicone_gray: ["#3A3A40", "#2B2B30", "#47474E"],
  pink_silicone: ["#E4A0A8", "#D27D88", "#EEB3BA"],
  fabric_olive: ["#4A5A3A", "#5d6b47", "#3C4930"],
};

const hexA = (hex, alpha) => {
  const v = hex.replace("#", "");
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// ---------- math helpers ----------
const pt = (cx, cy, r, angleDeg) => {
  const a = (angleDeg - 90) * (Math.PI / 180);
  return [cx + Math.cos(a) * r, cy + Math.sin(a) * r].map((n) => n.toFixed(2)).join(",");
};

function ticks(cx, cy, rIn, rOut, count, startDeg, endDeg, color, majorEvery = 5, majorW = 3, majorL = 0) {
  const parts = [];
  for (let i = 0; i <= count; i++) {
    const ang = startDeg + ((endDeg - startDeg) * i) / count;
    const isMajor = majorEvery > 0 && i % majorEvery === 0;
    const inner = isMajor && majorL ? rIn + majorL : rIn;
    const w = isMajor ? majorW : 1.6;
    parts.push(
      `<line x1="${pt(cx, cy, inner, ang).split(",")[0]}" y1="${pt(cx, cy, inner, ang).split(",")[1]}" x2="${pt(cx, cy, rOut, ang).split(",")[0]}" y2="${pt(cx, cy, rOut, ang).split(",")[1]}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`
    );
  }
  return parts.join("");
}

function fullTicks(cx, cy, rIn, rOut, color) {
  let out = "";
  for (let i = 0; i < 60; i++) {
    const isMajor = i % 5 === 0;
    const inner = isMajor ? rIn - 6 : rIn;
    const w = isMajor ? 3.4 : 1.6;
    out += `<line x1="${pt(cx, cy, inner, i * 6).split(",")[0]}" y1="${pt(cx, cy, inner, i * 6).split(",")[1]}" x2="${pt(cx, cy, rOut, i * 6).split(",")[0]}" y2="${pt(cx, cy, rOut, i * 6).split(",")[1]}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
  }
  return out;
}

function subdial(cx, cy, r, rIn, rOut, color, tickC) {
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="${hexA(INK, 0.12)}" stroke-width="1"/>
    ${ticks(cx, cy, rIn, rOut, 40, 0, 360, tickC)}
    <line x1="${cx}" y1="${cy}" x2="${pt(cx, cy, rOut * 0.72, 130).split(",")[0]}" y2="${pt(cx, cy, rOut * 0.72, 130).split(",")[1]}" stroke="${tickC}" stroke-width="2" stroke-linecap="round"/>`;
}

function hands(cx, cy, r, opts = {}) {
  const hr = (10 + 9.5 / 60) / 12;
  const min = 9.5 / 60;
  const sec = 36 / 60;
  const hA = hr * 360 - 90;
  const mA = min * 360 - 90;
  const sA = sec * 360 - 90;
  const hand = (len, angle, w, color, taper = 1) =>
    `<polygon points="${cx - w / 2},${cy} ${cx},${cy - len} ${cx + w / 2},${cy} ${cx + w / 22},${cy + (r * 0.09)} ${cx - w / 22},${cy + r * 0.09}" fill="${color}" transform="rotate(${angle} ${cx} ${cy})"/>`;
  return `
    ${hand(r * 0.5, hA, 11, opts.hourC ?? "#1A1A1A", opts.taper)}
    ${hand(r * 0.72, mA, 6.5, opts.minC ?? "#1A1A1A")}
    ${opts.showSec ? `<line x1="${cx}" y1="${cy}" x2="${pt(cx, cy, r, sA).split(",")[0]}" y2="${pt(cx, cy, r, sA).split(",")[1]}" stroke="${opts.secC ?? CHAMPAGNE}" stroke-width="2.4" stroke-linecap="round"/>` : ""}
    <circle cx="${cx}" cy="${cy}" r="6.5" fill="${opts.capC ?? "#222222"}"/>
    <circle cx="${cx}" cy="${cy}" r="2.6" fill="${opts.secC ?? CHAMPAGNE}"/>`;
}

function strapTop(x, fromY, toY, width, strap, stripes) {
  const s = STRAPS[strap] ?? STRAPS.steel;
  const h = Math.abs(fromY - toY);
  const stripesHtml = stripes
    ? (() => {
        const n = stripes.length;
        const sh = h / n;
        return stripes
          .map(
            (c, i) =>
              `<rect x="${x - width / 2}" y="${Math.min(fromY, toY) + i * sh}" width="${width}" height="${sh + 0.5}" fill="${c}"/>`
          )
          .join("");
      })()
    : "";
  return `
    <defs>
      <linearGradient id="straptop" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${s[0]}"/><stop offset="0.5" stop-color="${s[1]}"/><stop offset="1" stop-color="${s[2]}"/>
      </linearGradient>
    </defs>
    <rect x="${x - width / 2}" y="${Math.min(fromY, toY)}" width="${width}" height="${h}" rx="${width / 2.4}" fill="url(#straptop)"/>
    ${stripesHtml}
    <rect x="${x - width / 2 - 5}" y="${Math.min(fromY, toY)}" width="${width + 10}" height="${h}" rx="${width / 2.4}" fill="none" stroke="${hexA(INK, 0.18)}" stroke-width="2"/>
    ${Array.from({ length: 3 }).map((_, i) => `<line x1="${x - width / 2 + 16}" y1="${Math.min(fromY, toY) + h * (0.28 + i * 0.22)}" x2="${x + width / 2 - 16}" y2="${Math.min(fromY, toY) + h * (0.28 + i * 0.22)}" stroke="${hexA(INK, 0.14)}" stroke-width="1.4"/>`).join("")}
  `;
}

function strapBottom(x, fromY, toY, width, strap, stripes) {
  const s = STRAPS[strap] ?? STRAPS.steel;
  const h = Math.abs(fromY - toY);
  const stripesHtml = stripes
    ? (() => {
        const n = stripes.length;
        const sh = h / n;
        return stripes
          .map(
            (c, i) =>
              `<rect x="${x - width / 2}" y="${Math.min(fromY, toY) + i * sh}" width="${width}" height="${sh + 0.5}" fill="${c}"/>`
          )
          .join("");
      })()
    : "";
  return `
    <defs>
      <linearGradient id="strapbot" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${s[0]}"/><stop offset="0.5" stop-color="${s[1]}"/><stop offset="1" stop-color="${s[2]}"/>
      </linearGradient>
    </defs>
    <rect x="${x - width / 2}" y="${Math.min(fromY, toY)}" width="${width}" height="${h}" rx="${width / 2.4}" fill="url(#strapbot)"/>
    ${stripesHtml}
    <rect x="${x - width / 2 - 5}" y="${Math.min(fromY, toY)}" width="${width + 10}" height="${h}" rx="${width / 2.4}" fill="none" stroke="${hexA(INK, 0.16)}" stroke-width="2"/>
    ${Array.from({ length: 3 }).map((_, i) => `<line x1="${x - width / 2 + 16}" y1="${Math.min(fromY, toY) + h * (0.28 + i * 0.22)}" x2="${x + width / 2 - 16}" y2="${Math.min(fromY, toY) + h * (0.28 + i * 0.22)}" stroke="${hexA(INK, 0.14)}" stroke-width="1.4"/>`).join("")}
  `;
}

function brandText(cx, y, text, color, size = 13, spacing = 3.2) {
  return `<text x="${cx}" y="${y}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${size}" letter-spacing="${spacing}" fill="${color}" font-weight="600">${text}</text>`;
}

function modelText(cx, y, text, color, size = 9) {
  return `<text x="${cx}" y="${y}" text-anchor="middle" font-family="Verdana, sans-serif" font-size="${size}" letter-spacing="2" fill="${color}">${text}</text>`;
}

const DARK_DIALS = new Set([
  "black", "obsidian", "navy", "royal", "green", "olive", "red", "blue", "steel",
]);

const defaultTick = (dial) =>
  DARK_DIALS.has(dial) ? hexA(WHITE, 0.55) : hexA(INK, 0.4);

const defaultBrandColor = (dial) =>
  DARK_DIALS.has(dial) ? "rgba(255,255,255,0.9)" : hexA(INK, 0.82);

// ---------- watch builders ----------

function analogWatch(m, s) {
  const cx = s.cx ?? 400;
  const cy = s.cy ?? 378;
  const r = s.r ?? 150;
  const dial = m.dial;
  const tickC = m.tickC ?? defaultTick(dial);
  const brandColor = m.brandColor ?? defaultBrandColor(dial);
  const caseMetal =
    m.metal === "gold" || m.metal === "rose"
      ? ["#E0C08A", "#C6A15B", "#D9B983"]
      : ["#C9CED6", "#888F9B", "#D8DCE2"];
  const handC = m.darkHands ? "#1A1A1A" : "#202020";
  const stripes = m.strap === "nato_blue" || m.strap === "olive_nylon" ? ["#2F4278", "#E2E2DE", "#22304F"] : m.strap === "olive_nylon" ? ["#5B5B3E", "#E5E5DD", "#4A4A32"] : m.strap === "nato_blue" ? undefined : undefined;

  const date = m.date
    ? `<g transform="rotate(0 ${cx} ${cy})">
         <rect x="${cx + r * 0.62}" y="${cy - 12}" width="26" height="24" rx="4" fill="${m.dateC ?? WHITE}" stroke="${hexA(INK, 0.12)}" stroke-width="1"/>
         <text x="${cx + r * 0.62 + 13}" y="${cy + 4}" text-anchor="middle" font-family="Arial" font-size="12" font-weight="600" fill="#222">${m.dateNum ?? "31"}</text>
       </g>` 
    : "";

  return `
    <g>
      ${strapTop(cx, cy - r - 34, cy - r - 6, 116, m.strap, stripes)}
      ${strapBottom(cx, cy + r + 6, cy + r + 34, 116, m.strap, stripes)}
      <g>
        <circle cx="${cx}" cy="${cy}" r="${r + 10}" fill="${caseMetal[0]}"/>
        <circle cx="${cx}" cy="${cy}" r="${r + 10}" fill="none" stroke="${hexA(INK, 0.25)}" stroke-width="2"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#dialgrad)"/>
        <circle cx="${cx}" cy="${cy}" r="${r - 2}" fill="none" stroke="${hexA(INK, 0.08)}" stroke-width="1"/>
        ${m.innerRing ? `<circle cx="${cx}" cy="${cy}" r="${r * 0.78}" fill="none" stroke="${hexA(INK, 0.1)}" stroke-width="1"/>` : ""}
        ${fullTicks(cx, cy, r * 0.84, r * 0.94, tickC)}
        ${date}
        ${m.auto ? `<circle cx="${cx}" cy="${cy - r * 0.62}" r="9" fill="none" stroke="${hexA(CHAMPAGNE, 0.9)}" stroke-width="1.6"/>
          <path d="M ${cx - 6} ${cy - r * 0.62} l4 4 l5 -3" fill="none" stroke="${hexA(CHAMPAGNE, 0.9)}" stroke-width="1.3" stroke-linecap="round"/>` : ""}
        ${m.chrono ? `
          ${subdial(cx + r * 0.48 * Math.cos(Math.PI / 6), cy - r * 0.48 * Math.sin(Math.PI / 6), 30, 22, 27, "#EDEDEA", hexA(INK, 0.4))}
          ${subdial(cx - r * 0.48 * Math.cos(Math.PI / 6), cy - r * 0.48 * Math.sin(Math.PI / 6), 30, 22, 27, "#EDEDEA", hexA(INK, 0.4))}
          ${subdial(cx, cy + r * 0.48, 30, 22, 27, "#E4E6EA", hexA(INK, 0.4))}
          <circle cx="${cx - r * 0.16}" cy="${cy + r * 0.12}" r="2" fill="${hexA(INK, 0.35)}"/>
          <circle cx="${cx + r * 0.16}" cy="${cy + r * 0.12}" r="2" fill="${hexA(INK, 0.35)}"/>
        ` : ""}
        ${brandText(cx, cy - r * 0.52, m.brand, brandColor, m.brandSize ?? 13, m.brandSpacing ?? 3.2)}
        ${modelText(cx, cy + r * 0.66, m.model ?? "AUTOMATIC", m.modelColor ?? hexA(INK, 0.5))}
        ${hands(cx, cy, r, { hourC: handC, minC: handC, showSec: m.sec !== false, secC: m.secC ?? CHAMPAGNE, capC: "#222" })}
        <circle cx="${cx}" cy="${cy}" r="${r + 10}" fill="none" stroke="${hexA(WHITE, 0.35)}" stroke-width="1.5" stroke-dasharray="6 14"/>
      </g>
      <rect x="${cx + r + 8}" y="${cy - 20}" width="15" height="40" rx="5" fill="${caseMetal[1]}"/>
    </g>
  `;
}

function digitalWatch(m, s) {
  const cx = s.cx ?? 400;
  const cy = s.cy ?? 368;
  const w = s.dw ?? 210;
  const h = s.dh ?? 178;
  const caseC = m.caseC ?? "#1B1B1E";
  const lcd = m.lcd ?? "#0E241E";
  const txt = m.lcdText ?? "#B7D9B0";
  const straps = m.strap ?? "black_resin";
  const stripe = null;
  return `
    <g>
      ${strapTop(cx, cy - h / 2 - 46, cy - h / 2 + 10, 120, straps, stripe)}
      ${strapBottom(cx, cy + h / 2 - 10, cy + h / 2 + 46, 120, straps, stripe)}
      <g>
        <rect x="${cx - w / 2 - 8}" y="${cy - h / 2 - 8}" width="${w + 16}" height="${h + 16}" rx="${m.caseRx ?? 26}" fill="${caseC}"/>
        <rect x="${cx - w / 2 - 24}" y="${cy - h / 2 + 6}" width="16" height="34" rx="5" fill="${caseC}"/>
        <rect x="${cx + w / 2 + 8}" y="${cy - h / 2 + 6}" width="16" height="34" rx="5" fill="${caseC}"/>
        <rect x="${cx - w / 2 + 10}" y="${cy - h / 2 + 12}" width="${w - 20}" height="${h - 24}" rx="14" fill="${lcd}"/>
        <rect x="${cx - w / 2 + 10}" y="${cy - h / 2 + 12}" width="${w - 20}" height="${h - 24}" rx="14" fill="none" stroke="${hexA(txt, 0.2)}" stroke-width="2"/>
        <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-family="'Courier New', monospace" font-size="${m.timeSize ?? 46}" font-weight="700" fill="${txt}" letter-spacing="2" dominant-baseline="middle">${m.time ?? "10:08"}</text>
        ${m.dateLine ? `<text x="${cx}" y="${cy - h / 2 + 34}" text-anchor="middle" font-family="'Courier New', monospace" font-size="11" fill="${hexA(txt, 0.8)}" letter-spacing="1">${m.dateLine}</text>` : ""}
      </g>
    </g>
  `;
}

function gshockWatch(m, s) {
  const cx = s.cx ?? 400;
  const cy = s.cy ?? 372;
  const r = s.r ?? 136;
  const caseC = m.caseC ?? "#20232A";
  const lcd = m.lcd ?? "#0A1A14";
  const txt = m.lcdText ?? "#B7D9B0";
  const accent = m.accent ?? "#C0261D";
  const num = 8;
  const pts = Array.from({ length: num })
    .map((_, i) => {
      const a = (i / num) * TAU - Math.PI / 2;
      return `${(cx + Math.cos(a) * (r + 12)).toFixed(1)},${(cy + Math.sin(a) * (r + 12)).toFixed(1)}`;
    })
    .join(" ");
  return `
    <g>
      ${strapTop(cx, cy - r - 40, cy - r + 8, 138, "black_resin", null)}
      ${strapBottom(cx, cy + r - 8, cy + r + 40, 138, "black_resin", null)}
      <polygon points="${pts}" fill="${caseC}"/>
      <polygon points="${pts}" fill="none" stroke="${hexA(WHITE, 0.12)}" stroke-width="2"/>
      ${Array.from({ length: 4 }).map((_, i) => {
        const a = (i * 2 + 0.5) * (Math.PI / 4) - Math.PI / 2;
        const bx = cx + Math.cos(a) * (r + 6);
        const by = cy + Math.sin(a) * (r + 6);
        return `<circle cx="${bx}" cy="${by}" r="5" fill="${hexA(WHITE, 0.15)}"/>`;
      }).join("")}
      <g>
        <rect x="${cx - 92}" y="${cy - r + 14}" width="184" height="${r * 2 - 28}" rx="22" fill="${caseC}"/>
        <rect x="${cx - 82}" y="${cy - r + 26}" width="164" height="${r * 2 - 52}" rx="14" fill="${lcd}"/>
        <text x="${cx}" y="${cy - 8}" text-anchor="middle" font-family="'Courier New', monospace" font-size="40" font-weight="700" fill="${txt}">10:08</text>
        <line x1="${cx - 58}" y1="${cy + 16}" x2="${cx + 58}" y2="${cy + 16}" stroke="${hexA(accent, 0.9)}" stroke-width="2"/>
        <text x="${cx}" y="${cy + 42}" text-anchor="middle" font-family="'Courier New', monospace" font-size="13" letter-spacing="2" fill="${hexA(txt, 0.9)}">${m.model ?? "GA-2100"}</text>
      </g>
    </g>
  `;
}

function smartWatch(m, s) {
  const cx = s.cx ?? 400;
  const cy = s.cy ?? 368;
  const w = s.sw ?? 160;
  const h = s.sh ?? 190;
  const bodyC = m.bodyC ?? ["#232326", "#141416"];
  const sf = m.screenC ?? "#0C0E13";
  const accent = m.accent ?? "#C6A15B";
  const num = m.timeSize ?? 54;
  return `
    <g>
      ${strapTop(cx, cy - h / 2 - 24, cy - h / 2 + 6, 128, m.strap ?? "silicone_gray", null)}
      ${strapBottom(cx, cy + h / 2 - 6, cy + h / 2 + 24, 128, m.strap ?? "silicone_gray", null)}
      <rect x="${cx - w / 2 - 8}" y="${cy - h / 2 - 8}" width="${w + 16}" height="${h + 16}" rx="52" fill="url(#smartbody)"/>
      <rect x="${cx - w / 2 + 5}" y="${cy - h / 2 + 5}" width="${w - 10}" height="${h - 10}" rx="44" fill="${sf}"/>
      <g>
        <text x="${cx}" y="${cy - 42}" text-anchor="middle" font-family="Verdana, sans-serif" font-size="${num}" font-weight="600" fill="${WHITE}">10:08</text>
        <text x="${cx}" y="${cy - 12}" text-anchor="middle" font-family="Verdana, sans-serif" font-size="12" letter-spacing="1" fill="${hexA(WHITE, 0.65)}">FRI, 11 SEP</text>
        <g transform="translate(${cx}, ${cy + 26})">
          ${[accent, "#4C6EB5", "#E2665A"].map((c, i) => {
            const rad = 24 + i * 20;
            return `<circle cx="0" cy="0" r="${rad}" fill="none" stroke="${hexA(c, 0.9)}" stroke-width="6" stroke-dasharray="${Math.PI * rad * 0.78} ${Math.PI * rad * 2}" transform="rotate(${-90 + i * 30} 0 0)"/>`;
          }).join("")}
          <circle cx="0" cy="0" r="46" fill="none" stroke="${hexA(WHITE, 0.08)}" stroke-width="6"/>
        </g>
        <rect x="${cx - 34}" y="${cy - h / 2 + 20}" width="68" height="14" rx="7" fill="${hexA(WHITE, 0.14)}"/>
      </g>
      <defs>
        <linearGradient id="smartbody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${bodyC[0]}"/><stop offset="1" stop-color="${bodyC[1]}"/>
        </linearGradient>
      </defs>
    </g>
  `;
}

function minimalWatch(m, s) {
  const cx = s.cx ?? 400;
  const cy = s.cy ?? 376;
  const r = s.r ?? 148;
  const caseMetal = m.metal === "rose" || m.metal === "gold"
    ? ["#E0C08A", "#C6A15B", "#D9B983"]
    : ["#C9CED6", "#888F9B", "#D8DCE2"];
  return `
    <g>
      ${strapTop(cx, cy - r - 30, cy - r - 6, 108, m.strap, null)}
      ${strapBottom(cx, cy + r + 6, cy + r + 30, 108, m.strap, null)}
      <g>
        <circle cx="${cx}" cy="${cy}" r="${r + 9}" fill="${caseMetal[0]}"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#dialgrad)"/>
        ${Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * TAU - Math.PI / 2;
          const isCard = [0, 3, 6, 9].includes(i);
          const lr = isCard ? r * 0.9 : r * 0.95;
          return `<line x1="${cx + Math.cos(a) * r * 0.8}" y1="${cy + Math.sin(a) * r * 0.8}" x2="${cx + Math.cos(a) * lr}" y2="${cy + Math.sin(a) * lr}" stroke="${hexA(INK, isCard ? 0.75 : 0.32)}" stroke-width="${isCard ? 2.4 : 1.3}" stroke-linecap="round"/>`;
        }).join("")}
        ${brandText(cx, cy - r * 0.42, m.brand, hexA(INK, 0.8), 12, 4)}
        ${hands(cx, cy, r, { hourC: "#222", minC: "#222", showSec: true, secC: m.secC ?? CHAMPAGNE, capC: "#222" })}
        <circle cx="${cx}" cy="${cy}" r="${r + 9}" fill="none" stroke="${hexA(WHITE, 0.4)}" stroke-width="1.4"/>
      </g>
    </g>
  `;
}

function diverWatch(m, s) {
  const cx = s.cx ?? 400;
  const cy = s.cy ?? 378;
  const r = s.r ?? 150;
  const caseMetal = ["#C9CED6", "#888F9B", "#D8DCE2"];
  const dial = m.dial;
  return `
    <g>
      ${strapTop(cx, cy - r - 34, cy - r - 6, 122, m.strap, null)}
      ${strapBottom(cx, cy + r + 6, cy + r + 34, 122, m.strap, null)}
      <g>
        <circle cx="${cx}" cy="${cy}" r="${r + 12}" fill="${caseMetal[0]}"/>
        <circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="${caseMetal[2]}"/>
        ${ticks(cx, cy, r + 12, r + 6, 60, -90, 270, hexA(INK, 0.4), 5, 3, 0)}
        <circle cx="${cx}" cy="${cy}" r="${r + 2}" fill="${caseMetal[1]}"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#dialgrad)"/>
        ${fullTicks(cx, cy, r * 0.86, r * 0.96, hexA(INK, 0.6))}
        ${Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * TAU - Math.PI / 2;
          const x = cx + Math.cos(a) * r * 0.6;
          const y = cy + Math.sin(a) * r * 0.6;
          const v = i === 0 ? 12 : i;
          return `<text x="${x}" y="${y + 6}" text-anchor="middle" font-family="Verdana, sans-serif" font-size="15" font-weight="600" fill="${hexA(INK, 0.85)}">${v}</text>`;
        }).join("")}
        ${brandText(cx, cy - r * 0.58, m.brand, hexA(INK, 0.85), 12, 3)}
        ${modelText(cx, cy + r * 0.62, m.model ?? "200M", hexA(INK, 0.55))}
        ${hands(cx, cy, r, { hourC: "#1A1A1A", minC: "#1A1A1A", showSec: true, secC: m.secC ?? "#C0261D", capC: "#222" })}
        <circle cx="${cx}" cy="${cy}" r="${r + 12}" fill="none" stroke="${hexA(WHITE, 0.4)}" stroke-width="1.6"/>
      </g>
      <rect x="${cx + r + 8}" y="${cy - 8}" width="18" height="34" rx="5" fill="${caseMetal[1]}"/>
    </g>
  `;
}

// ---------- scenes ----------

function wrap(title, inner, size = 800) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${title}">
<defs>
  <radialGradient id="dialgrad" cx="0.42" cy="0.38" r="0.9">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/>
    <stop offset="1" stop-color="#000000" stop-opacity="0.18"/>
  </radialGradient>
  <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#B9BFC9"/><stop offset="0.5" stop-color="#858C99"/><stop offset="1" stop-color="#C7CCD4"/>
  </linearGradient>
  <linearGradient id="sat" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#D8C79B"/><stop offset="0.5" stop-color="#BFAA79"/><stop offset="1" stop-color="#E0D0A6"/>
  </linearGradient>
</defs>
${inner}
</svg>`;
}

function productScene(model, variant, title) {
  const size = 800;
  const backdrops = {
    1: ['<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FAF7F0"/><stop offset="1" stop-color="#EFEAE0"/></linearGradient>', '#F7F5F0'],
    2: ['<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2EADC"/><stop offset="1" stop-color="#E5D9C2"/></linearGradient>', '#EFE7D6'],
    3: ['<linearGradient id="bg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#111111"/><stop offset="1" stop-color="#2A2A2E"/></linearGradient>', '#1B1B1E'],
    4: ['<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF8F3"/><stop offset="1" stop-color="#EfE9DE"/></linearGradient>', '#F4EFE5'],
  };
  const [bgdef, bgtop] = backdrops[variant] ?? backdrops[1];
  let body = "";

  if (variant === 4) {
    // strap macro
    const s = STRAPS[model.strap ?? "steel"] ?? STRAPS.steel;
    const horiz = model.strap === "black_resin" || model.strap === "steel" || model.strap === "leather_black";
    const rounded = `
      <rect x="120" y="300" width="560" height="210" rx="105" fill="url(#skill)" stroke="${hexA(INK, 0.15)}" stroke-width="2.5"/>
      <circle cx="400" cy="352" r="26" fill="${s[1]}" stroke="${hexA(INK, 0.2)}" stroke-width="3"/>
      ${!model.digital && !model.smart ? `<rect x="508" y="266" width="34" height="54" rx="8" fill="${s[1]}"/>` : ""}
      ${Array.from({ length: 5 }).map((_, i) => `<line x1="150" y1="${318 + i * 35}" x2="${282 + (i % 2) * 0}" y2="${318 + i * 35}" stroke="${hexA(INK, 0.1)}" stroke-width="2" stroke-linecap="round"/>`).join("")}
    ` + `
    <defs><linearGradient id="skill" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${s[0]}"/><stop offset="0.5" stop-color="${s[1]}"/><stop offset="1" stop-color="${s[2]}"/></linearGradient></defs>`;
    body = `<circle cx="400" cy="345" r="190" fill="${hexA(CHAMPAGNE, 0.16)}"/>\n${rounded}`;
  } else if (variant === 3) {
    // dial macro
    const scale = 1.75;
    const cx = 400, cy = 388;
    const tx = cx * (1 - scale), ty = cy * (1 - scale);
    const s = { cx, cy, r: 150 };
    body = `<g transform="translate(${tx},${ty}) scale(${scale})">${watchBody(model, s, 3)}<text x="${cx}" y="${cy + 105}" text-anchor="middle" font-family="Verdana, sans-serif" font-size="30" letter-spacing="6" fill="${hexA(INK, 0.35)}">${(model.brand ?? "TIME CART").toUpperCase()}</text></g>`;
    body += `<rect x="0" y="640" width="800" height="160" fill="url(#fadeout)"/>
      <defs><linearGradient id="fadeout" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bgtop}" stop-opacity="0"/><stop offset="1" stop-color="${bgtop}" stop-opacity="1"/></linearGradient></defs>`;
  } else if (variant === 2) {
    const s = { cx: 400, cy: 388, r: 148 };
    body = `<g transform="rotate(8 400 400)">${watchBody(model, s, 2)}</g>`;
    body += `<g transform="rotate(-8 400 400)"><rect x="360" y="640" width="80" height="6" rx="3" fill="${hexA(INK, 0.08)}"/></g>`;
  } else {
    const s = { cx: 400, cy: 385 };
    body = watchBody(model, s, 1);
  }

  const glowVariant = variant === 3 ? "" : `<circle cx="400" cy="330" r="300" fill="${variant === 2 ? hexA(CHAMPAGNE, 0.22) : hexA(CHAMPAGNE, 0.12)}"/>`;
  const shadow = `${variant === 4 ? "" : `<ellipse cx="400" cy="720" rx="150" ry="16" fill="${hexA(INK, 0.14)}"/>`}`;

  const inner = `
    <rect width="${size}" height="${size}" fill="url(#bg)"/>
    ${bgdef}
    ${glowVariant}
    ${body}
    ${shadow}
  `;
  return wrap(title, inner, size);
}

function watchBody(model, s, variant) {
  switch (model.kind) {
    case "digital":
      return digitalWatch(model, s);
    case "gshock":
      return gshockWatch(model, s);
    case "smart":
      return smartWatch(model, s);
    case "minimal":
      return minimalWatch(model, s);
    case "diver":
      return diverWatch(model, s);
    default:
      return analogWatch(model, s);
  }
}

// ---------- model catalog ----------
const M = {};

function reg(slug, kind, cfg) {
  M[slug] = { kind, ...cfg };
}

// Analog classics
reg("casio-vintage-a168", "digital", { strap: "steel", caseC: "#22262E", lcd: "#15251D", lcdText: "#C9E3B4", time: "10:08", dateLine: "FRI 11 SEP", model: "A168" });
reg("casio-mtp-123", "analog", { metal: "steel", dial: DIALS.silver, strap: "steel", brand: "CASIO", model: "MTP-123", brandSpacing: 4 });
reg("seiko-5-automatic", "analog", { metal: "steel", dial: DIALS.blue, strap: "nato_blue", brand: "SEIKO", model: "AUTOMATIC", auto: true, brandSize: 14 });
reg("citizen-eco-drive", "analog", { metal: "gold", dial: DIALS.black, strap: "leather_black", brand: "CITIZEN", model: "ECO-DRIVE", auto: true, darkHands: true, secC: "#8E9BB0", brandSpacing: 3.6 });
reg("fossil-grant-chrono", "analog", { metal: "steel", dial: DIALS.black, strap: "leather_brown", brand: "FOSSIL", model: "CHRONOGRAPH", chrono: true, brandSize: 12, brandColor: "rgba(255,255,255,0.88)", modelColor: "rgba(255,255,255,0.55)" });
reg("timex-weekender", "minimal", { metal: "steel", dial: DIALS.white, strap: "olive_nylon", brand: "TIMEX", model: "WEEKENDER", secC: "#3E5C46" });
reg("tissot-prx-quartz", "analog", { metal: "gold", dial: DIALS.gold, strap: "gold", brand: "TISSOT", model: "PRX", brandColor: "#5E4A1E", secC: "#7A6433", brandSpacing: 4 });
reg("orient-kamasu", "diver", { metal: "steel", dial: DIALS.green, strap: "steel", brand: "ORIENT", model: "KAMASU" });
reg("bulova-marine-star", "diver", { metal: "gold", dial: DIALS.blue, strap: "leather_black", brand: "BULOVA", model: "MARINE STAR", darkHands: true });
reg("casio-g-shock-ga2100", "gshock", { strap: "black_resin", caseC: "#20232A", model: "GA-2100" });
reg("titan-regalia", "analog", { metal: "rose", dial: DIALS.white, strap: "rose", brand: "TITAN", model: "REGALIA", brandColor: "#8A4A55", secC: "#B76E79", brandSpacing: 4 });
reg("fossil-jacqueline", "analog", { metal: "rose", dial: DIALS.rose, strap: "leather_brown", brand: "FOSSIL", model: "JACQUELINE", date: true, dateNum: "31", brandColor: "#5A2A32", secC: "#B76E79", brandSize: 11 });
reg("invicta-pro-diver", "diver", { metal: "steel", dial: DIALS.navy, strap: "steel", brand: "INVICTA", model: "PRO DIVER", secC: "#E2665A" });
reg("smartwatch-s8", "smart", { strap: "silicone_gray", accent: "#C6A15B", screenC: "#0C0E13", bodyC: ["#3A3A40", "#18181B"], timeSize: 50 });
reg("casio-mq24", "digital", { strap: "white_resin", caseC: "#2E2E33", lcd: "#C9CFD4", lcdText: "#333A3F", time: "6:35", dateLine: "SEP 11", model: "MQ-24" });
reg("seiko-presage-cocktail", "analog", { metal: "steel", dial: DIALS.navy, strap: "leather_black", brand: "SEIKO", model: "PRESAGE", auto: true, date: true, dateNum: "11", brandSize: 13 });
reg("casio-edifice", "analog", { metal: "gold", dial: DIALS.blue, strap: "steel", brand: "EDIFICE", model: "CHRONOGRAPH", chrono: true, brandSize: 12, brandSpacing: 3.4 });
reg("orient-bambino-v2", "analog", { metal: "gold", dial: DIALS.champagne, strap: "leather_tan", brand: "ORIENT", model: "BAMBINO", auto: true, date: true, dateNum: "28", brandColor: "#5E4A1E", secC: "#7A6433", brandSpacing: 4 });
reg("bulova-curv", "analog", { metal: "steel", dial: DIALS.black, strap: "leather_black", brand: "BULOVA", model: "CURV", chrono: true, darkHands: true, brandSize: 11 });
reg("fossil-gen6", "smart", { strap: "silicone_gray", accent: "#4C6EB5", screenC: "#0C0E13", bodyC: ["#575757", "#1F1F22"], timeSize: 42 });
reg("timex-expedition", "diver", { metal: "steel", dial: DIALS.olive, strap: "fabric_olive", brand: "TIMEX", model: "EXPEDITION", darkHands: true });
reg("titan-edge-slim", "minimal", { metal: "steel", dial: DIALS.silver, strap: "steel", brand: "TITAN", model: "EDGE" });
reg("citizen-ana-digi", "analog", { metal: "gold", dial: DIALS.black, strap: "steel", brand: "CITIZEN", model: "ANA-DIGI", chrono: true, brandSize: 12 });

// ---------- category / brand / home art ----------

function categoryArt(slug, label, accent) {
  const size = 900;
  const h = 1100;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${h}" viewBox="0 0 ${size} ${h}" role="img" aria-label="${label}">
    <defs>
      <radialGradient id="dialgrad" cx="0.42" cy="0.38" r="0.9">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.2"/><stop offset="1" stop-color="#000000" stop-opacity="0.22"/>
      </radialGradient>
      <linearGradient id="catbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#1A1C22"/><stop offset="1" stop-color="#0D0E12"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${h}" fill="url(#catbg)"/>
    <circle cx="450" cy="400" r="380" fill="${hexA(accent, 0.1)}"/>
    <circle cx="450" cy="400" r="300" fill="none" stroke="${hexA(accent, 0.35)}" stroke-width="1.5" stroke-dasharray="3 9"/>
    <line x1="120" y1="180" x2="780" y2="180" stroke="${hexA(accent, 0.5)}" stroke-width="1"/>
    <text x="450" y="150" text-anchor="middle" font-family="Verdana, sans-serif" font-size="18" letter-spacing="8" fill="${IVORY}">TIME CART</text>
    ${analogStyle(450, 660, accent)}
    <text x="450" y="${h - 170}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="72" fill="${IVORY}">${label}</text>
    <text x="450" y="${h - 120}" text-anchor="middle" font-family="Verdana, sans-serif" font-size="13" letter-spacing="6" fill="${hexA(IVORY, 0.6)}">WHERE TIME MEETS STYLE</text>
  </svg>`;
  function analogStyle(cx, cy, accent) {
    const r = 180;
    const ticks = Array.from({ length: 60 }).map((_, i) => {
      const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
      const major = i % 5 === 0;
      const r1 = r * (major ? 0.86 : 0.93);
      const x1 = (cx + Math.cos(a) * r1).toFixed(1), y1 = (cy + Math.sin(a) * r1).toFixed(1);
      const x2 = (cx + Math.cos(a) * r).toFixed(1), y2 = (cy + Math.sin(a) * r).toFixed(1);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${major ? accent : hexA(IVORY, 0.35)}" stroke-width="${major ? 4 : 1.5}" stroke-linecap="round"/>`;
    }).join("");
    const hand = (len, angle, w, color) =>
      `<polygon points="${cx - w / 2},${cy} ${cx},${cy - len} ${cx + w / 2},${cy}" fill="${color}" transform="rotate(${angle} ${cx} ${cy})"/>`;
    return `<g>
      <circle cx="${cx}" cy="${cy}" r="${r + 12}" fill="${hexA(IVORY, 0.04)}" stroke="${hexA(IVORY, 0.2)}" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#dialgrad)"/>
      ${ticks}
      <text x="${cx}" y="${cy - 60}" text-anchor="middle" font-family="Georgia, serif" font-size="24" letter-spacing="6" fill="${IVORY}">T C</text>
      ${hand(r * 0.5, 214, 16, IVORY)}
      ${hand(r * 0.74, -33, 8, IVORY)}
      <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r * 0.78}" stroke="${accent}" stroke-width="3" stroke-linecap="round" transform="rotate(126 ${cx} ${cy})"/>
      <circle cx="${cx}" cy="${cy}" r="7" fill="${accent}"/>
    </g>`;
  }
}

function brandArt(slug, name, accent) {
  const size = 800;
  const cx = 400, cy = 380;
  const r = 176;
  const abbr = (name.match(/^[A-Z]/) ?? [name[0]])[0] +
               (name.match(/[A-Z]$/) ?? [name[name.length - 1]])[0];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${name}">
    <defs>
      <radialGradient id="dialgrad" cx="0.42" cy="0.38" r="0.9">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="1" stop-color="#000000" stop-opacity="0.2"/>
      </radialGradient>
      <linearGradient id="brandbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#25272E"/><stop offset="1" stop-color="#0E0F12"/>
      </linearGradient>
      <linearGradient id="bgmetal" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#C9CED6"/><stop offset="0.5" stop-color="#888F9B"/><stop offset="1" stop-color="#D8DCE2"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#brandbg)"/>
    <circle cx="${cx}" cy="${cy}" r="300" fill="${hexA(accent, 0.09)}"/>
    <circle cx="${cx}" cy="${cy}" r="r" fill="none" stroke="none"/>
    <text x="${cx}" y="120" text-anchor="middle" font-family="Verdana, sans-serif" font-size="14" letter-spacing="7" fill="${hexA(IVORY, 0.7)}">WHERE TIME MEETS STYLE</text>
    <g>
      <rect x="250" y="120" width="300" height="12" rx="6" fill="${hexA(IVORY, 0.8)}"/>
      <circle cx="${cx}" cy="${cy + 6}" r="${r + 12}" fill="#D8DCE2" stroke="${hexA(INK, 0.25)}" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy + 6}" r="${r}" fill="url(#dialgrad)"/>
      <circle cx="${cx}" cy="${cy + 6}" r="${r * 0.92}" fill="none" stroke="${hexA(IVORY, 0.22)}" stroke-width="1.5"/>
      ${Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
        const x1 = (cx + Math.cos(a) * r * 0.85).toFixed(1), y1 = (cy + Math.sin(a) * r * 0.85 + 6).toFixed(1);
        const x2 = (cx + Math.cos(a) * r * 0.97).toFixed(1), y2 = (cy + Math.sin(a) * r * 0.97 + 6).toFixed(1);
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${hexA(IVORY, 0.5)}" stroke-width="${i % 3 === 0 ? 4 : 1.5}"/>`;
      }).join("")}
      <text x="${cx}" y="${cy - 40}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="34" letter-spacing="4" fill="${IVORY}">${abbr}</text>
      <text x="${cx}" y="${cy + 16}" text-anchor="middle" font-family="Verdana, sans-serif" font-size="11" letter-spacing="3" fill="${hexA(IVORY, 0.55)}">${name.toUpperCase()}</text>
      <polygon points="${cx - 9},${cy + 34} ${cx},${cy + 58} ${cx + 9},${cy + 34}" fill="${accent}"/>
      <polygon points="${cx - 14},${cy + 64} ${cx},${cy + 96} ${cx + 14},${cy + 64}" fill="${hexA(IVORY, 0.5)}"/>
    </g>
  </svg>`;
}

function homeArt(file, title, accent, bgA, bgB, watch = { kind: "analog", metal: "gold", dial: DIALS.black, strap: "leather_tan", brand: "TIME CART", model: "THE SEASON", darkHands: true, secC: "#C6A15B" }) {
  const size = 800;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${title}">
    <defs>
      <radialGradient id="dialgrad" cx="0.42" cy="0.38" r="0.9">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="1" stop-color="#000000" stop-opacity="0.22"/>
      </radialGradient>
      <linearGradient id="homebg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${bgA}"/><stop offset="1" stop-color="${bgB}"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#homebg)"/>
    <circle cx="400" cy="360" r="300" fill="${hexA(accent, 0.12)}"/>
    <circle cx="400" cy="360" r="260" fill="none" stroke="${hexA(accent, 0.3)}" stroke-width="1.4" stroke-dasharray="4 10"/>
    <g transform="translate(0,0)">${productScenes(file)(watch)}</g>
    <text x="400" y="640" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="26" letter-spacing="6" fill="${IVORY}" opacity="0.9">${title}</text>
  </svg>`;
  function productScenes(file) {
    return (watch) => {
      const s = { cx: 400, cy: 360, r: 150 };
      switch (watch.kind) {
        case "smart": return smartWatch(watch, s);
        case "digital": return digitalWatch(watch, s);
        case "diver": return diverWatch(watch, s);
        case "gshock": return gshockWatch(watch, s);
        default: return analogWatch(watch, s);
      }
    };
  }
}

// ---------- write files ----------

function ensure() {
  [P, C, B, H].forEach((d) => mkdirSync(d, { recursive: true }));
  writeFileSync(resolve(OUT, "README.txt"), "Auto-generated mockups — run `node scripts/generate-mockups.mjs` to regenerate.\n");
}

function write(name, content) {
  writeFileSync(resolve(P, `${name}.svg`), content);
}

function main() {
  ensure();

  // Products (4 gallery variants each)
  for (const [slug, model] of Object.entries(M)) {
    for (let v = 1; v <= 4; v++) {
      write(`${slug}${v === 1 ? "" : `-${v}`}`, productScene(model, v, `${slug} mockup`));
    }
  }
  console.log(`✔ products: ${Object.keys(M).length} models x 4 variants`);

  // Categories
  const cats = {
    "mens-watches": "Men's Watches",
    "womens-watches": "Women's Watches",
    "luxury": "Luxury",
    "sports": "Sports",
    "smart-watches": "Smart Watches",
    "casual": "Casual",
    "automatic": "Automatic",
    "quartz": "Quartz",
  };
  const accents = {
    "mens-watches": "#C6A15B",
    "womens-watches": "#B76E79",
    "luxury": "#D9B983",
    "sports": "#E2665A",
    "smart-watches": "#4C6EB5",
    "casual": "#8C5C37",
    "automatic": "#C6A15B",
    "quartz": "#9AA1AC",
  };
  for (const [slug, label] of Object.entries(cats)) {
    writeFileSync(resolve(C, `${slug}.svg`), categoryArt(slug, label, accents[slug]));
  }
  console.log(`✔ categories: ${Object.keys(cats).length}`);

  // Brands
  const brands = {
    casio: ["Casio", "#E2665A"], seiko: ["Seiko", "#3E5C46"], citizen: ["Citizen", "#4C6EB5"],
    fossil: ["Fossil", "#C6A15B"], timex: ["Timex", "#8C5C37"], tissot: ["Tissot", "#C0392B"],
    orient: ["Orient", "#2F4278"], bulova: ["Bulova", "#7A5A3A"], titan: ["Titan", "#B76E79"],
    invicta: ["Invicta", "#305070"],
  };
  for (const [slug, [name, accent]] of Object.entries(brands)) {
    writeFileSync(resolve(B, `${slug}.svg`), brandArt(slug, name, accent));
  }
  console.log(`✔ brands: ${Object.keys(brands).length}`);

  // Home art
  const home = {
    "editorial.svg": homeArt("editorial", "The Everyday Collection", "#C6A15B", "#20242C", "#0E1014", { kind: "analog", metal: "gold", dial: DIALS.black, strap: "leather_tan", brand: "TIME CART", model: "AUTOMATIC", darkHands: true }),
    "inspire-1.svg": homeArt("inspire-1", "#EveryWrist", "#C6A15B", "#221f1a", "#14110d", { kind: "analog", metal: "gold", dial: DIALS.champagne, strap: "leather_brown", brand: "TIME CART", model: "THE EDIT", secC: "#7A6433" }),
    "inspire-2.svg": homeArt("inspire-2", "#CityBeat", "#4C6EB5", "#141822", "#0c0f16", { kind: "smart", strap: "silicone_gray", accent: "#4C6EB5", screenC: "#0C0E13", bodyC: ["#3A3A40", "#18181B"], timeSize: 50 }),
    "inspire-3.svg": homeArt("inspire-3", "#WeekendDiver", "#E2665A", "#1a2220", "#0e1412", { kind: "diver", metal: "steel", dial: DIALS.green, strap: "steel", brand: "TIME CART", model: "200M", secC: "#E2665A" }),
    "inspire-4.svg": homeArt("inspire-4", "#RoseQuartz", "#B76E79", "#241a1c", "#140f11", { kind: "analog", metal: "rose", dial: DIALS.rose, strap: "rose", brand: "TIME CART", model: "PETITE", secC: "#B76E79" }),
    "inspire-5.svg": homeArt("inspire-5", "#AlwaysOn", "#C6A15B", "#1c1e24", "#0d0e12", { kind: "gshock", strap: "black_resin", caseC: "#20232A", model: "GA-2100" }),
    "inspire-6.svg": homeArt("inspire-6", "#ClassicLine", "#9AA1AC", "#1c1e24", "#101114", { kind: "analog", metal: "steel", dial: DIALS.silver, strap: "steel", brand: "TIME CART", model: "HERITAGE" }),
  };
  for (const [file, art] of Object.entries(home)) {
    writeFileSync(resolve(H, file), art);
  }
  console.log(`✔ home: ${Object.keys(home).length}`);

  console.log("🎉 Mockups generated → public/images");
}

main();