/**
 * Script to update missing latitude/longitude in zip_codes table
 * Uses zip.txt file to fill in missing coordinates
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Path to zip coordinates file
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

async function updateMissingCoordinates() {
  console.log('🚀 Starting update of missing coordinates...\n');
  
  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required');
    console.error('\nFor local Supabase, get the service_role key by running:');
    console.error('  supabase status');
    process.exit(1);
  }
  
  // Check if file exists
  if (!fs.existsSync(ZIP_TXT_PATH)) {
    console.error(`❌ Error: Zip coordinates file not found at: ${ZIP_TXT_PATH}`);
    process.exit(1);
  }
  
  try {
    // Load coordinates from zip.txt
    console.log('📥 Loading coordinates from zip.txt...');
    const zipCoordsMap = parseZipTxt(ZIP_TXT_PATH);
    console.log(`✅ Loaded ${zipCoordsMap.size} zip codes with coordinates\n`);
    
    // Find rows with missing coordinates (with pagination)
    console.log('🔍 Finding zip codes with missing coordinates...');
    const baseUrl = SUPABASE_URL;
    let missingCoords = [];
    let offset = 0;
    const limit = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const url = `${baseUrl}/rest/v1/zip_codes?select=zip,city,state&or=(latitude.is.null,longitude.is.null)&limit=${limit}&offset=${offset}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const batch = await response.json();
      missingCoords = missingCoords.concat(batch);
      
      if (batch.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }
    
    if (!Array.isArray(missingCoords)) {
      throw new Error('Unexpected response format from Supabase');
    }
    
    console.log(`✅ Found ${missingCoords.length} zip codes with missing coordinates\n`);
    
    if (missingCoords.length === 0) {
      console.log('🎉 All zip codes already have coordinates!');
      return;
    }
    
    // Show sample of missing coordinates
    console.log('📝 Sample of zip codes missing coordinates:');
    for (let i = 0; i < Math.min(5, missingCoords.length); i++) {
      const row = missingCoords[i];
      console.log(`   ${row.zip}: ${row.city || 'N/A'}, ${row.state || 'N/A'}`);
    }
    console.log('');
    
    // Debug: Check if we can find any matches
    console.log('🔍 Checking for matches in zip.txt...');
    let testMatches = 0;
    for (let i = 0; i < Math.min(100, missingCoords.length); i++) {
      const normalizedZip = String(missingCoords[i].zip).replace(/\D/g, '').padStart(5, '0').substring(0, 5);
      if (zipCoordsMap.has(normalizedZip)) {
        testMatches++;
      }
    }
    console.log(`   Found ${testMatches} matches in first 100 missing zip codes\n`);
    
    // Update coordinates
    let updated = 0;
    let notFound = 0;
    let errors = 0;
    
    console.log('💾 Updating coordinates...\n');
    
    for (let i = 0; i < missingCoords.length; i++) {
      const row = missingCoords[i];
      // Normalize zip code to match format in zip.txt
      const normalizedZip = String(row.zip).replace(/\D/g, '').padStart(5, '0').substring(0, 5);
      const coords = zipCoordsMap.get(normalizedZip);
      
      if (coords) {
        try {
          // Update the row with coordinates
          await fetchFromSupabase(`zip_codes?zip=eq.${row.zip}`, 'PATCH', {
            latitude: coords.lat,
            longitude: coords.lng,
          });
          updated++;
        } catch (error) {
          console.error(`   Error updating ${row.zip}: ${error.message}`);
          errors++;
        }
      } else {
        notFound++;
        // Only log first few to avoid spam
        if (notFound <= 10) {
          console.log(`   ⚠️  Zip ${row.zip} (${row.city || 'N/A'}, ${row.state || 'N/A'}) not found in zip.txt`);
        }
      }
      
      if ((i + 1) % 100 === 0 || i === missingCoords.length - 1) {
        const progress = ((i + 1) / missingCoords.length * 100).toFixed(1);
        console.log(`   Progress: ${progress}% (${updated} updated, ${notFound} not found, ${errors} errors)`);
      }
    }
    
    console.log(`\n✅ Successfully updated ${updated} zip codes with coordinates!`);
    if (notFound > 0) {
      console.log(`⚠️  ${notFound} zip codes not found in zip.txt (coordinates unavailable)`);
    }
    if (errors > 0) {
      console.log(`⚠️  ${errors} zip codes had errors during update`);
    }
    
    // Show final statistics
    console.log('\n📊 Final statistics:');
    const allZipsUrl = `${SUPABASE_URL}/rest/v1/zip_codes?select=zip`;
    const allZipsResponse = await fetch(allZipsUrl, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    const allZips = await allZipsResponse.json();
    
    const withCoordsUrl = `${SUPABASE_URL}/rest/v1/zip_codes?select=zip&and=(latitude.not.is.null,longitude.not.is.null)`;
    const withCoordsResponse = await fetch(withCoordsUrl, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    const withCoords = await withCoordsResponse.json();
    
    if (Array.isArray(allZips) && Array.isArray(withCoords)) {
      console.log(`   Total zip codes: ${allZips.length}`);
      console.log(`   With coordinates: ${withCoords.length}`);
      console.log(`   Missing coordinates: ${allZips.length - withCoords.length}`);
    }
    
    console.log('\n🎉 Update complete!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
updateMissingCoordinates().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
