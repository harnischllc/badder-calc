# MLB Contract WAR Calculator - Backend API

This backend API provides comprehensive MLB player data combining FanGraphs WAR statistics, Spotrac contract information, and Statcast performance metrics.

## Data Sources

- **FanGraphs**: WAR, wRC+, wOBA, and other advanced metrics (2023-2025)
- **Spotrac**: Contract information, salaries, and signing bonuses
- **Statcast**: Detailed performance metrics including launch speed, exit velocity, etc.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `statcast-api` directory:

```env
DATABASE_URL=your_postgres_connection_string
NODE_ENV=development
PORT=4000
```

### 3. Database Setup

Run the complete database setup (creates schema and imports all data):

```bash
npm run setup
```

Or run individual steps:

```bash
# Just create the database schema
node setup-database.js

# Just import data (if schema already exists)
npm run import
```

### 4. Start the API

```bash
npm start
```

The API will be available at `http://localhost:4000`

## API Endpoints

### Player Search
- `GET /api/players?name={player_name}` - Search players by name
- `GET /api/players/{player_id}` - Get comprehensive player details

### Rankings
- `GET /api/players/top/war?limit=20&season=2024` - Top players by WAR
- `GET /api/players/top/salary?limit=20` - Top players by salary (AAV)

### Team Data
- `GET /api/teams/{team}/players` - Get all players for a team

### Analysis
- `GET /api/analysis/contract-value?limit=20` - Best contract value (WAR per million)

### Statistics
- `GET /api/stats` - Database statistics

## Database Schema

### Tables
- `players` - Master player information
- `fangraphs_stats` - WAR and advanced metrics
- `contracts` - Salary and contract data
- `statcast_stats` - Detailed performance metrics

### Views
- `player_summary` - Combined player data with latest stats

## Data Import Process

The import script processes three CSV files:

1. **FanGraphs Data**: `CSV/FanGraphs/{year}-fangraphs-leaderboards.csv`
2. **Spotrac Contracts**: `CSV/Batters Contracts.csv`
3. **Statcast Data**: `CSV/savant_data_23-25.csv`

### Import Features
- Automatic player ID matching across data sources
- Duplicate handling with upsert operations
- Data cleaning and validation
- Error logging for failed imports

## Example API Responses

### Player Search
```json
[
  {
    "id": 1,
    "player_id": 621566,
    "name": "Matt Olson",
    "position": "1B",
    "team": "ATL",
    "latest_war": 4.2,
    "latest_wrc_plus": 135,
    "current_aav": 21000000,
    "contract_total_value": 168000000,
    "avg_launch_speed": 92.9,
    "hardhit_percent": 52.3
  }
]
```

### Player Details
```json
{
  "player": { /* player summary */ },
  "fangraphs_history": [ /* historical WAR data */ ],
  "contracts": [ /* contract information */ ],
  "statcast_history": [ /* performance metrics */ ]
}
```

## Troubleshooting

### Common Issues

1. **CSV files not found**: Ensure CSV files are in the correct directory structure
2. **Database connection errors**: Check your DATABASE_URL in .env
3. **Import errors**: Check console output for specific error messages

### Data Validation

After import, verify data with:

```bash
curl http://localhost:4000/api/stats
```

This will show record counts for each table.

## Development

### Adding New Data Sources

1. Add new table to `database-schema.sql`
2. Create import function in `import-data.js`
3. Update `player_summary` view
4. Add new API endpoints in `index.js`

### Performance Optimization

- Database indexes are created automatically
- Use the `player_summary` view for efficient queries
- Consider pagination for large result sets 