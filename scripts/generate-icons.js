const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const USER_IMAGE_PATH = 'C:/Users/Jorge/.gemini/antigravity/brain/892a21d9-e3c1-4fd8-a8f1-a4fbd97d744c/.user_uploaded/media_1792026786690_8a62691a.png';
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

async function main() {
  console.log('Generating refined BookSpace app icons...');

  // Exact stroke-based geometry matching the user icon
  // Left page and Right page drawn with uniform stroke for 100% geometric balance
  const bookShapePath = `
    <!-- Left Page -->
    <path d="M -24, -145
             C -90, -215 -200, -215 -270, -165
             C -285, -154 -295, -138 -295, -118
             L -295, 140
             C -295, 160 -280, 175 -260, 175
             L -24, 175"
          fill="none"
          stroke="#FF6B00"
          stroke-width="58"
          stroke-linecap="round"
          stroke-linejoin="round" />

    <!-- Right Page -->
    <path d="M 24, -145
             C 90, -215 200, -215 270, -165
             C 285, -154 295, -138 295, -118
             L 295, 140
             C 295, 160 280, 175 260, 175
             L 24, 175"
          fill="none"
          stroke="#FF6B00"
          stroke-width="58"
          stroke-linecap="round"
          stroke-linejoin="round" />

    <!-- Center Spine -->
    <line x1="0" y1="-142" x2="0" y2="175"
          stroke="#FF6B00"
          stroke-width="58"
          stroke-linecap="round" />

    <!-- Downward Spine Tail / Bookmark Tip -->
    <path d="M -29, 172
             L 0, 230
             L 29, 172
             Z"
          fill="#FF6B00" />
  `;

  const bookShapeWhite = `
    <!-- Left Page -->
    <path d="M -24, -145
             C -90, -215 -200, -215 -270, -165
             C -285, -154 -295, -138 -295, -118
             L -295, 140
             C -295, 160 -280, 175 -260, 175
             L -24, 175"
          fill="none"
          stroke="#FFFFFF"
          stroke-width="58"
          stroke-linecap="round"
          stroke-linejoin="round" />

    <!-- Right Page -->
    <path d="M 24, -145
             C 90, -215 200, -215 270, -165
             C 285, -154 295, -138 295, -118
             L 295, 140
             C 295, 160 280, 175 260, 175
             L 24, 175"
          fill="none"
          stroke="#FFFFFF"
          stroke-width="58"
          stroke-linecap="round"
          stroke-linejoin="round" />

    <!-- Center Spine -->
    <line x1="0" y1="-142" x2="0" y2="175"
          stroke="#FFFFFF"
          stroke-width="58"
          stroke-linecap="round" />

    <!-- Downward Spine Tail / Bookmark Tip -->
    <path d="M -29, 172
             L 0, 230
             L 29, 172
             Z"
          fill="#FFFFFF" />
  `;

  // 1. Full Icon (1024x1024)
  const svgIcon = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#000000" />
  <g transform="translate(512, 492) scale(0.92)">
    ${bookShapePath}
  </g>
</svg>
`;

  // 2. Android Adaptive Foreground (512x512 with safe padding)
  const svgForeground = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(256, 246) scale(0.48)">
    ${bookShapePath}
  </g>
</svg>
`;

  // 3. Android Adaptive Background (512x512)
  const svgBackground = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#000000" />
</svg>
`;

  // 4. Android Monochrome for themed icons (432x432)
  const svgMonochrome = `
<svg width="432" height="432" viewBox="0 0 432 432" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(216, 208) scale(0.42)">
    ${bookShapeWhite}
  </g>
</svg>
`;

  // Render all assets
  await sharp(Buffer.from(svgIcon))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(ASSETS_DIR, 'icon.png'));

  await sharp(Buffer.from(svgForeground))
    .resize(512, 512)
    .png()
    .toFile(path.join(ASSETS_DIR, 'android-icon-foreground.png'));

  await sharp(Buffer.from(svgBackground))
    .resize(512, 512)
    .png()
    .toFile(path.join(ASSETS_DIR, 'android-icon-background.png'));

  await sharp(Buffer.from(svgMonochrome))
    .resize(432, 432)
    .png()
    .toFile(path.join(ASSETS_DIR, 'android-icon-monochrome.png'));

  await sharp(Buffer.from(svgIcon))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(ASSETS_DIR, 'splash-icon.png'));

  await sharp(Buffer.from(svgIcon))
    .resize(48, 48)
    .png()
    .toFile(path.join(ASSETS_DIR, 'favicon.png'));

  console.log('All refined icons generated successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
