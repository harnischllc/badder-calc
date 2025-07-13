-- Comprehensive MLB Player Database Schema
-- Combines FanGraphs WAR data, Spotrac salary data, and Statcast performance data

-- Players table (master player information)
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    player_id INTEGER UNIQUE NOT NULL, -- MLBAM ID
    name VARCHAR(255) NOT NULL,
    name_ascii VARCHAR(255),
    position VARCHAR(50),
    team VARCHAR(32),
    age INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FanGraphs stats table (WAR and advanced metrics)
CREATE TABLE IF NOT EXISTS fangraphs_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(player_id),
    season INTEGER NOT NULL,
    team VARCHAR(32),
    games INTEGER,
    plate_appearances INTEGER,
    war DECIMAL(4,2), -- Wins Above Replacement
    wrc_plus DECIMAL(6,2), -- Weighted Runs Created Plus
    woba DECIMAL(4,3), -- Weighted On-Base Average
    xwoba DECIMAL(4,3), -- Expected Weighted On-Base Average
    iso DECIMAL(4,3), -- Isolated Power
    babip DECIMAL(4,3), -- Batting Average on Balls In Play
    avg DECIMAL(4,3), -- Batting Average
    obp DECIMAL(4,3), -- On-Base Percentage
    slg DECIMAL(4,3), -- Slugging Percentage
    home_runs INTEGER,
    runs INTEGER,
    rbi INTEGER,
    stolen_bases INTEGER,
    walks INTEGER,
    strikeouts INTEGER,
    walk_percent DECIMAL(5,2),
    strikeout_percent DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, season)
);

-- Spotrac salary/contract data
CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(player_id),
    player_name VARCHAR(255),
    position VARCHAR(50),
    team VARCHAR(32),
    age_at_signing INTEGER,
    contract_start INTEGER,
    contract_end INTEGER,
    years INTEGER,
    total_value DECIMAL(15,2), -- Total contract value in dollars
    aav DECIMAL(12,2), -- Average Annual Value
    signing_bonus DECIMAL(12,2),
    two_year_cash DECIMAL(12,2),
    three_year_cash DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Statcast performance data (detailed metrics)
CREATE TABLE IF NOT EXISTS statcast_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(player_id),
    season INTEGER,
    total_pitches INTEGER,
    pitch_percent DECIMAL(5,2),
    ba DECIMAL(4,3), -- Batting Average
    iso DECIMAL(4,3), -- Isolated Power
    babip DECIMAL(4,3), -- Batting Average on Balls In Play
    slg DECIMAL(4,3), -- Slugging Percentage
    woba DECIMAL(4,3), -- Weighted On-Base Average
    xwoba DECIMAL(4,3), -- Expected Weighted On-Base Average
    xba DECIMAL(4,3), -- Expected Batting Average
    hits INTEGER,
    at_bats INTEGER,
    launch_speed DECIMAL(4,1), -- Average Launch Speed
    launch_angle DECIMAL(4,1), -- Average Launch Angle
    spin_rate INTEGER,
    velocity DECIMAL(4,1),
    effective_speed DECIMAL(4,2),
    whiffs INTEGER,
    swings INTEGER,
    takes INTEGER,
    plate_appearances INTEGER,
    balls_in_play INTEGER,
    singles INTEGER,
    doubles INTEGER,
    triples INTEGER,
    home_runs INTEGER,
    strikeouts INTEGER,
    strikeout_percent DECIMAL(5,2),
    walks INTEGER,
    walk_percent DECIMAL(5,2),
    hardhit_percent DECIMAL(5,2),
    barrels_per_bbe_percent DECIMAL(5,2),
    barrels_per_pa_percent DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, season)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team);
CREATE INDEX IF NOT EXISTS idx_fangraphs_season ON fangraphs_stats(season);
CREATE INDEX IF NOT EXISTS idx_fangraphs_war ON fangraphs_stats(war);
CREATE INDEX IF NOT EXISTS idx_contracts_team ON contracts(team);
CREATE INDEX IF NOT EXISTS idx_contracts_aav ON contracts(aav);
CREATE INDEX IF NOT EXISTS idx_statcast_season ON statcast_stats(season);

-- Create a view for combined player data
CREATE OR REPLACE VIEW player_summary AS
SELECT 
    p.id,
    p.player_id,
    p.name,
    p.position,
    p.team,
    p.age,
    -- Latest FanGraphs stats
    fg.war as latest_war,
    fg.wrc_plus as latest_wrc_plus,
    fg.woba as latest_woba,
    fg.season as latest_fangraphs_season,
    -- Latest contract info
    c.aav as current_aav,
    c.total_value as contract_total_value,
    c.contract_end as contract_end_year,
    -- Latest Statcast stats
    sc.launch_speed as avg_launch_speed,
    sc.hardhit_percent as hardhit_percent,
    sc.barrels_per_pa_percent as barrels_percent
FROM players p
LEFT JOIN LATERAL (
    SELECT * FROM fangraphs_stats 
    WHERE player_id = p.player_id 
    ORDER BY season DESC 
    LIMIT 1
) fg ON true
LEFT JOIN LATERAL (
    SELECT * FROM contracts 
    WHERE player_id = p.player_id 
    ORDER BY contract_start DESC 
    LIMIT 1
) c ON true
LEFT JOIN LATERAL (
    SELECT * FROM statcast_stats 
    WHERE player_id = p.player_id 
    ORDER BY season DESC 
    LIMIT 1
) sc ON true;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_players_updated_at ON players;
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 