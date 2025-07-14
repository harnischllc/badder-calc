# Admin Dashboard - WAR Value Calculator

## Overview
The Admin Dashboard provides a comprehensive interface for managing player and team data for the WAR Value Calculator. It allows you to import, export, edit, and manage CSV files containing player statistics and team information across different seasons.

## Features

### Player Data Management
- **Import Players CSV**: Upload CSV files with player data
- **Export Players CSV**: Download current player data as CSV
- **Add Player**: Manually add individual players
- **Edit Players**: Inline editing of player data
- **Delete Players**: Remove players from the database
- **Season Tracking**: Track player performance across multiple seasons

### Team Data Management
- **Import Teams CSV**: Upload CSV files with team data
- **Export Teams CSV**: Download current team data as CSV
- **Add Team**: Manually add individual teams
- **Edit Teams**: Inline editing of team data
- **Delete Teams**: Remove teams from the database
- **Season Tracking**: Track team performance across multiple seasons

### Data Persistence
- All data is stored locally in your browser's localStorage
- Data persists between sessions
- Export functionality to backup your data

## CSV Format Requirements

### Players CSV Format
Your CSV file should include the following columns:
```csv
name,playerId,season,war,fwar,bwar,wrcPlus,salary
```

**Column Descriptions:**
- `name`: Player's full name (required)
- `playerId`: MLB Player ID (required)
- `season`: Season year (required, e.g., 2024, 2023)
- `war`: Wins Above Replacement (numeric)
- `fwar`: FanGraphs WAR (numeric)
- `bwar`: Baseball Reference WAR (numeric)
- `wrcPlus`: Weighted Runs Created Plus (numeric)
- `salary`: Player salary in millions of dollars (numeric)

### Teams CSV Format
Your CSV file should include the following columns:
```csv
teamName,season,totalPayroll,activePayroll,teamWar
```

**Column Descriptions:**
- `teamName`: Team name (required)
- `season`: Season year (required, e.g., 2024, 2023)
- `totalPayroll`: Total team payroll in millions of dollars (numeric)
- `activePayroll`: Active roster payroll in millions of dollars (numeric)
- `teamWar`: Total team WAR (numeric)

## Sample Files
- `sample_players.csv`: Contains sample player data for testing (2024 season)
- `sample_teams.csv`: Contains sample team data for testing (2024 season)

## Usage Instructions

### Accessing the Admin Dashboard
1. Navigate to the WAR Value Calculator application
2. Click the "Admin" link in the navigation bar
3. You'll be taken to the admin dashboard

### Importing Data
1. Click the "Import [Players/Teams] CSV" button
2. Select your CSV file
3. The data will be automatically parsed and loaded
4. A success message will confirm the import

### Exporting Data
1. Click the "Export [Players/Teams] CSV" button
2. The file will automatically download to your computer
3. Use this to backup your data or share with others

### Editing Data
1. Click directly on any field in the data table
2. Make your changes
3. Data is automatically saved as you type

### Adding New Records
1. Click the "Add [Player/Team]" button
2. Fill in the required fields (season defaults to current year)
3. Data is automatically saved

### Deleting Records
1. Click the trash icon next to any record
2. The record will be immediately deleted
3. A confirmation message will appear

### Clearing All Data
1. Click the "Clear All Data" button at the bottom
2. Confirm the action in the popup dialog
3. All data will be permanently deleted

## Data Validation
- Player imports require at least a name, player ID, and season
- Team imports require at least a team name and season
- Season field accepts years between 1900-2100
- Numeric fields are automatically converted and default to 0 if invalid
- Empty or invalid rows are automatically filtered out

## Multi-Season Data Management
- Each player/team record is tied to a specific season
- You can import data for multiple seasons in the same CSV
- The dashboard displays all seasons together for easy comparison
- Export includes all seasons in a single CSV file

## Browser Compatibility
- Modern browsers with localStorage support
- Chrome, Firefox, Safari, Edge recommended
- Data is stored locally and will not sync across devices

## Security Notes
- All data is stored locally in your browser
- No data is sent to external servers
- Export your data regularly to prevent loss
- Clear browser data will remove all stored information

## Troubleshooting

### Import Issues
- Ensure your CSV file has the correct column headers
- Check that required fields (name/playerId/season for players, teamName/season for teams) are present
- Verify numeric fields contain valid numbers
- Ensure season field contains valid years (1900-2100)
- Try opening the CSV in a text editor to check for formatting issues

### Export Issues
- Ensure you have data to export (tables should not be empty)
- Check your browser's download settings
- Try refreshing the page if the export button is disabled

### Data Loss
- Export your data regularly as a backup
- Check browser storage settings if data disappears
- Clear browser cache carefully as it may remove localStorage data

## Future Enhancements
- Database integration for persistent storage
- User authentication and access control
- Advanced filtering and search capabilities
- Season-based filtering and comparison tools
- Bulk editing operations
- Data validation rules and constraints
- API integration with MLB data sources
- Historical data analysis and trends 