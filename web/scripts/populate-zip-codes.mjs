/**
 * Script to populate zip_codes table in Supabase
 * Merges Excel file (city/state) with zip.txt (lat/lng)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Paths to files
const ZIP_EXCEL_PATH = path.join(__dirname, '..', '..', 'zipcode', 'ZIP_Locale_Detail.xls');
const ZIP_TXT_PATH = path.join(__dirname, '..', '..', 'zipcode', 'zip.txt');

async function fetchFromSupabase(endpoint, method = 'GET', body = null) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  
  const options = {
    method,
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  if (method === 'DELETE' || response.status === 204) {
    return {};
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

function parseZipTxt(filePath) {
  const csvText = fs.readFileSync(filePath, 'utf-8');
  const lines = csvText.split('\n').filter(line => line.trim());
  
  const zipMap = new Map();
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => v.trim());
    if (values.length < 3) continue;
    
    const zip = values[0] || '';
    const lat = parseFloat(values[1] || '');
    const lng = parseFloat(values[2] || '');
    
    if (!zip || isNaN(lat) || isNaN(lng)) continue;
    
    const normalizedZip = String(zip).replace(/\D/g, '').padStart(5, '0').substring(0, 5);
    zipMap.set(normalizedZip, { lat, lng });
  }
  
  return zipMap;
}

async function parseExcelFile(filePath) {
  let XLSX;
  try {
    XLSX = (await import('xlsx')).default;
  } catch (error) {
    console.error('❌ Error: xlsx library not found.');
    console.error('   Please run: cd web && npm install xlsx');
    throw new Error('xlsx library required. Run: npm install xlsx');
  }
  
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { raw: false });
  
  if (rows.length === 0) {
    throw new Error('No data found in Excel file');
  }
  
  const firstRow = rows[0];
  const columns = Object.keys(firstRow).map(k => k.toLowerCase().trim());
  
  console.log(`📋 Found columns: ${columns.join(', ')}`);
  
  // Find column indices - prioritize "physical" columns for city/state
  const zipIdx = columns.findIndex(c => 
    c.includes('zipcode') || (c.includes('zip') && !c.includes('4'))
  );
  const cityIdx = columns.findIndex(c => 
    c.includes('physical city') || (c.includes('city') && c.includes('physical'))
  );
  const stateIdx = columns.findIndex(c => 
    c.includes('physical state') || (c.includes('state') && c.includes('physical'))
  );
  
  if (zipIdx === -1) {
    throw new Error(`ZIP code column not found. Available columns: ${columns.join(', ')}`);
  }
  
  const zipKey = Object.keys(firstRow)[zipIdx];
  const cityKey = cityIdx >= 0 ? Object.keys(firstRow)[cityIdx] : null;
  const stateKey = stateIdx >= 0 ? Object.keys(firstRow)[stateIdx] : null;
  
  console.log(`\n📊 Mapping columns:`);
  console.log(`   ZIP: ${zipKey}`);
  if (cityKey) console.log(`   City: ${cityKey}`);
  if (stateKey) console.log(`   State: ${stateKey}\n`);
  
  const data = [];
  for (const row of rows) {
    const zip = String(row[zipKey] || '').trim();
    const city = cityKey ? String(row[cityKey] || '').trim() : '';
    const state = stateKey ? String(row[stateKey] || '').trim() : '';
    
    if (!zip) continue;
    
    const normalizedZip = String(zip).replace(/\D/g, '').padStart(5, '0').substring(0, 5);
    
    data.push({
      zip: normalizedZip,
      city: city || null,
      state: state || null,
    });
  }
  
  return data;
}

async function populateZipCodes() {
  console.log('🚀 Starting zip code population (merging Excel + zip.txt)...\n');
  
  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required');
    console.error('\nFor local Supabase, get the service_role key by running:');
    console.error('  supabase status');
    process.exit(1);
  }
  
  // Check if files exist
  if (!fs.existsSync(ZIP_EXCEL_PATH)) {
    console.error(`❌ Error: Excel file not found at: ${ZIP_EXCEL_PATH}`);
    process.exit(1);
  }
  if (!fs.existsSync(ZIP_TXT_PATH)) {
    console.error(`❌ Error: Zip coordinates file not found at: ${ZIP_TXT_PATH}`);
    process.exit(1);
  }
  
  try {
    // Parse both files
    console.log('📥 Reading zip coordinates from zip.txt...');
    const zipCoordsMap = parseZipTxt(ZIP_TXT_PATH);
    console.log(`✅ Loaded ${zipCoordsMap.size} zip codes with coordinates\n`);
    
    console.log('📥 Reading city/state from Excel file...');
    const excelData = await parseExcelFile(ZIP_EXCEL_PATH);
    console.log(`✅ Loaded ${excelData.length} zip codes with city/state\n`);
    
    // Merge data
    console.log('🔗 Merging data...');
    const mergedMap = new Map();
    
    // First, add all zip codes from zip.txt (with coordinates)
    for (const [zip, coords] of zipCoordsMap.entries()) {
      mergedMap.set(zip, {
        zip,
        city: null,
        state: null,
        latitude: coords.lat,
        longitude: coords.lng,
      });
    }
    
    // Then, update with city/state from Excel where available
    let updated = 0;
    for (const excelRow of excelData) {
      if (mergedMap.has(excelRow.zip)) {
        const existing = mergedMap.get(excelRow.zip);
        existing.city = excelRow.city || existing.city;
        existing.state = excelRow.state || existing.state;
        updated++;
      } else {
        // Zip code in Excel but not in zip.txt - add it anyway (will have null coords)
        mergedMap.set(excelRow.zip, {
          zip: excelRow.zip,
          city: excelRow.city,
          state: excelRow.state,
          latitude: null,
          longitude: null,
        });
      }
    }
    
    const mergedData = Array.from(mergedMap.values());
    console.log(`✅ Merged ${mergedData.length} zip codes (${updated} updated with city/state)\n`);
    
    // Show sample data
    const withAllData = mergedData.filter(z => z.city && z.state && z.latitude && z.longitude);
    console.log('📝 Sample data (with all fields):');
    for (let i = 0; i < Math.min(3, withAllData.length); i++) {
      const sample = withAllData[i];
      console.log(`   ${sample.zip}: ${sample.city}, ${sample.state} (${sample.latitude}, ${sample.longitude})`);
    }
    console.log('');
    
    // Clear existing data
    console.log('🗑️  Clearing existing zip codes...');
    try {
      await fetchFromSupabase('zip_codes?zip=neq.', 'DELETE');
      console.log('✅ Cleared existing data\n');
    } catch (error) {
      console.warn('⚠️  Warning: Could not clear existing data:', error.message);
      console.log('   Continuing with insert...\n');
    }
    
    // Insert in batches
    const batchSize = 1000;
    let inserted = 0;
    let errors = 0;
    
    console.log('💾 Inserting zip codes into Supabase...');
    console.log(`   Processing ${mergedData.length} zip codes in batches of ${batchSize}\n`);
    
    for (let i = 0; i < mergedData.length; i += batchSize) {
      const batch = mergedData.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(mergedData.length / batchSize);
      
      try {
        await fetchFromSupabase('zip_codes', 'POST', batch);
        inserted += batch.length;
      } catch (error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          inserted += batch.length;
        } else {
          console.warn(`⚠️  Batch ${batchNum} failed, inserting individually...`);
          for (const row of batch) {
            try {
              await fetchFromSupabase('zip_codes', 'POST', row);
              inserted++;
            } catch (singleError) {
              if (singleError.message.includes('duplicate') || singleError.message.includes('unique')) {
                // Skip duplicates
              } else {
                console.error(`   Error inserting zip ${row.zip}: ${singleError.message}`);
                errors++;
              }
            }
          }
        }
      }
      
      if (batchNum % 10 === 0 || batchNum === totalBatches) {
        const progress = ((i + batch.length) / mergedData.length * 100).toFixed(1);
        console.log(`   Progress: ${progress}% (${inserted} inserted, ${errors} errors)`);
      }
    }
    
    console.log(`\n✅ Successfully inserted ${inserted} zip codes into Supabase!`);
    if (errors > 0) {
      console.log(`⚠️  ${errors} zip codes had errors`);
    }
    
    // Show statistics
    const withCoords = mergedData.filter(z => z.latitude && z.longitude).length;
    const withCityState = mergedData.filter(z => z.city && z.state).length;
    const withAll = mergedData.filter(z => z.city && z.state && z.latitude && z.longitude).length;
    
    console.log(`\n📊 Statistics:`);
    console.log(`   Total zip codes: ${mergedData.length}`);
    console.log(`   With coordinates: ${withCoords}`);
    console.log(`   With city/state: ${withCityState}`);
    console.log(`   Complete (all fields): ${withAll}`);
    console.log('\n🎉 Zip code population complete!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('xlsx')) {
      console.error('\n💡 To install the xlsx library, run:');
      console.error('   cd web && npm install xlsx');
    }
    process.exit(1);
  }
}

// Run the script
populateZipCodes().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
