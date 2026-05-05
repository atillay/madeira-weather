const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgCode = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2563eb" />
  <!-- Sun -->
  <g fill="#fcd34d" transform="translate(180, 160) scale(0.6)">
    <circle cx="0" cy="0" r="60" />
    <!-- Rays -->
    <path d="M 0,-85 L 0,-115" stroke="#fcd34d" stroke-width="18" stroke-linecap="round" />
    <path d="M 0,85 L 0,115" stroke="#fcd34d" stroke-width="18" stroke-linecap="round" />
    <path d="M -85,0 L -115,0" stroke="#fcd34d" stroke-width="18" stroke-linecap="round" />
    <path d="M 85,0 L 115,0" stroke="#fcd34d" stroke-width="18" stroke-linecap="round" />
    
    <path d="M -60,-60 L -80,-80" stroke="#fcd34d" stroke-width="18" stroke-linecap="round" />
    <path d="M 60,60 L 80,80" stroke="#fcd34d" stroke-width="18" stroke-linecap="round" />
    <path d="M -60,60 L -80,80" stroke="#fcd34d" stroke-width="18" stroke-linecap="round" />
    <path d="M 60,-60 L 80,-80" stroke="#fcd34d" stroke-width="18" stroke-linecap="round" />
  </g>

  <!-- Madeira Island Shape -->
  <path d="M 120,220 
           C 140,160 180,160 220,180
           C 260,200 300,160 340,180
           C 380,200 400,240 440,250
           C 480,260 480,270 440,270
           C 400,270 380,300 340,320
           C 280,350 200,350 140,300
           C 100,270 100,250 120,220
           Z" fill="#22c55e" />
  
  <!-- Porto Santo (approx) -->
  <path d="M 460,110 C 470,105 480,115 475,125 C 470,135 450,125 460,110 Z" fill="#22c55e" />
</svg>
`;

async function generate() {
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  // Favicon 32x32
  await sharp(Buffer.from(svgCode))
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  // Favicon 192x192
  await sharp(Buffer.from(svgCode))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192-v2.png'));

  // Favicon 512x512
  await sharp(Buffer.from(svgCode))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512-v2.png'));

  // SVG version maskable
  fs.writeFileSync(path.join(publicDir, 'pwa-icon.svg'), svgCode);

  console.log('Icons generated successfully.');
}

generate().catch(console.error);
