/**
 * Script to populate zip_codes table in Supabase with US zip codes
 * Downloads data from a free source and imports into Supabase
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

// Free zip code database source (SimpleMaps free version)
// Alternative: https://github.com/midwire/free_zipcode_data
const ZIP_DATA_URL = 'https://simplemaps.com/static/data/us-zips/1.4/basic/simplemaps_uszipcodes_basicv1.4.zip';

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function extractZip(zipPath, extractPath) {
  const AdmZip = require('adm-zip');
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractPath, true);
}

async function parseCSV(csvPath) {
  const csv = fs.readFileSync(csvPath, 'utf-8');
  const lines = csv.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line (handling quoted fields)
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    if (values.length < headers.length) continue;
    
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx]?.replace(/^"|"$/g, '') || '';
    });
    
    data.push(row);
  }
  
  return data;
}

async function populateZipCodes() {
  console.log('Starting zip code population...');
  
  // Initialize Supabase client
  if (!SUPABASE_SERVICE_KEY) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable is required');
    console.error('For local Supabase, you can find the service_role key in supabase/.env or run: supabase status');
    process.exit(1);
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  // Check if we can use a simpler approach - try using a direct CSV import
  // For now, let's use a free API or a pre-processed dataset
  
  // Alternative: Use a GitHub-hosted CSV file
  const GITHUB_CSV_URL = 'https://raw.githubusercontent.com/midwire/free_zipcode_data/master/us_zipcodes.csv';
  
  console.log('Downloading zip code data from GitHub...');
  const tempDir = path.join(__dirname, '..', 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const csvPath = path.join(tempDir, 'us_zipcodes.csv');
  
  try {
    // Download CSV
    await downloadFile(GITHUB_CSV_URL, csvPath);
    console.log('Downloaded zip code data');
    
    // Parse CSV
    console.log('Parsing CSV...');
    const zipData = await parseCSV(csvPath);
    console.log(`Parsed ${zipData.length} zip codes`);
    
    // Map CSV columns to our table schema
    // Expected columns: zip, city, state, latitude, longitude
    const mappedData = zipData
      .map(row => {
        // Try to find zip, city, state, lat, lng columns (case-insensitive)
        const zip = row.zip || row.ZIP || row.zipcode || row.ZipCode || row.postal_code || '';
        const city = row.city || row.City || row.CITY || '';
        const state = row.state || row.State || row.STATE || row.state_code || '';
        const lat = parseFloat(row.latitude || row.Latitude || row.LAT || row.lat || '');
        const lng = parseFloat(row.longitude || row.Longitude || row.LNG || row.lng || row.lon || '');
        
        if (!zip || isNaN(lat) || isNaN(lng)) {
          return null;
        }
        
        return {
          zip: String(zip).padStart(5, '0').substring(0, 5), // Ensure 5-digit zip
          city: city || null,
          state: state || null,
          latitude: lat,
          longitude: lng,
        };
      })
      .filter(row => row !== null);
    
    console.log(`Mapped ${mappedData.length} valid zip codes`);
    
    // Clear existing data
    console.log('Clearing existing zip codes...');
    const { error: deleteError } = await supabase
      .from('zip_codes')
      .delete()
      .neq('zip', ''); // Delete all rows
    
    if (deleteError) {
      console.warn('Warning: Could not clear existing data:', deleteError.message);
    }
    
    // Insert in batches of 1000
    const batchSize = 1000;
    let inserted = 0;
    
    console.log('Inserting zip codes into Supabase...');
    for (let i = 0; i < mappedData.length; i += batchSize) {
      const batch = mappedData.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('zip_codes')
        .insert(batch);
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        // Try inserting one by one to find problematic rows
        for (const row of batch) {
          const { error: singleError } = await supabase
            .from('zip_codes')
            .insert(row)
            .select();
          
          if (singleError && !singleError.message.includes('duplicate')) {
            console.error(`Error inserting zip ${row.zip}:`, singleError.message);
          } else {
            inserted++;
          }
        }
      } else {
        inserted += batch.length;
      }
      
      if ((i + batchSize) % 5000 === 0) {
        console.log(`Inserted ${inserted} / ${mappedData.length} zip codes...`);
      }
    }
    
    console.log(`\n✅ Successfully inserted ${inserted} zip codes into Supabase!`);
    
    // Cleanup
    fs.unlinkSync(csvPath);
    fs.rmdirSync(tempDir);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('\nAlternative: You can manually download a zip code CSV and import it via Supabase dashboard:');
    console.error('1. Go to https://simplemaps.com/data/us-zips');
    console.error('2. Download the free basic version');
    console.error('3. Extract the CSV');
    console.error('4. Import via Supabase Table Editor > Import Data');
    process.exit(1);
  }
}

// Run the script
populateZipCodes().catch(console.error);
