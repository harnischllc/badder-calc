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

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

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
  try {
    const result = await pool.query(
      `INSERT INTO players (name, player_id, season, position, war, fwar, bwar, wrc_plus, salary) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       ON CONFLICT (player_id, season) 
       DO UPDATE SET name = $1, position = $4, war = $5, fwar = $6, bwar = $7, wrc_plus = $8, salary = $9
       RETURNING *`,
      [name, player_id, season, position, war, fwar, bwar, wrc_plus, salary]
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
  try {
    const result = await pool.query(
      `UPDATE players 
       SET name = $1, player_id = $2, season = $3, position = $4, war = $5, fwar = $6, bwar = $7, wrc_plus = $8, salary = $9
       WHERE id = $10
       RETURNING *`,
      [name, player_id, season, position, war, fwar, bwar, wrc_plus, salary, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

app.delete('/api/players/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM players WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

// Bulk import players
app.post('/api/players/bulk', async (req, res) => {
  const { players } = req.body;
  try {
    const results = [];
    for (const player of players) {
      const result = await pool.query(
        `INSERT INTO players (name, player_id, season, position, war, fwar, bwar, wrc_plus, salary) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (player_id, season) 
         DO UPDATE SET name = $1, position = $4, war = $5, fwar = $6, bwar = $7, wrc_plus = $8, salary = $9
         RETURNING *`,
        [player.name, player.playerId, player.season, player.position || '', player.war, player.fwar, player.bwar, player.wrcPlus, player.salary]
      );
      results.push(result.rows[0]);
    }
    res.json({ imported: results.length });
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
  try {
    const result = await pool.query(
      `INSERT INTO teams (team_name, season, total_payroll, active_payroll, team_war) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (team_name, season) 
       DO UPDATE SET total_payroll = $3, active_payroll = $4, team_war = $5
       RETURNING *`,
      [team_name, season, total_payroll, active_payroll, team_war]
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
  try {
    const result = await pool.query(
      `UPDATE teams 
       SET team_name = $1, season = $2, total_payroll = $3, active_payroll = $4, team_war = $5
       WHERE id = $6
       RETURNING *`,
      [team_name, season, total_payroll, active_payroll, team_war, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

app.delete('/api/teams/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM teams WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// Bulk import teams
app.post('/api/teams/bulk', async (req, res) => {
  const { teams } = req.body;
  try {
    const results = [];
    for (const team of teams) {
      const result = await pool.query(
        `INSERT INTO teams (team_name, season, total_payroll, active_payroll, team_war) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (team_name, season) 
         DO UPDATE SET total_payroll = $3, active_payroll = $4, team_war = $5
         RETURNING *`,
        [team.teamName, team.season, team.totalPayroll, team.activePayroll, team.teamWar]
      );
      results.push(result.rows[0]);
    }
    res.json({ imported: results.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to import teams' });
  }
});

// Search endpoints
app.get('/api/search/players', async (req, res) => {
  const { q, season } = req.query;
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
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
