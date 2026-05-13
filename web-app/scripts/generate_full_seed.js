const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TABLES = [
  'vehicle_templates',
  'vehicle_units',
  'vehicle_template_images',
  'booking_extras',
  'customers',
  'rentals',
  'contact_messages',
  'newsletter_subscriptions'
];

async function generateSeed() {
  console.log('🚀 Starting Data Export...');
  let sql = `-- FULL DATA SEED BACKUP\n-- Generated: ${new Date().toISOString()}\n\n`;
  sql += 'SET session_replication_role = \'replica\'; -- Disable triggers and FK checks temporarily\n\n';

  for (const table of TABLES) {
    console.log(`📦 Exporting table: ${table}...`);
    const { data, error } = await supabase.from(table).select('*');
    
    if (error) {
      console.error(`❌ Error fetching ${table}:`, error.message);
      continue;
    }

    if (!data || data.length === 0) {
      console.log(`⚠️ No data for ${table}.`);
      continue;
    }

    sql += `-- Data for table: ${table}\n`;
    sql += `DELETE FROM ${table};\n`; // Clear existing to avoid unique constraint errors during restore

    // Split into chunks if too many rows
    const columns = Object.keys(data[0]);
    
    data.forEach(row => {
      const values = columns.map(col => {
        const val = row[col];
        if (val === null) return 'NULL';
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
        return val;
      });
      sql += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
    });
    sql += '\n';
  }

  sql += 'SET session_replication_role = \'origin\'; -- Re-enable triggers\n';

  const outputPath = path.join(__dirname, '../supabase/seed_data_backup_20260513.sql');
  fs.writeFileSync(outputPath, sql);
  console.log(`✅ Success! Seed file generated at: ${outputPath}`);
}

generateSeed().catch(err => {
  console.error('💥 Fatal Error:', err);
  process.exit(1);
});
