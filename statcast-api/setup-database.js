const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  try {
    console.log('Setting up database schema...');
    
    // Read and execute the schema file
    const schemaSQL = fs.readFileSync('./database-schema.sql', 'utf8');
    await pool.query(schemaSQL);
    
    console.log('Database schema created successfully!');
    
    // Import all data
    console.log('\nStarting data import...');
    const { importAllData } = require('./import-data');
    await importAllData();
    
    console.log('\nDatabase setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await pool.end();
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase }; 