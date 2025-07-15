const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database tables on startup
async function initDatabase() {
  try {
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
    
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// Call init on startup
initDatabase();

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

// Input validation helpers
const validatePlayer = (player) => {
  const errors = [];
  
  if (!player.name || player.name.trim().length === 0) {
    errors.push('Player name is required');
  }
  
  if (!player.player_id || player.player_id.trim().length === 0) {
    errors.push('Player ID is required');
  }
  
  const season = parseInt(player.season);
  if (!season || season < 1900 || season > 2100) {
    errors.push('Valid season year is required (1900-2100)');
  }
  
  const salary = parseFloat(player.salary);
  if (salary < 0 || salary > 1000) {
    errors.push('Salary must be between 0 and 1000 million');
  }
  
  const war = parseFloat(player.war);
  if (war < -10 || war > 20) {
    errors.push('WAR must be between -10 and 20');
  }
  
  const wrcPlus = parseFloat(player.wrc_plus);
  if (wrcPlus < 0 || wrcPlus > 300) {
    errors.push('wRC+ must be between 0 and 300');
  }
  
  return errors;
};

const validateTeam = (team) => {
  const errors = [];
  
  if (!team.team_name || team.team_name.trim().length === 0) {
    errors.push('Team name is required');
  }
  
  const season = parseInt(team.season);
  if (!season || season < 1900 || season > 2100) {
    errors.push('Valid season year is required (1900-2100)');
  }
  
  const totalPayroll = parseFloat(team.total_payroll);
  if (totalPayroll < 0 || totalPayroll > 1000) {
    errors.push('Total payroll must be between 0 and 1000 million');
  }
  
  const teamWar = parseFloat(team.team_war);
  if (teamWar < 0 || teamWar > 100) {
    errors.push('Team WAR must be between 0 and 100');
  }
  
  return errors;
};

// Players endpoints
app.get('/api/players', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM players ORDER BY season DESC, name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

app.post('/api/players', async (req, res) => {
  const { name, player_id, season, position, war, fwar, bwar, wrc_plus, salary } = req.body;
  
  // Validate inputs
  const errors = validatePlayer(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  try {
    // Check for duplicate first
    const existingPlayer = await pool.query(
      'SELECT id FROM players WHERE player_id = $1 AND season = $2',
      [player_id, season]
    );
    
    if (existingPlayer.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Duplicate player', 
        message: `Player with ID ${player_id} already exists for season ${season}` 
      });
    }
    
    const result = await pool.query(
      `INSERT INTO players (name, player_id, season, position, war, fwar, bwar, wrc_plus, salary) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, player_id, season, position || '', war || 0, fwar || 0, bwar || 0, wrc_plus || 0, salary || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add player' });
  }
});

app.put('/api/players/:id', async (req, res) => {
  const { id } = req.params;
  const { name, player_id, season, position, war, fwar, bwar, wrc_plus, salary } = req.body;
  
  // Validate inputs
  const errors = validatePlayer(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  try {
    // Check for duplicate (excluding current record)
    const existingPlayer = await pool.query(
      'SELECT id FROM players WHERE player_id = $1 AND season = $2 AND id != $3',
      [player_id, season, id]
    );
    
    if (existingPlayer.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Duplicate player', 
        message: `Another player with ID ${player_id} already exists for season ${season}` 
      });
    }
    
    const result = await pool.query(
      `UPDATE players 
       SET name = $1, player_id = $2, season = $3, position = $4, war = $5, fwar = $6, bwar = $7, wrc_plus = $8, salary = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [name, player_id, season, position || '', war || 0, fwar || 0, bwar || 0, wrc_plus || 0, salary || 0, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

app.delete('/api/players/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM players WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

// Bulk import players
app.post('/api/players/bulk', async (req, res) => {
  const { players } = req.body;
  
  if (!Array.isArray(players)) {
    return res.status(400).json({ error: 'Players must be an array' });
  }
  
  try {
    const results = [];
    const skipped = [];
    
    for (const player of players) {
      // Validate each player
      const errors = validatePlayer({
        ...player,
        player_id: player.playerId || player.player_id,
        wrc_plus: player.wrcPlus || player.wrc_plus
      });
      
      if (errors.length > 0) {
        skipped.push({ player: player.name, errors });
        continue;
      }
      
      try {
        const result = await pool.query(
          `INSERT INTO players (name, player_id, season, position, war, fwar, bwar, wrc_plus, salary) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
           ON CONFLICT (player_id, season) 
           DO UPDATE SET name = $1, position = $4, war = $5, fwar = $6, bwar = $7, wrc_plus = $8, salary = $9, updated_at = CURRENT_TIMESTAMP
           RETURNING *`,
          [
            player.name, 
            player.playerId || player.player_id, 
            player.season, 
            player.position || '', 
            player.war || 0, 
            player.fwar || 0, 
            player.bwar || 0, 
            player.wrcPlus || player.wrc_plus || 0, 
            player.salary || 0
          ]
        );
        results.push(result.rows[0]);
      } catch (err) {
        console.error('Error importing player:', player.name, err);
        skipped.push({ player: player.name, error: 'Database error' });
      }
    }
    
    res.json({ 
      imported: results.length, 
      skipped: skipped.length,
      details: skipped.length > 0 ? skipped : undefined
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to import players' });
  }
});

// Teams endpoints
app.get('/api/teams', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teams ORDER BY season DESC, team_name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

app.post('/api/teams', async (req, res) => {
  const { team_name, season, total_payroll, active_payroll, team_war } = req.body;
  
  // Validate inputs
  const errors = validateTeam(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  try {
    const result = await pool.query(
      `INSERT INTO teams (team_name, season, total_payroll, active_payroll, team_war) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (team_name, season) 
       DO UPDATE SET total_payroll = $3, active_payroll = $4, team_war = $5, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [team_name, season, total_payroll || 0, active_payroll || 0, team_war || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add team' });
  }
});

app.put('/api/teams/:id', async (req, res) => {
  const { id } = req.params;
  const { team_name, season, total_payroll, active_payroll, team_war } = req.body;
  
  // Validate inputs
  const errors = validateTeam(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  try {
    const result = await pool.query(
      `UPDATE teams 
       SET team_name = $1, season = $2, total_payroll = $3, active_payroll = $4, team_war = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [team_name, season, total_payroll || 0, active_payroll || 0, team_war || 0, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

app.delete('/api/teams/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM teams WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// Bulk import teams
app.post('/api/teams/bulk', async (req, res) => {
  const { teams } = req.body;
  
  if (!Array.isArray(teams)) {
    return res.status(400).json({ error: 'Teams must be an array' });
  }
  
  try {
    const results = [];
    const skipped = [];
    
    for (const team of teams) {
      // Validate each team
      const errors = validateTeam({
        ...team,
        team_name: team.teamName || team.team_name,
        total_payroll: team.totalPayroll || team.total_payroll,
        active_payroll: team.activePayroll || team.active_payroll,
        team_war: team.teamWar || team.team_war
      });
      
      if (errors.length > 0) {
        skipped.push({ team: team.teamName || team.team_name, errors });
        continue;
      }
      
      try {
        const result = await pool.query(
          `INSERT INTO teams (team_name, season, total_payroll, active_payroll, team_war) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (team_name, season) 
           DO UPDATE SET total_payroll = $3, active_payroll = $4, team_war = $5, updated_at = CURRENT_TIMESTAMP
           RETURNING *`,
          [
            team.teamName || team.team_name, 
            team.season, 
            team.totalPayroll || team.total_payroll || 0, 
            team.activePayroll || team.active_payroll || 0, 
            team.teamWar || team.team_war || 0
          ]
        );
        results.push(result.rows[0]);
      } catch (err) {
        console.error('Error importing team:', team.teamName || team.team_name, err);
        skipped.push({ team: team.teamName || team.team_name, error: 'Database error' });
      }
    }
    
    res.json({ 
      imported: results.length, 
      skipped: skipped.length,
      details: skipped.length > 0 ? skipped : undefined
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to import teams' });
  }
});

// Search endpoints
app.get('/api/search/players', async (req, res) => {
  const { q, season } = req.query;
  
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }
  
  try {
    let query = 'SELECT * FROM players WHERE LOWER(name) LIKE LOWER($1)';
    let params = [`%${q}%`];
    
    if (season) {
      query += ' AND season = $2';
      params.push(season);
    }
    
    query += ' ORDER BY season DESC, name ASC LIMIT 10';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to search players' });
  }
});

app.get('/api/search/teams', async (req, res) => {
  const { q, season } = req.query;
  
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }
  
  try {
    let query = 'SELECT * FROM teams WHERE LOWER(team_name) LIKE LOWER($1)';
    let params = [`%${q}%`];
    
    if (season) {
      query += ' AND season = $2';
      params.push(season);
    }
    
    query += ' ORDER BY season DESC, team_name ASC LIMIT 10';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to search teams' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
