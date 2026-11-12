const Jimp = require('jimp-compact');

function createIcons() {
  // Helper to draw a circle
  function drawCircle(image, cx, cy, radius, colorHex) {
    const r2 = radius * radius;
    for (let y = Math.max(0, cy - radius); y <= Math.min(image.bitmap.height - 1, cy + radius); y++) {
      for (let x = Math.max(0, cx - radius); x <= Math.min(image.bitmap.width - 1, cx + radius); x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r2) {
          image.setPixelColor(colorHex, x, y);
        }
      }
    }
  }

  // Draw a cute paw print at cx, cy with given scale
  function drawPaw(image, cx, cy, scale) {
    const cyan = 0x06B6D4FF;
    const white = 0xFFFFFFFF;
    
    // Main pad
    drawCircle(image, cx, cy + Math.round(20 * scale), Math.round(80 * scale), cyan);
    drawCircle(image, cx, cy + Math.round(20 * scale), Math.round(65 * scale), white);

    // 4 Toes
    const toeRadius = Math.round(30 * scale);
    drawCircle(image, cx - Math.round(75 * scale), cy - Math.round(40 * scale), toeRadius, cyan);
    drawCircle(image, cx - Math.round(30 * scale), cy - Math.round(85 * scale), toeRadius, cyan);
    drawCircle(image, cx + Math.round(30 * scale), cy - Math.round(85 * scale), toeRadius, cyan);
    drawCircle(image, cx + Math.round(75 * scale), cy - Math.round(40 * scale), toeRadius, cyan);
  }

  // 1. icon.png (1024x1024)
  new Jimp(1024, 1024, 0x0D1117FF, (err, img) => {
    if (err) throw err;
    drawCircle(img, 512, 512, 380, 0x161B22FF);
    drawCircle(img, 512, 512, 360, 0x1E293BFF);
    drawPaw(img, 512, 512, 2.4);
    img.write('assets/icon.png', () => console.log('✓ assets/icon.png created'));
  });

  // 2. adaptive-icon.png (1024x1024)
  new Jimp(1024, 1024, 0x00000000, (err, img) => {
    if (err) throw err;
    drawCircle(img, 512, 512, 320, 0x06B6D433);
    drawPaw(img, 512, 512, 2.2);
    img.write('assets/adaptive-icon.png', () => console.log('✓ assets/adaptive-icon.png created'));
  });

  // 3. splash.png (2048x2048)
  new Jimp(2048, 2048, 0x0D1117FF, (err, img) => {
    if (err) throw err;
    drawCircle(img, 1024, 1024, 300, 0x161B22FF);
    drawPaw(img, 1024, 1024, 2.2);
    img.write('assets/splash.png', () => console.log('✓ assets/splash.png created'));
  });

  // 4. favicon.png (48x48)
  new Jimp(48, 48, 0x0D1117FF, (err, img) => {
    if (err) throw err;
    drawPaw(img, 24, 24, 0.12);
    img.write('assets/favicon.png', () => console.log('✓ assets/favicon.png created'));
  });
}

createIcons();
