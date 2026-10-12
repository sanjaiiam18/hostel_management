const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sourceLogo = path.join(__dirname, '..', 'public', 'logo.png');

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];

async function generate() {
  console.log('Generating PWA icons from:', sourceLogo);

  for (const size of sizes) {
    // Standard icon with transparent background, centered with 10% padding
    const innerSize = Math.round(size * 0.85);
    const padding = Math.round((size - innerSize) / 2);

    const resizedLogo = await sharp(sourceLogo)
      .resize(innerSize, innerSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toBuffer();

    // Standard icon (transparent / white card)
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 } // Crisp white collegiate background
      }
    })
      .composite([{ input: resizedLogo, top: padding, left: padding }])
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));

    console.log(`✓ Generated icon-${size}x${size}.png`);
  }

  // Maskable 192 and 512 (with 65% safe-zone ratio as required by W3C maskable icon spec)
  for (const size of [192, 512]) {
    const innerSize = Math.round(size * 0.65);
    const padding = Math.round((size - innerSize) / 2);

    const resizedLogo = await sharp(sourceLogo)
      .resize(innerSize, innerSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([{ input: resizedLogo, top: padding, left: padding }])
      .png()
      .toFile(path.join(iconsDir, `icon-maskable-${size}x${size}.png`));

    console.log(`✓ Generated icon-maskable-${size}x${size}.png`);
  }

  // Apple Touch Icon (180x180)
  const appleSize = 180;
  const appleInner = Math.round(appleSize * 0.8);
  const applePadding = Math.round((appleSize - appleInner) / 2);

  const appleLogo = await sharp(sourceLogo)
    .resize(appleInner, appleInner, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toBuffer();

  await sharp({
    create: {
      width: appleSize,
      height: appleSize,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([{ input: appleLogo, top: applePadding, left: applePadding }])
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));

  // Also copy to public root for maximum compatibility
  fs.copyFileSync(
    path.join(iconsDir, 'apple-touch-icon.png'),
    path.join(__dirname, '..', 'public', 'apple-touch-icon.png')
  );

  console.log('✓ Generated apple-touch-icon.png');
  console.log('All PWA icons generated successfully!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
