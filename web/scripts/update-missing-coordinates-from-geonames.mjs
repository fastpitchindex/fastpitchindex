/**
 * Script to update missing coordinates using GeoNames data
 * Downloads GeoNames US zip codes and updates missing coordinates in Supabase
 */

import { downloadGeonamesData } from './download-geonames-zip.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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

async function updateMissingCoordinates() {
  console.log('🚀 Starting update of missing coordinates using GeoNames...\n');
  
  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required');
    process.exit(1);
  }
  
  try {
    // Download GeoNames data
    const geonamesData = await downloadGeonamesData();
    const geonamesMap = new Map();
    for (const row of geonamesData) {
      geonamesMap.set(row.zip, row);
    }
    console.log(`📋 Loaded ${geonamesMap.size} zip codes from GeoNames\n`);
    
    // Find rows with missing coordinates
    console.log('🔍 Finding zip codes with missing coordinates in Supabase...');
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
    
    console.log(`✅ Found ${missingCoords.length} zip codes with missing coordinates\n`);
    
    if (missingCoords.length === 0) {
      console.log('🎉 All zip codes already have coordinates!');
      return;
    }
    
    // Update coordinates
    let updated = 0;
    let notFound = 0;
    let errors = 0;
    
    console.log('💾 Updating coordinates from GeoNames data...\n');
    
    for (let i = 0; i < missingCoords.length; i++) {
      const row = missingCoords[i];
      const normalizedZip = String(row.zip).replace(/\D/g, '').padStart(5, '0').substring(0, 5);
      const geonamesRow = geonamesMap.get(normalizedZip);
      
      if (geonamesRow) {
        try {
          await fetchFromSupabase(`zip_codes?zip=eq.${row.zip}`, 'PATCH', {
            latitude: geonamesRow.latitude,
            longitude: geonamesRow.longitude,
          });
          updated++;
        } catch (error) {
          console.error(`   Error updating ${row.zip}: ${error.message}`);
          errors++;
        }
      } else {
        notFound++;
        if (notFound <= 5) {
          console.log(`   ⚠️  Zip ${row.zip} (${row.city || 'N/A'}, ${row.state || 'N/A'}) not found in GeoNames`);
        }
      }
      
      if ((i + 1) % 100 === 0 || i === missingCoords.length - 1) {
        const progress = ((i + 1) / missingCoords.length * 100).toFixed(1);
        console.log(`   Progress: ${progress}% (${updated} updated, ${notFound} not found, ${errors} errors)`);
      }
    }
    
    console.log(`\n✅ Successfully updated ${updated} zip codes with coordinates from GeoNames!`);
    if (notFound > 0) {
      console.log(`⚠️  ${notFound} zip codes not found in GeoNames data`);
    }
    if (errors > 0) {
      console.log(`⚠️  ${errors} zip codes had errors during update`);
    }
    
    console.log('\n🎉 Update complete!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('adm-zip')) {
      console.error('\n💡 To install the required library, run:');
      console.error('   cd web && npm install adm-zip');
    }
    process.exit(1);
  }
}

// Run the script
updateMissingCoordinates().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
