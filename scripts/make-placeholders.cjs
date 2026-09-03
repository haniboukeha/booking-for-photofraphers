/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const dir = "public/gallery";
fs.mkdirSync(dir, { recursive: true });
const palettes = [
  ["#1e293b", "#475569", "Wedding"],
  ["#312e81", "#6366f1", "Portrait"],
  ["#134e4a", "#14b8a6", "Product"],
  ["#4c1d95", "#a78bfa", "Event"],
  ["#7c2d12", "#fb923c", "Golden Hour"],
  ["#0f172a", "#38bdf8", "Studio"],
];
palettes.forEach(([a, b, label], i) => {
  fs.writeFileSync(
    `${dir}/g${i + 1}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><text x="400" y="310" font-family="sans-serif" font-size="42" fill="#ffffff" fill-opacity="0.85" text-anchor="middle">${label}</text></svg>`
  );
});
console.log("gallery placeholders written");
