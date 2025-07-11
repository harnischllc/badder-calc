# MLB Contract WAR Calculator (Beta)

**⚠️ BETA VERSION**: This application is in active development. Features may change, and bugs may exist.

A React-based web application that analyzes MLB player contracts and team payrolls from a performance vs. salary perspective.

🔗 **Live Beta**: [https://contract-war-calculator.onrender.com/](https://contract-war-calculator.onrender.com/)

## What is this?

Ever wondered if your team overpaid for that free agent? Or found an absolute steal in a trade? This calculator answers those questions by comparing what teams pay versus what they get in return, measured in WAR (Wins Above Replacement).

The tool transforms complex baseball analytics into simple answers: Is this contract good value or not?

## Features

### 🧮 Three Calculator Modes

1. **WAR Value Calculator** - Analyze individual player contracts
   - Choose between fWAR, bWAR, or average
   - Get instant categorization from "Historic Bargain" to "Poor Value"
   - See surplus value in dollars

2. **wRC+ Value Calculator** - Focus on offensive production
   - Convert hitting performance to dollar value
   - Perfect for evaluating DHs and corner positions
   - Position-adjusted comparisons

3. **Team Analysis** - Evaluate entire payrolls
   - See which teams spend efficiently
   - Project full-season wins
   - Compare actual vs. expected performance

### 🎯 Additional Features

- **Position Adjustments**: Compare players to their positional peers
- **Example Contracts**: One-click examples from each value category
- **Calculation History**: Track your last 10 calculations
- **Share via URL**: Send specific calculations to friends
- **Mobile Optimized**: Works great on phones and tablets
- **Offline Support**: Progressive Web App capabilities

## How It Works

The calculator uses straightforward formulas based on current market rates:

**For Individual Players:**
- Cost per WAR = Salary ÷ WAR
- Market rate ≈ $8M per WAR (2024)
- Surplus Value = (WAR × $8M) - Salary

**For Teams:**
- Projected Wins = (Team WAR ÷ 43) × 81
- A .500 team typically has ~43 WAR

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Hosting**: Render.com
- **PWA**: Service Worker for offline use

## Local Development

```bash
# Clone the repository
git clone https://github.com/harnischllc/badder-calc.git
cd badder-calc

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Roadmap

### Coming Soon (2025)
- [ ] Live salary data integration
- [ ] Real-time WAR updates
- [ ] Player search with autocomplete
- [ ] Multi-year contract analysis

### Future Plans
- [ ] Contract prediction models
- [ ] Trade value calculator
- [ ] NBA, NFL, and NHL versions
- [ ] API for developers

## Contributing & Feedback

This is a beta release and we'd love your feedback! Please report bugs or suggest features:

- **Issues**: [GitHub Issues](https://github.com/harnischllc/badder-calc/issues)
- **Email**: Contact via [BadderSports.com](https://baddersports.com)

## Data Sources

Currently using 2024 static data. Links to source data:
- [Spotrac](https://www.spotrac.com/mlb/) - Salary information
- [FanGraphs](https://www.fangraphs.com) - fWAR data
- [Baseball Reference](https://www.baseball-reference.com) - bWAR data

## License & Ownership

© 2024–2025 Harnisch LLC. All rights reserved.

This project is developed by **Harnisch LLC** in partnership with the BadderSports network, including SwingBadder.

The code is viewable for transparency and educational purposes. All rights to commercial use, resale, branding, and derivative works remain with Harnisch LLC and BadderSports. Unauthorized use of the SwingBadder or BadderSports names or likenesses is prohibited.

For licensing inquiries: eric@ericharnisch.com

## Disclaimer

This tool is for entertainment and educational purposes. Calculations are estimates based on publicly available data and simplified models. Always consider full context when evaluating contracts.

## Credits

Created for [BadderSports.com](https://baddersports.com) | Follow [@swingbadderpodcast](https://www.youtube.com/channel/UCvkFXHG5mZyQfsmmf7aU5lQ)

---

**Version**: 0.3.0-beta | **Last Updated**: July 2025
