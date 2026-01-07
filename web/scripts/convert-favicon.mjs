import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import toIco from 'to-ico';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, '../public/logo.png');
const faviconPath = path.join(__dirname, '../app/favicon.ico');

async function convertFavicon() {
  try {
    console.log('Reading logo.png...');
    
    // Resize to common favicon sizes using sharp
    console.log('Resizing to favicon sizes...');
    const sizes = [16, 32, 48];
    const resizedBuffers = await Promise.all(
      sizes.map(async (size) => {
        return await sharp(logoPath)
          .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
          .png()
          .toBuffer();
      })
    );
    
    console.log('Converting to ICO format...');
    const icoBuffer = await toIco(resizedBuffers);
    
    console.log('Writing favicon.ico...');
    fs.writeFileSync(faviconPath, icoBuffer);
    
    console.log('✅ Successfully converted logo.png to favicon.ico');
  } catch (error) {
    console.error('❌ Error converting favicon:', error);
    process.exit(1);
  }
}

convertFavicon();
