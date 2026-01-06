/**
 * Script to download and parse GeoNames US zip code data
 * GeoNames provides free postal code data with lat/lng
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GeoNames US postal codes download URL
// This is the direct download link for US postal codes
const GEONAMES_URL = 'https://download.geonames.org/export/zip/US.zip';

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloaded = 0;
      
      response.on('data', (chunk) => {
        downloaded += chunk.length;
        file.write(chunk);
        if (totalSize) {
          const percent = ((downloaded / totalSize) * 100).toFixed(1);
          process.stdout.write(`\r   Downloading: ${percent}%`);
        }
      });
      
      response.on('end', () => {
        file.end();
        console.log('\n');
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

function parseGeonamesFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  const zipMap = new Map();
  
  // GeoNames format: Country Code, Postal Code, Place Name, Admin Name1, Admin Code1, Admin Name2, Admin Code2, Admin Name3, Admin Code3, Latitude, Longitude, Accuracy
  for (const line of lines) {
    if (line.startsWith('Country')) continue; // Skip header if present
    
    const parts = line.split('\t');
    if (parts.length < 11) continue;
    
    const countryCode = parts[0];
    const postalCode = parts[1];
    const placeName = parts[2];
    const adminName1 = parts[3]; // State
    const lat = parseFloat(parts[9]);
    const lng = parseFloat(parts[10]);
    
    if (countryCode !== 'US' || !postalCode || isNaN(lat) || isNaN(lng)) continue;
    
    const normalizedZip = String(postalCode).replace(/\D/g, '').padStart(5, '0').substring(0, 5);
    
    // If we already have this zip, prefer the one with a city name
    if (!zipMap.has(normalizedZip) || (placeName && !zipMap.get(normalizedZip).city)) {
      zipMap.set(normalizedZip, {
        zip: normalizedZip,
        city: placeName || null,
        state: adminName1 || null,
        latitude: lat,
        longitude: lng,
      });
    }
  }
  
  return Array.from(zipMap.values());
}

async function downloadGeonamesData() {
  console.log('🚀 Downloading GeoNames US zip code data...\n');
  
  const tempDir = path.join(__dirname, '..', '..', 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const zipPath = path.join(tempDir, 'US.zip');
  const txtPath = path.join(tempDir, 'US.txt');
  
  try {
    // Download the zip file
    console.log('📥 Downloading from GeoNames...');
    await downloadFile(GEONAMES_URL, zipPath);
    console.log('✅ Download complete\n');
    
    // Check if it's actually a zip file or a text file
    console.log('📦 Checking file format...');
    const fileStats = fs.statSync(zipPath);
    let extractedPath;
    
    // Try to read as text first (sometimes GeoNames serves as .txt)
    try {
      const testContent = fs.readFileSync(zipPath, 'utf-8');
      if (testContent.includes('US\t') || testContent.startsWith('Country')) {
        // It's actually a text file, not a zip
        extractedPath = zipPath;
        console.log('✅ File is text format, using directly\n');
      } else {
        throw new Error('Not a text file');
      }
    } catch (error) {
      // It's a zip file, extract it
      console.log('📦 Extracting zip file...');
      const AdmZip = (await import('adm-zip')).default;
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(tempDir, true);
      console.log('✅ Extraction complete\n');
      
      // Find the extracted file
      const files = fs.readdirSync(tempDir);
      const txtFile = files.find(f => f.endsWith('.txt') && (f.includes('US') || f.includes('us')));
      if (!txtFile) {
        throw new Error('Could not find extracted text file');
      }
      
      extractedPath = path.join(tempDir, txtFile);
    }
    
    // Parse the file
    console.log('📊 Parsing GeoNames data...');
    const zipData = parseGeonamesFile(extractedPath);
    console.log(`✅ Parsed ${zipData.length} zip codes\n`);
    
    // Cleanup
    try {
      fs.unlinkSync(zipPath);
      if (fs.existsSync(extractedPath)) {
        fs.unlinkSync(extractedPath);
      }
      // Remove any remaining files
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      }
      fs.rmdirSync(tempDir);
    } catch (error) {
      // Ignore cleanup errors
    }
    
    return zipData;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('adm-zip')) {
      console.error('\n💡 Installing required library...');
      console.error('   Run: cd web && npm install adm-zip');
    }
    throw error;
  }
}

// Export for use in other scripts
export { downloadGeonamesData, parseGeonamesFile };

// If run directly, download the data
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadGeonamesData()
    .then((data) => {
      console.log(`\n✅ Successfully downloaded ${data.length} zip codes from GeoNames`);
      console.log('📝 Sample data:');
      for (let i = 0; i < Math.min(5, data.length); i++) {
        console.log(`   ${data[i].zip}: ${data[i].city || 'N/A'}, ${data[i].state || 'N/A'} (${data[i].latitude}, ${data[i].longitude})`);
      }
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
