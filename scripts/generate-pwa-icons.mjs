import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');
const svgPath = join(publicDir, 'icon.svg');

// Icon sizes needed for PWA
const sizes = [180, 192, 512];

async function generateIcons() {
  try {
    const svgBuffer = readFileSync(svgPath);
    
    console.log('Generating PWA icons from icon.svg...\n');
    
    for (const size of sizes) {
      const outputPath = join(publicDir, `icon-${size}x${size}.png`);
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated icon-${size}x${size}.png`);
    }
    
    console.log('\n✅ All PWA icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error.message);
    process.exit(1);
  }
}

generateIcons();

