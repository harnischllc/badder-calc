require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Root route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'MLB Contract WAR Calculator API',
    version: '1.0.0',
    endpoints: {
      'Player Search': '/api/players?name=player_name',
      'Player Details': '/api/players/{player_id}',
      'Top Players by WAR': '/api/players/top/war',
      'Top Players by Salary': '/api/players/top/salary',
      'Team Players': '/api/teams/{team}/players',
      'Contract Analysis': '/api/analysis/contract-value',
      'Database Stats': '/api/stats'
    }
  });
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Search players by name (comprehensive data)
app.get('/api/players', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Missing name parameter' });
  try {
    const result = await pool.query(
      `SELECT * FROM player_summary WHERE LOWER(name) LIKE LOWER($1) ORDER BY latest_war DESC NULLS LAST LIMIT 20`,
      [`%${name}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get comprehensive player details by player_id
app.get('/api/players/:playerId', async (req, res) => {
  const { playerId } = req.params;
  try {
    // Get player summary
    const summaryResult = await pool.query(
      `SELECT * FROM player_summary WHERE player_id = $1`,
      [playerId]
    );
    
    if (summaryResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    const player = summaryResult.rows[0];
    
    // Get historical FanGraphs stats
    const fangraphsResult = await pool.query(
      `SELECT * FROM fangraphs_stats WHERE player_id = $1 ORDER BY season DESC`,
      [playerId]
    );
    
    // Get contract information
    const contractResult = await pool.query(
      `SELECT * FROM contracts WHERE player_id = $1 ORDER BY contract_start DESC`,
      [playerId]
    );
    
    // Get Statcast stats
    const statcastResult = await pool.query(
      `SELECT * FROM statcast_stats WHERE player_id = $1 ORDER BY season DESC`,
      [playerId]
    );
    
    res.json({
      player: player,
      fangraphs_history: fangraphsResult.rows,
      contracts: contractResult.rows,
      statcast_history: statcastResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get top players by WAR
app.get('/api/players/top/war', async (req, res) => {
  const { limit = 20, season } = req.query;
  try {
    let query = `
      SELECT * FROM player_summary 
      WHERE latest_war IS NOT NULL
    `;
    const params = [];
    
    if (season) {
      query += ` AND latest_fangraphs_season = $1`;
      params.push(season);
    }
    
    query += ` ORDER BY latest_war DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get top players by salary (AAV)
app.get('/api/players/top/salary', async (req, res) => {
  const { limit = 20 } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM player_summary 
       WHERE current_aav IS NOT NULL 
       ORDER BY current_aav DESC 
       LIMIT $1`,
      [parseInt(limit)]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get players by team
app.get('/api/teams/:team/players', async (req, res) => {
  const { team } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM player_summary 
       WHERE LOWER(team) = LOWER($1) 
       ORDER BY latest_war DESC NULLS LAST`,
      [team]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get contract analysis (players with high WAR but low salary)
app.get('/api/analysis/contract-value', async (req, res) => {
  const { limit = 20 } = req.query;
  try {
    const result = await pool.query(
      `SELECT *, 
              (latest_war / NULLIF(current_aav, 0)) * 1000000 as war_per_million
       FROM player_summary 
       WHERE latest_war IS NOT NULL 
         AND current_aav IS NOT NULL 
         AND current_aav > 0
       ORDER BY war_per_million DESC 
       LIMIT $1`,
      [parseInt(limit)]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get database statistics
app.get('/api/stats', async (req, res) => {
  try {
    const playerCount = await pool.query('SELECT COUNT(*) FROM players');
    const fangraphsCount = await pool.query('SELECT COUNT(*) FROM fangraphs_stats');
    const contractCount = await pool.query('SELECT COUNT(*) FROM contracts');
    const statcastCount = await pool.query('SELECT COUNT(*) FROM statcast_stats');
    
    res.json({
      players: parseInt(playerCount.rows[0].count),
      fangraphs_records: parseInt(fangraphsCount.rows[0].count),
      contract_records: parseInt(contractCount.rows[0].count),
      statcast_records: parseInt(statcastCount.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all players for admin dashboard
app.get('/api/players', async (req, res) => {
  const { name, limit = 20 } = req.query;
  try {
    let query = 'SELECT * FROM player_summary';
    const params = [];
    
    if (name) {
      query += ' WHERE LOWER(name) LIKE LOWER($1)';
      params.push(`%${name}%`);
    }
    
    query += ' ORDER BY latest_war DESC NULLS LAST';
    
    if (limit && limit !== '1000') {
      query += ` LIMIT $${params.length + 1}`;
      params.push(parseInt(limit));
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a player and all associated data
app.delete('/api/players/:playerId', async (req, res) => {
  const { playerId } = req.params;
  try {
    // Delete in order to respect foreign key constraints
    await pool.query('DELETE FROM fangraphs_stats WHERE player_id = $1', [playerId]);
    await pool.query('DELETE FROM statcast_stats WHERE player_id = $1', [playerId]);
    await pool.query('DELETE FROM contracts WHERE player_id = $1', [playerId]);
    await pool.query('DELETE FROM players WHERE player_id = $1', [playerId]);
    
    res.json({ message: 'Player and all associated data deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on port ${port}`)); 