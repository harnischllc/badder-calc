# MLB Contract WAR Calculator

A React-based web application that analyzes MLB player contracts and team payrolls from a performance vs. salary perspective. Calculate $/WAR (dollars per Wins Above Replacement) to determine if contracts represent good value.

🔗 **Live Demo**: [https://contract-war-calculator.onrender.com/](https://contract-war-calculator.onrender.com/)

## Features

### 📊 Three Calculator Modes

#### 1. Individual WAR Value
- Input player salary and WAR
- Select WAR type (fWAR, bWAR, or average)
- Optional position-adjusted analysis
- Categorizes contracts from "Historic Bargain" to "Poor Value"

#### 2. wRC+ Value
- Convert wRC+ to estimated WAR value
- Calculate surplus value based on offensive performance
- Position-specific comparisons
- Efficiency ratings vs. league average hitters

#### 3. Team Analysis
- Analyze entire team payroll efficiency
- Calculate projected wins based on team WAR
- Compare actual vs. expected performance
- Support for total or active payroll

### 🎯 Key Features
- **Position-Adjusted Calculations**: Compare players to their positional averages
- **Example Contracts**: Quick-fill buttons with real player/team examples
- **Calculation History**: Track your recent calculations (stored locally)
- **URL Sharing**: Share calculations via URL parameters
- **Mobile Responsive**: Fully optimized for all devices
- **Dark Theme**: Sleek black background with red accents matching BadderSports brand

## Tech Stack

- **Frontend**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Render.com (auto-deploys from main branch)

## How It Works

### Individual Player Calculations
- **Cost per WAR**: `Salary / WAR`
- **Contract Efficiency**: `(WAR × $740K) / Salary`
- **Surplus Value**: `(WAR × $8M) - Salary`

### Team Calculations
- **Cost per WAR**: `Payroll / Team WAR`
- **Expected WAR**: `Payroll / $8M`
- **Efficiency Rating**: `Actual WAR / Expected WAR`
- **Projected Wins**: `(Team WAR / 43) × 81`

### Value Categories
**Individual ($/WAR)**:
- Historic Bargain: < $2M
- High Value: < $6M
- Average: < $10M
- Poor Value: ≥ $10M or negative WAR

**Team Efficiency**:
- Elite: < $3M per WAR
- Above Average: < $6M per WAR
- Average: < $10M per WAR
- Below Average: < $15M per WAR
- Inefficient: ≥ $15M per WAR

## Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/harnischllc/badder-calc.git

# Navigate to project directory
cd badder-calc

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Project Structure
```
src/
  components/        # React components
  hooks/            # Custom React hooks
  utils/            # Calculation logic and constants
  App.jsx           # Main application component
  main.jsx          # React entry point
  index.css         # Global styles
```

## Deployment

The app automatically deploys to Render.com when changes are pushed to the main branch.

- **Live URL**: https://contract-war-calculator.onrender.com/
- **Platform**: Render Static Site
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

## Future Roadmap

### Phase 1: Data Integration
- Live salary data from Spotrac API
- Real-time WAR updates from FanGraphs/Baseball Reference
- Historical data analysis

### Phase 2: Enhanced Features
- Multi-year contract analysis
- Player search with autocomplete
- Contract predictions using ML
- Trade value calculator

### Phase 3: Expansion
- NBA (using VORP, BPM, Win Shares)
- NFL (using Approximate Value)
- NHL (using Goals Above Replacement)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

**Note**: This project uses GitHub web UI for development. Please provide copy-paste ready solutions for any code changes.

## Data Sources

- **Salary Data**: [Spotrac](https://www.spotrac.com/mlb/)
- **WAR Data**: [FanGraphs](https://www.fangraphs.com/), [Baseball Reference](https://www.baseball-reference.com/)
- **wRC+ Data**: [FanGraphs](https://www.fangraphs.com/leaders/offense)

## About

Created for [BadderSports.com](https://baddersports.com) | Check out [@swingbadderpodcast](https://www.youtube.com/channel/UCvkFXHG5mZyQfsmmf7aU5lQ)

## License

This project is proprietary software for BadderSports.com. All rights reserved.
