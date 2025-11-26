function hashString(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function hsvToRgb(h: number, s: number, v: number) {
  s /= 100;
  v /= 100;
  let c = v * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = v - c;
  let r = 0, g = 0, b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return `rgb(${Math.round((r + m) * 255)}, ${Math.round(
    (g + m) * 255
  )}, ${Math.round((b + m) * 255)})`;
}

export function getUserColors(userId: string | number) {
  const h = hashString(String(userId)) % 360;

  const nameColor = hsvToRgb(h, 70, 75);
  const bubbleColor = hsvToRgb(h, 25, 20);

  return { nameColor, bubbleColor };
}
