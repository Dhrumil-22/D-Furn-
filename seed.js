const { Pool } = require('pg');

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  await pool.query(`
    INSERT INTO "Product" ("itemName", "itemCode", "physicalStock", "websiteSync", "updatedAt") 
    VALUES 
    ('Test Chair', 'TC-01', 50, false, NOW()),
    ('Test Table', 'TT-02', 20, false, NOW())
  `);
  
  console.log('Seeded products directly via pg');
  process.exit(0);
}

seed();
