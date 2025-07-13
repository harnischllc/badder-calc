# 🏟️ MLB Contract WAR Calculator - Complete Setup Guide

You now have a comprehensive MLB database that combines FanGraphs WAR data, Spotrac salary information, and Statcast performance metrics! Here's how to get everything running:

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd statcast-api
npm install
```

### 2. Set Up Database
```bash
npm run setup
```

This will:
- Create all database tables and views
- Import your FanGraphs data (2023-2025)
- Import your Spotrac contract data
- Import your Statcast performance data
- Match players across all data sources

### 3. Start the API
```bash
npm start
```

Your API will be running at `http://localhost:4000`

## 📊 What You Now Have

### **Comprehensive Player Data**
- **WAR Statistics** from FanGraphs (2023-2025)
- **Contract Information** from Spotrac (salaries, AAV, signing bonuses)
- **Performance Metrics** from Statcast (launch speed, exit velocity, etc.)

### **Smart Data Integration**
- Automatic player matching across all sources
- Historical data tracking
- Contract value analysis
- Team-based queries

## 🔍 API Endpoints You Can Use

### Search Players
```bash
# Search by name
curl "http://localhost:4000/api/players?name=Judge"

# Get detailed player info
curl "http://localhost:4000/api/players/592450"
```

### Rankings
```bash
# Top players by WAR
curl "http://localhost:4000/api/players/top/war?limit=10"

# Top players by salary
curl "http://localhost:4000/api/players/top/salary?limit=10"

# Best contract value (WAR per million)
curl "http://localhost:4000/api/analysis/contract-value?limit=10"
```

### Team Data
```bash
# All Yankees players
curl "http://localhost:4000/api/teams/NYY/players"
```

### Database Stats
```bash
# Check your data
curl "http://localhost:4000/api/stats"
```

## 🎯 Perfect for Your WAR Calculator

Your frontend can now:
- **Auto-fill WAR** from FanGraphs data
- **Auto-fill salary** from Spotrac contracts
- **Show performance metrics** from Statcast
- **Calculate contract value** (WAR per dollar)
- **Compare players** across multiple seasons

## 🔧 Troubleshooting

### If CSV files aren't found:
Make sure your files are in the correct locations:
```
CSV/
├── FanGraphs/
│   ├── 2023-fangraphs-leaderboards.csv
│   ├── 2024-fangraphs-leaderboards.csv
│   └── 2025-fangraphs-leaderboards.csv
├── Batters Contracts.csv
└── savant_data_23-25.csv
```

### If database connection fails:
Check your `.env` file has the correct `DATABASE_URL`

### If import has errors:
Check the console output for specific error messages. The script will continue even if some records fail.

## 📈 Next Steps

1. **Test the API** with the endpoints above
2. **Update your frontend** to use the new comprehensive data
3. **Add new features** like:
   - Contract value analysis
   - Team comparisons
   - Historical trends
   - Performance projections

## 🎉 You're All Set!

You now have one of the most comprehensive MLB player databases available, combining the best data sources in baseball analytics. Your WAR calculator will have real, up-to-date data for both performance metrics and contract information!

**Happy coding! ⚾** 