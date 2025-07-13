const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Helper function to clean and parse data
function cleanValue(value) {
  if (!value || value === '' || value === 'null') return null;
  return value.toString().trim();
}

function parseMoney(value) {
  if (!value) return null;
  // Remove $ and commas, convert to number
  return parseFloat(value.replace(/[$,]/g, ''));
}

function parseNumber(value) {
  if (!value) return null;
  return parseFloat(value);
}

function parseInteger(value) {
  if (!value) return null;
  return parseInt(value);
}

// Import FanGraphs data
async function importFanGraphsData() {
  console.log('Importing FanGraphs data...');
  
  const filePath = '../CSV/FanGraphs/fangraphs-leaderboards.csv';
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  const results = [];
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Skip rows with missing MLBAMID
        if (!data.MLBAMID || data.MLBAMID === '' || data.MLBAMID === 'null') {
          console.log(`Skipping row with missing MLBAMID: ${data.Name}`);
          return;
        }
        
        results.push({
          name: cleanValue(data.Name),
          name_ascii: cleanValue(data.NameASCII),
          team: cleanValue(data.Team),
          player_id: parseInteger(data.MLBAMID),
          season: parseInteger(data.Season),
          war: parseNumber(data.WAR),
          wrc_plus: parseNumber(data['wRC+']),
          woba: parseNumber(data.wOBA),
          xwoba: parseNumber(data.xwOBA),
          iso: parseNumber(data.ISO),
          babip: parseNumber(data.BABIP),
          avg: parseNumber(data.AVG),
          obp: parseNumber(data.OBP),
          slg: parseNumber(data.SLG),
          home_runs: parseInteger(data.HR),
          runs: parseInteger(data.R),
          rbi: parseInteger(data.RBI),
          stolen_bases: parseInteger(data.SB),
          walks: parseInteger(data.BB),
          strikeouts: parseInteger(data.SO),
          walk_percent: parseNumber(data['BB%']),
          strikeout_percent: parseNumber(data['K%'])
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });
  
  console.log(`Processing ${results.length} records from FanGraphs`);
  
  // Insert players first (only those with valid player_id)
  const validPlayers = results.filter(record => record.player_id && record.name);
  console.log(`Found ${validPlayers.length} players with valid MLBAMID`);
  
  for (const record of validPlayers) {
    try {
      await pool.query(`
        INSERT INTO players (player_id, name, name_ascii, team, position)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (player_id) DO UPDATE SET
          name = EXCLUDED.name,
          name_ascii = EXCLUDED.name_ascii,
          team = EXCLUDED.team,
          updated_at = CURRENT_TIMESTAMP
      `, [record.player_id, record.name, record.name_ascii, record.team, null]);
    } catch (error) {
      console.error(`Error inserting player ${record.name}:`, error.message);
    }
  }
  
  // Insert FanGraphs stats (only for valid players)
  for (const record of validPlayers) {
    try {
      await pool.query(`
        INSERT INTO fangraphs_stats (
          player_id, season, team, war, wrc_plus, woba, xwoba, iso, babip, 
          avg, obp, slg, home_runs, runs, rbi, stolen_bases, walks, strikeouts, 
          walk_percent, strikeout_percent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        ON CONFLICT (player_id, season) DO UPDATE SET
          team = EXCLUDED.team,
          war = EXCLUDED.war,
          wrc_plus = EXCLUDED.wrc_plus,
          woba = EXCLUDED.woba,
          xwoba = EXCLUDED.xwoba,
          iso = EXCLUDED.iso,
          babip = EXCLUDED.babip,
          avg = EXCLUDED.avg,
          obp = EXCLUDED.obp,
          slg = EXCLUDED.slg,
          home_runs = EXCLUDED.home_runs,
          runs = EXCLUDED.runs,
          rbi = EXCLUDED.rbi,
          stolen_bases = EXCLUDED.stolen_bases,
          walks = EXCLUDED.walks,
          strikeouts = EXCLUDED.strikeouts,
          walk_percent = EXCLUDED.walk_percent,
          strikeout_percent = EXCLUDED.strikeout_percent
      `, [
        record.player_id, record.season, record.team, record.war,
        record.wrc_plus, record.woba, record.xwoba, record.iso,
        record.babip, record.avg, record.obp, record.slg,
        record.home_runs, record.runs, record.rbi,
        record.stolen_bases, record.walks, record.strikeouts,
        record.walk_percent, record.strikeout_percent
      ]);
    } catch (error) {
      console.error(`Error inserting FanGraphs stats for ${record.name}:`, error.message);
    }
  }
  
  console.log(`Completed importing FanGraphs data`);
}

