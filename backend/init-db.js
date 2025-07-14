const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        player_id VARCHAR(50) NOT NULL,
        season INTEGER NOT NULL,
        position VARCHAR(10),
        war DECIMAL(4,1) DEFAULT 0,
        fwar DECIMAL(4,1) DEFAULT 0,
        bwar DECIMAL(4,1) DEFAULT 0,
        wrc_plus DECIMAL(5,1) DEFAULT 0,
        salary DECIMAL(6,1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(player_id, season)
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        team_name VARCHAR(255) NOT NULL,
        season INTEGER NOT NULL,
        total_payroll DECIMAL(6,1) DEFAULT 0,
        active_payroll DECIMAL(6,1) DEFAULT 0,
        team_war DECIMAL(4,1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team_name, season)
      )
    `);
    
    console.log('Database initialized!');
  } catch (err) {
    console.error('Database init error:', err);
  } finally {
    await pool.end();
  }
}

initDB();
