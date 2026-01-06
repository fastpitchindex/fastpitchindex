/**
 * Script to populate zip_codes table in Supabase with US zip codes
 * Downloads from a free GitHub source and imports via Supabase
 */

import { createClient } from '@supabase/supabase-js';
import https from 'https';

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Free zip code database from GitHub
const ZIP_DATA_URL = 'https://raw.githubusercontent.com/midwire/free_zipcode_data/master/us_zipcodes.csv';

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        return downloadFile(response.headers.location).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  // Parse header
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  
  // Find column indices (case-insensitive)
  const zipIdx = headers.findIndex(h => h === 'zip' || h === 'zipcode' || h === 'postal_code');
  const cityIdx = headers.findIndex(h => h === 'city');
  const stateIdx = headers.findIndex(h => h === 'state' || h === 'state_code');
  const latIdx = headers.findIndex(h => h === 'latitude' || h === 'lat');
  const lngIdx = headers.findIndex(h => h === 'longitude' || h === 'lng' || h === 'lon');
  
  if (zipIdx === -1 || latIdx === -1 || lngIdx === -1) {
    throw new Error(`Required columns not found. Found: ${headers.join(', ')}`);
  }
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parsing (handling quoted fields)
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
    
    if (values.length <= Math.max(zipIdx, cityIdx, stateIdx, latIdx, lngIdx)) continue;
    
    const zip = values[zipIdx]?.replace(/^"|"$/g, '') || '';
    const city = cityIdx >= 0 ? (values[cityIdx]?.replace(/^"|"$/g, '') || '') : '';
    const state = stateIdx >= 0 ? (values[stateIdx]?.replace(/^"|"$/g, '') || '') : '';
    const lat = parseFloat(values[latIdx]?.replace(/^"|"$/g, '') || '');
    const lng = parseFloat(values[lngIdx]?.replace(/^"|"$/g, '') || '');
    
    if (!zip || isNaN(lat) || isNaN(lng)) continue;
    
    // Normalize zip to 5 digits
    const normalizedZip = String(zip).replace(/\D/g, '').padStart(5, '0').substring(0, 5);
    
    data.push({
      zip: normalizedZip,
      city: city || null,
      state: state || null,
      latitude: lat,
      longitude: lng,
    });
  }
  
  return data;
}

async function populateZipCodes() {
  console.log('🚀 Starting zip code population...\n');
  
  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required');
    console.error('\nFor local Supabase, get the service_role key by running:');
    console.error('  supabase status');
    console.error('\nOr set the environment variable:');
    console.error('  $env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"  # PowerShell');
    console.error('  export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"  # Bash');
    process.exit(1);
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // Download CSV
    console.log('📥 Downloading zip code data from GitHub...');
    const csvText = await downloadFile(ZIP_DATA_URL);
    console.log(`✅ Downloaded ${(csvText.length / 1024).toFixed(1)} KB of data\n`);
    
    // Parse CSV
    console.log('📊 Parsing CSV data...');
    const zipData = parseCSV(csvText);
    console.log(`✅ Parsed ${zipData.length} zip codes\n`);
    
    if (zipData.length === 0) {
      throw new Error('No zip codes found in CSV');
    }
    
    // Remove duplicates (keep first occurrence)
    const uniqueZips = new Map();
    for (const row of zipData) {
      if (!uniqueZips.has(row.zip)) {
        uniqueZips.set(row.zip, row);
      }
    }
    const uniqueData = Array.from(uniqueZips.values());
    console.log(`📋 Found ${uniqueData.length} unique zip codes\n`);
    
    // Clear existing data
    console.log('🗑️  Clearing existing zip codes...');
    const { error: deleteError } = await supabase
      .from('zip_codes')
      .delete()
      .neq('zip', '');
    
    if (deleteError) {
      console.warn('⚠️  Warning: Could not clear existing data:', deleteError.message);
      console.log('   Continuing with insert (may create duplicates)...\n');
    } else {
      console.log('✅ Cleared existing data\n');
    }
    
    // Insert in batches
    const batchSize = 1000;
    let inserted = 0;
    let errors = 0;
    
    console.log('💾 Inserting zip codes into Supabase...');
    console.log(`   Processing ${uniqueData.length} zip codes in batches of ${batchSize}\n`);
    
    for (let i = 0; i < uniqueData.length; i += batchSize) {
      const batch = uniqueData.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(uniqueData.length / batchSize);
      
      const { error } = await supabase
        .from('zip_codes')
        .insert(batch);
      
      if (error) {
        // If batch insert fails, try individual inserts for this batch
        console.warn(`⚠️  Batch ${batchNum} failed, inserting individually...`);
        for (const row of batch) {
          const { error: singleError } = await supabase
            .from('zip_codes')
            .insert(row)
            .select();
          
          if (singleError) {
            if (singleError.message.includes('duplicate') || singleError.message.includes('unique')) {
              // Skip duplicates silently
            } else {
              console.error(`   Error inserting zip ${row.zip}: ${singleError.message}`);
              errors++;
            }
          } else {
            inserted++;
          }
        }
      } else {
        inserted += batch.length;
      }
      
      if (batchNum % 10 === 0 || batchNum === totalBatches) {
        const progress = ((i + batch.length) / uniqueData.length * 100).toFixed(1);
        console.log(`   Progress: ${progress}% (${inserted} inserted, ${errors} errors)`);
      }
    }
    
    console.log(`\n✅ Successfully inserted ${inserted} zip codes into Supabase!`);
    if (errors > 0) {
      console.log(`⚠️  ${errors} zip codes had errors (likely duplicates)`);
    }
    console.log('\n🎉 Zip code population complete!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📝 Alternative manual import method:');
    console.error('1. Download a zip code CSV from: https://simplemaps.com/data/us-zips');
    console.error('2. Extract the CSV file');
    console.error('3. Go to Supabase Dashboard > Table Editor > zip_codes');
    console.error('4. Click "Insert" > "Import data from CSV"');
    console.error('5. Map columns: zip, city, state, latitude, longitude');
    process.exit(1);
  }
}

// Run the script
populateZipCodes().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
