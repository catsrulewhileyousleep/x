// Ordered dithering, rendered once on the server. No canvas, animation loop or image request.
const BAYER = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

function pixels() {
  const paths: string[] = [];
  for (let y = 0; y < 360; y += 3) {
    for (let x = 0; x < 400; x += 3) {
      const dx = (x - 200) / 142;
      const dy = (y - 180) / 142;
      // A tilted torus: the opening keeps the form light rather than a solid ornament.
      const u = dx * 0.88 + dy * 0.48;
      const v = (-dx * 0.48 + dy * 0.88) / 0.72;
      const radius = Math.hypot(u, v);
      const tube = (radius - 0.73) / 0.3;
      if (Math.abs(tube) >= 1) continue;
      const normal = Math.sqrt(1 - tube * tube);
      const light = Math.max(0.06, Math.min(0.94, 0.42 + normal * 0.34 - u * 0.28 + v * 0.12));
      if (light > (BAYER[(y / 3) % 8][(x / 3) % 8] + 0.5) / 64) {
        paths.push(`M${x} ${y}h2v2h-2z`);
      }
    }
  }
  return paths.join("");
}

const path = pixels();

export function Dither() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 400 360" className="dither-art h-full w-full text-fg">
      <path d={path} fill="currentColor" />
      <g fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25">
        <path d="M24 40h12m-6-6v12M364 40h12m-6-6v12M24 320h12m-6-6v12M364 320h12m-6-6v12" />
      </g>
    </svg>
  );
}
