/**
 * Script to delete zip codes that don't have coordinates
 */

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

async function deleteZipsWithoutCoordinates() {
  console.log('🚀 Finding and deleting zip codes without coordinates...\n');
  
  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required');
    process.exit(1);
  }
  
  try {
    // Find rows with missing coordinates
    console.log('🔍 Finding zip codes without coordinates...');
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
    
    console.log(`✅ Found ${missingCoords.length} zip codes without coordinates\n`);
    
    if (missingCoords.length === 0) {
      console.log('🎉 All zip codes have coordinates! Nothing to delete.');
      return;
    }
    
    // Show what will be deleted
    console.log('📝 Zip codes to be deleted:');
    for (let i = 0; i < Math.min(10, missingCoords.length); i++) {
      const row = missingCoords[i];
      console.log(`   ${row.zip}: ${row.city || 'N/A'}, ${row.state || 'N/A'}`);
    }
    if (missingCoords.length > 10) {
      console.log(`   ... and ${missingCoords.length - 10} more`);
    }
    console.log('');
    
    // Delete them
    console.log('🗑️  Deleting zip codes without coordinates...');
    let deleted = 0;
    let errors = 0;
    
    for (let i = 0; i < missingCoords.length; i++) {
      const row = missingCoords[i];
      try {
        await fetchFromSupabase(`zip_codes?zip=eq.${row.zip}`, 'DELETE');
        deleted++;
      } catch (error) {
        console.error(`   Error deleting ${row.zip}: ${error.message}`);
        errors++;
      }
      
      if ((i + 1) % 10 === 0 || i === missingCoords.length - 1) {
        const progress = ((i + 1) / missingCoords.length * 100).toFixed(1);
        console.log(`   Progress: ${progress}% (${deleted} deleted, ${errors} errors)`);
      }
    }
    
    console.log(`\n✅ Successfully deleted ${deleted} zip codes without coordinates!`);
    if (errors > 0) {
      console.log(`⚠️  ${errors} zip codes had errors during deletion`);
    }
    
    console.log('\n🎉 Deletion complete!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
deleteZipsWithoutCoordinates().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