// Import Spotrac contract data
async function importSpotracData() {
  console.log('Importing Spotrac contract data...');
  
  const filePath = '../CSV/Batters Contracts.csv';
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  const results = [];
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push({
          player_name: cleanValue(data.Player),
          position: cleanValue(data.Pos),
          team: cleanValue(data['Team                     Currently With']),
          age_at_signing: parseInteger(data['Age                     At Signing']),
          contract_start: parseInteger(data.Start),
          contract_end: parseInteger(data.End),
          years: parseInteger(data.Yrs),
          total_value: parseMoney(data.Value),
          aav: parseMoney(data.AAV),
          signing_bonus: parseMoney(data['Signing Bonus']),
          two_year_cash: parseMoney(data['2-Year Cash']),
          three_year_cash: parseMoney(data['3-Year Cash'])
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });
  
  console.log(`Processing ${results.length} contract records`);
  
  // Insert contract data
  for (const record of results) {
    if (record.player_name) {
      try {
        // Try to find player by name
        const playerResult = await pool.query(
          'SELECT player_id FROM players WHERE LOWER(name) = LOWER($1) OR LOWER(name_ascii) = LOWER($1)',
          [record.player_name]
        );
        
        let player_id = null;
        if (playerResult.rows.length > 0) {
          player_id = playerResult.rows[0].player_id;
        }
        
        await pool.query(`
          INSERT INTO contracts (
            player_id, player_name, position, team, age_at_signing,
            contract_start, contract_end, years, total_value, aav,
            signing_bonus, two_year_cash, three_year_cash
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          player_id, record.player_name, record.position, record.team,
          record.age_at_signing, record.contract_start, record.contract_end,
          record.years, record.total_value, record.aav, record.signing_bonus,
          record.two_year_cash, record.three_year_cash
        ]);
      } catch (error) {
        console.error(`Error inserting contract for ${record.player_name}:`, error.message);
      }
    }
  }
  
  console.log('Completed importing Spotrac contract data');
}

// Import Statcast data
async function importStatcastData() {
  console.log('Importing Statcast data...');
  
  const filePath = '../CSV/savant_data_23-25.csv';
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  const results = [];
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push({
          player_id: parseInteger(data.player_id),
          player_name: cleanValue(data.player_name),
          season: 2024, // Default to 2024, you may want to extract from filename or data
          ba: parseNumber(data.ba),
          iso: parseNumber(data.iso),
          babip: parseNumber(data.babip),
          slg: parseNumber(data.slg),
          woba: parseNumber(data.woba),
          xwoba: parseNumber(data.xwoba),
          xba: parseNumber(data.xba),
          hits: parseInteger(data.hits),
          at_bats: parseInteger(data.abs),
          launch_speed: parseNumber(data.launch_speed),
          launch_angle: parseNumber(data.launch_angle),
          plate_appearances: parseInteger(data.pa),
          home_runs: parseInteger(data.hrs),
          strikeouts: parseInteger(data.so),
          walks: parseInteger(data.bb),
          hardhit_percent: parseNumber(data.hardhit_percent),
          barrels_per_pa_percent: parseNumber(data.barrels_per_pa_percent)
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });
  
  console.log(`Processing ${results.length} Statcast records`);
  
  // Insert players first
  for (const record of results) {
    if (record.player_id && record.player_name) {
      try {
        await pool.query(`
          INSERT INTO players (player_id, name, name_ascii)
          VALUES ($1, $2, $3)
          ON CONFLICT (player_id) DO UPDATE SET
            name = EXCLUDED.name,
            updated_at = CURRENT_TIMESTAMP
        `, [record.player_id, record.player_name, record.player_name]);
      } catch (error) {
        console.error(`Error inserting player ${record.player_name}:`, error.message);
      }
    }
  }
  
  // Insert Statcast stats
  for (const record of results) {
    if (record.player_id) {
      try {
        await pool.query(`
          INSERT INTO statcast_stats (
            player_id, season, ba, iso, babip, slg, woba, xwoba, xba, 
            hits, at_bats, launch_speed, launch_angle, plate_appearances,
            home_runs, strikeouts, walks, hardhit_percent, barrels_per_pa_percent
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
          ON CONFLICT (player_id, season) DO UPDATE SET
            ba = EXCLUDED.ba,
            iso = EXCLUDED.iso,
            babip = EXCLUDED.babip,
            slg = EXCLUDED.slg,
            woba = EXCLUDED.woba,
            xwoba = EXCLUDED.xwoba,
            xba = EXCLUDED.xba,
            hits = EXCLUDED.hits,
            at_bats = EXCLUDED.at_bats,
            launch_speed = EXCLUDED.launch_speed,
            launch_angle = EXCLUDED.launch_angle,
            plate_appearances = EXCLUDED.plate_appearances,
            home_runs = EXCLUDED.home_runs,
            strikeouts = EXCLUDED.strikeouts,
            walks = EXCLUDED.walks,
            hardhit_percent = EXCLUDED.hardhit_percent,
            barrels_per_pa_percent = EXCLUDED.barrels_per_pa_percent
        `, [
          record.player_id, record.season, record.ba, record.iso, record.babip, 
          record.slg, record.woba, record.xwoba, record.xba, record.hits, 
          record.at_bats, record.launch_speed, record.launch_angle, 
          record.plate_appearances, record.home_runs, record.strikeouts, 
          record.walks, record.hardhit_percent, record.barrels_per_pa_percent
        ]);
      } catch (error) {
        console.error(`Error inserting Statcast stats for ${record.player_name}:`, error.message);
      }
    }
  }
  
  console.log('Completed importing Statcast data');
}

// Main import function
async function importAllData() {
  try {
    console.log('Starting data import...');
    
    // Import data in order
    await importFanGraphsData();
    await importSpotracData();
    await importStatcastData();
    
    console.log('Data import completed successfully!');
    
    // Print summary
    const playerCount = await pool.query('SELECT COUNT(*) FROM players');
    const fangraphsCount = await pool.query('SELECT COUNT(*) FROM fangraphs_stats');
    const contractCount = await pool.query('SELECT COUNT(*) FROM contracts');
    const statcastCount = await pool.query('SELECT COUNT(*) FROM statcast_stats');
    
    console.log('\nImport Summary:');
    console.log(`Players: ${playerCount.rows[0].count}`);
    console.log(`FanGraphs records: ${fangraphsCount.rows[0].count}`);
    console.log(`Contract records: ${contractCount.rows[0].count}`);
    console.log(`Statcast records: ${statcastCount.rows[0].count}`);
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await pool.end();
  }
}

// Run the import if this file is executed directly
if (require.main === module) {
  importAllData();
}

module.exports = { importAllData, importFanGraphsData, importSpotracData, importStatcastData }; 